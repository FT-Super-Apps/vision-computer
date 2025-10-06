"""
Pydantic models untuk API request/response
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from enum import Enum

class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class ProcessingStage(str, Enum):
    UPLOADING = "uploading"
    OCR = "ocr"
    EXTRACTING = "extracting"
    MATCHING = "matching"
    PARAPHRASING = "paraphrasing"
    APPLYING = "applying"
    DONE = "done"

class JobCreateResponse(BaseModel):
    job_id: str
    status: JobStatus
    message: str

class JobStatusResponse(BaseModel):
    job_id: str
    status: JobStatus
    stage: Optional[ProcessingStage] = None
    progress: Optional[int] = Field(None, ge=0, le=100, description="Progress percentage")
    message: Optional[str] = None
    error: Optional[str] = None
    result: Optional[Dict] = None

class JobResultStats(BaseModel):
    flagged_texts_found: int
    matched_texts: int
    paraphrased_texts: int
    applied_texts: int
    processing_time_seconds: float

class JobResult(BaseModel):
    job_id: str
    status: JobStatus
    stats: Optional[JobResultStats] = None
    output_file: Optional[str] = None
    download_url: Optional[str] = None

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    job_id: Optional[str] = None
