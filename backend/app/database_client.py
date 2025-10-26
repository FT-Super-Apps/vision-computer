"""
Database Client for Next.js API Integration
Handles communication between Python backend and Next.js database
Created by devnolife
"""

import os
import requests
from typing import Dict, Any, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class DatabaseClient:
    """Client for interacting with Next.js database via API"""

    def __init__(self):
        self.nextjs_url = os.getenv("NEXTJS_API_URL", "http://localhost:3000")
        self.api_key = os.getenv("API_KEY")
        self.timeout = 30

    def _make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Make HTTP request to Next.js API"""
        url = f"{self.nextjs_url}{endpoint}"

        headers = {
            "Content-Type": "application/json",
        }

        # Add API key if available
        if self.api_key:
            headers["X-API-Key"] = self.api_key

        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=self.timeout)
            elif method == "POST":
                response = requests.post(
                    url,
                    json=data,
                    headers=headers,
                    timeout=self.timeout
                )
            elif method == "PUT":
                response = requests.put(
                    url,
                    json=data,
                    headers=headers,
                    timeout=self.timeout
                )
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")

            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            logger.error(f"Database API request failed: {e}")
            return {"success": False, "error": str(e)}

    def create_document(
        self,
        user_id: str,
        title: str,
        original_filename: str,
        file_size: int,
        file_type: str,
        upload_path: Optional[str] = None,
        page_count: Optional[int] = None,
        word_count: Optional[int] = None,
        character_count: Optional[int] = None,
    ) -> Optional[str]:
        """
        Create a new document record
        Returns document ID if successful, None otherwise
        """
        data = {
            "userId": user_id,
            "title": title,
            "originalFilename": original_filename,
            "fileSize": file_size,
            "fileType": file_type,
            "uploadPath": upload_path,
            "pageCount": page_count,
            "wordCount": word_count,
            "characterCount": character_count,
        }

        result = self._make_request("POST", "/api/documents/create", data)

        if result.get("success"):
            document_id = result.get("data", {}).get("id")
            logger.info(f"Document created: {document_id}")
            return document_id
        else:
            logger.error(f"Failed to create document: {result.get('error')}")
            return None

    def save_analysis_result(
        self,
        document_id: str,
        flag_count: int = 0,
        flag_types: Optional[list] = None,
        ocr_text: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        similarity_score: Optional[float] = None,
        plagiarism_report: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """
        Save document analysis results
        Returns True if successful, False otherwise
        """
        data = {
            "flagCount": flag_count,
            "flagTypes": flag_types or [],
            "ocrText": ocr_text,
            "metadata": metadata or {},
            "similarityScore": similarity_score,
            "plagiarismReport": plagiarism_report,
        }

        result = self._make_request(
            "POST",
            f"/api/documents/{document_id}/analysis",
            data
        )

        if result.get("success"):
            logger.info(f"Analysis saved for document: {document_id}")
            return True
        else:
            logger.error(f"Failed to save analysis: {result.get('error')}")
            return False

    def save_bypass_result(
        self,
        document_id: str,
        user_id: str,
        strategy: str,
        status: str = "COMPLETED",
        output_path: Optional[str] = None,
        output_filename: Optional[str] = None,
        output_file_size: Optional[int] = None,
        flags_removed: Optional[int] = None,
        processing_time: Optional[int] = None,
        success_rate: Optional[float] = None,
        error_message: Optional[str] = None,
        python_api_response: Optional[Dict[str, Any]] = None,
        configuration: Optional[Dict[str, Any]] = None,
    ) -> Optional[str]:
        """
        Save bypass processing result
        Returns bypass history ID if successful, None otherwise
        """
        data = {
            "documentId": document_id,
            "userId": user_id,
            "strategy": strategy,
            "status": status,
            "outputPath": output_path,
            "outputFilename": output_filename,
            "outputFileSize": output_file_size,
            "flagsRemoved": flags_removed,
            "processingTime": processing_time,
            "successRate": success_rate,
            "errorMessage": error_message,
            "pythonApiResponse": python_api_response or {},
            "configuration": configuration or {},
        }

        result = self._make_request("POST", "/api/bypass/result", data)

        if result.get("success"):
            bypass_id = result.get("data", {}).get("id")
            logger.info(f"Bypass result saved: {bypass_id}")
            return bypass_id
        else:
            logger.error(f"Failed to save bypass result: {result.get('error')}")
            return None

    def update_document_status(
        self,
        document_id: str,
        status: str
    ) -> bool:
        """
        Update document status
        Statuses: PENDING, ANALYZING, ANALYZED, PROCESSING, COMPLETED, FAILED
        """
        data = {"status": status}

        result = self._make_request(
            "PUT",
            f"/api/documents/{document_id}/status",
            data
        )

        if result.get("success"):
            logger.info(f"Document status updated: {document_id} -> {status}")
            return True
        else:
            logger.error(f"Failed to update status: {result.get('error')}")
            return False


# Global instance
db_client = DatabaseClient()
