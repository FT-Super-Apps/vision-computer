"""
FastAPI Backend untuk Turnitin Bypass System
Handles multiple concurrent requests dengan background processing
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import uuid
import json
import time
import asyncio
import sys
from pathlib import Path
from typing import Dict, Optional
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.models import (
    JobCreateResponse, JobStatusResponse, JobStatus, 
    ProcessingStage, JobResult, ErrorResponse, JobResultStats
)
from core.extractor import extract_flagged_texts
from core.matcher import match_flagged_with_docx
from core.paraphraser import categorize_and_process
from core.applier import apply_paraphrased_to_docx

# FastAPI app
app = FastAPI(
    title="Turnitin Bypass API",
    description="API untuk bypass Turnitin dengan paraphrase cerdas menggunakan IndoT5",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directories
BASE_DIR = Path(__file__).parent
UPLOAD_DIR = BASE_DIR / "api" / "uploads"
OUTPUT_DIR = BASE_DIR / "api" / "outputs"
TEMP_DIR = BASE_DIR / "api" / "temp"

for dir_path in [UPLOAD_DIR, OUTPUT_DIR, TEMP_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)

# Job storage (in-memory, bisa diganti Redis untuk production)
jobs: Dict[str, Dict] = {}

# Semaphore untuk limit concurrent processing
MAX_CONCURRENT_JOBS = 3
processing_semaphore = asyncio.Semaphore(MAX_CONCURRENT_JOBS)


def cleanup_old_files():
    """Cleanup files older than 24 hours"""
    cutoff_time = datetime.now() - timedelta(hours=24)
    
    for directory in [UPLOAD_DIR, OUTPUT_DIR, TEMP_DIR]:
        for file_path in directory.iterdir():
            if file_path.is_file():
                file_time = datetime.fromtimestamp(file_path.stat().st_mtime)
                if file_time < cutoff_time:
                    try:
                        file_path.unlink()
                    except Exception:
                        pass


async def process_job(job_id: str, pdf_path: str, docx_path: str):
    """Background task untuk process job"""
    async with processing_semaphore:
        try:
            jobs[job_id]['status'] = JobStatus.PROCESSING
            jobs[job_id]['stage'] = ProcessingStage.OCR
            jobs[job_id]['progress'] = 10
            
            start_time = time.time()
            
            # 1. Extract flagged texts
            jobs[job_id]['stage'] = ProcessingStage.EXTRACTING
            jobs[job_id]['progress'] = 20
            
            flagged_texts, ocr_pdf = extract_flagged_texts(pdf_path, str(TEMP_DIR))
            
            # 2. Match with DOCX
            jobs[job_id]['stage'] = ProcessingStage.MATCHING
            jobs[job_id]['progress'] = 40
            
            matches = match_flagged_with_docx(flagged_texts, docx_path)
            
            # 3. Paraphrase
            jobs[job_id]['stage'] = ProcessingStage.PARAPHRASING
            jobs[job_id]['progress'] = 60
            
            paraphrased = categorize_and_process(matches)
            
            # 4. Apply to DOCX
            jobs[job_id]['stage'] = ProcessingStage.APPLYING
            jobs[job_id]['progress'] = 80
            
            output_filename = f"{job_id}_bypassed.docx"
            output_path = OUTPUT_DIR / output_filename
            
            apply_stats = apply_paraphrased_to_docx(
                paraphrased,
                docx_path,
                str(output_path)
            )
            
            # Done
            jobs[job_id]['stage'] = ProcessingStage.DONE
            jobs[job_id]['progress'] = 100
            jobs[job_id]['status'] = JobStatus.COMPLETED
            
            processing_time = time.time() - start_time
            
            jobs[job_id]['result'] = {
                'output_file': output_filename,
                'stats': {
                    'flagged_texts_found': len(flagged_texts),
                    'matched_texts': len(matches),
                    'paraphrased_texts': len(paraphrased),
                    'applied_texts': apply_stats['applied'],
                    'processing_time_seconds': round(processing_time, 2)
                }
            }
            
            # Save intermediate files
            flagged_json = TEMP_DIR / f"{job_id}_flagged.json"
            matches_json = TEMP_DIR / f"{job_id}_matches.json"
            paraphrased_json = TEMP_DIR / f"{job_id}_paraphrased.json"
            
            with open(flagged_json, 'w', encoding='utf-8') as f:
                json.dump(flagged_texts, f, ensure_ascii=False, indent=2)
            
            with open(matches_json, 'w', encoding='utf-8') as f:
                json.dump(matches, f, ensure_ascii=False, indent=2)
            
            with open(paraphrased_json, 'w', encoding='utf-8') as f:
                json.dump(paraphrased, f, ensure_ascii=False, indent=2)
            
        except Exception as e:
            jobs[job_id]['status'] = JobStatus.FAILED
            jobs[job_id]['error'] = str(e)
            jobs[job_id]['progress'] = 0


@app.on_event("startup")
async def startup_event():
    """Startup tasks"""
    cleanup_old_files()


@app.get("/")
async def root():
    """Health check"""
    return {
        "status": "ok",
        "service": "Turnitin Bypass API",
        "version": "1.0.0",
        "active_jobs": len([j for j in jobs.values() if j['status'] in [JobStatus.PENDING, JobStatus.PROCESSING]]),
        "max_concurrent": MAX_CONCURRENT_JOBS
    }


@app.post("/api/v1/process", response_model=JobCreateResponse)
async def create_job(
    background_tasks: BackgroundTasks,
    pdf_file: UploadFile = File(..., description="Turnitin PDF report"),
    docx_file: UploadFile = File(..., description="Original DOCX document")
):
    """
    Upload PDF + DOCX dan mulai processing
    Returns job_id untuk tracking
    """
    
    # Validate file types
    if not pdf_file.filename.endswith('.pdf'):
        raise HTTPException(400, "PDF file must have .pdf extension")
    
    if not docx_file.filename.endswith('.docx'):
        raise HTTPException(400, "DOCX file must have .docx extension")
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Save uploaded files
    pdf_path = UPLOAD_DIR / f"{job_id}.pdf"
    docx_path = UPLOAD_DIR / f"{job_id}.docx"
    
    try:
        with open(pdf_path, 'wb') as f:
            content = await pdf_file.read()
            f.write(content)
        
        with open(docx_path, 'wb') as f:
            content = await docx_file.read()
            f.write(content)
    except Exception as e:
        raise HTTPException(500, f"Failed to save files: {str(e)}")
    
    # Create job
    jobs[job_id] = {
        'job_id': job_id,
        'status': JobStatus.PENDING,
        'stage': ProcessingStage.UPLOADING,
        'progress': 0,
        'created_at': datetime.now().isoformat(),
        'pdf_filename': pdf_file.filename,
        'docx_filename': docx_file.filename
    }
    
    # Start background processing
    background_tasks.add_task(process_job, job_id, str(pdf_path), str(docx_path))
    
    return JobCreateResponse(
        job_id=job_id,
        status=JobStatus.PENDING,
        message="Job created successfully. Processing started."
    )


@app.get("/api/v1/status/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    """Get job processing status"""
    
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    
    job = jobs[job_id]
    
    return JobStatusResponse(
        job_id=job_id,
        status=job['status'],
        stage=job.get('stage'),
        progress=job.get('progress'),
        message=job.get('message'),
        error=job.get('error'),
        result=job.get('result')
    )


@app.get("/api/v1/result/{job_id}", response_model=JobResult)
async def get_job_result(job_id: str):
    """Get job result summary"""
    
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    
    job = jobs[job_id]
    
    if job['status'] != JobStatus.COMPLETED:
        raise HTTPException(400, f"Job is {job['status']}, not completed yet")
    
    result = job.get('result', {})
    stats = result.get('stats')
    
    return JobResult(
        job_id=job_id,
        status=job['status'],
        stats=JobResultStats(**stats) if stats else None,
        output_file=result.get('output_file'),
        download_url=f"/api/v1/download/{job_id}"
    )


@app.get("/api/v1/download/{job_id}")
async def download_result(job_id: str):
    """Download bypassed DOCX file"""
    
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    
    job = jobs[job_id]
    
    if job['status'] != JobStatus.COMPLETED:
        raise HTTPException(400, f"Job is {job['status']}, not completed yet")
    
    output_filename = job['result']['output_file']
    output_path = OUTPUT_DIR / output_filename
    
    if not output_path.exists():
        raise HTTPException(404, "Output file not found")
    
    return FileResponse(
        path=output_path,
        filename=f"bypassed_{job['docx_filename']}",
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )


@app.get("/api/v1/download/{job_id}/json/{file_type}")
async def download_json(job_id: str, file_type: str):
    """
    Download intermediate JSON files
    file_type: flagged, matches, paraphrased
    """
    
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    
    if file_type not in ['flagged', 'matches', 'paraphrased']:
        raise HTTPException(400, "Invalid file_type. Must be: flagged, matches, or paraphrased")
    
    json_path = TEMP_DIR / f"{job_id}_{file_type}.json"
    
    if not json_path.exists():
        raise HTTPException(404, "JSON file not found")
    
    return FileResponse(
        path=json_path,
        filename=f"{job_id}_{file_type}.json",
        media_type="application/json"
    )


@app.delete("/api/v1/job/{job_id}")
async def delete_job(job_id: str):
    """Delete job and cleanup all related files"""
    
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    
    # Delete files
    for directory in [UPLOAD_DIR, OUTPUT_DIR, TEMP_DIR]:
        for file_path in directory.glob(f"{job_id}*"):
            try:
                file_path.unlink()
            except Exception:
                pass
    
    # Delete job record
    del jobs[job_id]
    
    return {"message": "Job deleted successfully"}


@app.get("/api/v1/jobs")
async def list_jobs():
    """List all jobs (admin endpoint)"""
    return {
        "total": len(jobs),
        "jobs": [
            {
                "job_id": job_id,
                "status": job['status'],
                "stage": job.get('stage'),
                "progress": job.get('progress'),
                "created_at": job.get('created_at')
            }
            for job_id, job in jobs.items()
        ]
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
