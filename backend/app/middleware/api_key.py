"""
API Key Authentication Middleware
Created by devnolife

Middleware untuk validasi API key pada setiap request ke Python API
"""

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class APIKeyMiddleware(BaseHTTPMiddleware):
    """
    Middleware untuk memvalidasi API key dari header request
    """
    
    def __init__(self, app, exclude_paths: list = None):
        super().__init__(app)
        self.api_key = os.getenv("API_KEY")
        
        # Paths yang tidak memerlukan API key (public endpoints)
        self.exclude_paths = exclude_paths or [
            "/",
            "/health",
            "/docs",
            "/openapi.json",
            "/redoc",
        ]
        
        if not self.api_key:
            print("⚠️  WARNING: API_KEY not set in environment variables!")
            print("⚠️  API will accept all requests without authentication!")
    
    async def dispatch(self, request: Request, call_next):
        """
        Validate API key untuk setiap request
        """
        # Skip validation untuk excluded paths
        if request.url.path in self.exclude_paths:
            return await call_next(request)
        
        # Skip validation jika API_KEY tidak di-set (development mode)
        if not self.api_key:
            response = await call_next(request)
            response.headers["X-API-Auth"] = "disabled"
            return response
        
        # Get API key dari header
        api_key_header = request.headers.get("X-API-Key")
        
        # Validate API key
        if not api_key_header:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={
                    "success": False,
                    "error": "Missing API Key",
                    "message": "API key is required. Please provide 'X-API-Key' header.",
                    "documentation": "See API documentation for authentication details"
                },
                headers={"WWW-Authenticate": "ApiKey"}
            )
        
        if api_key_header != self.api_key:
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={
                    "success": False,
                    "error": "Invalid API Key",
                    "message": "The provided API key is invalid or has been revoked.",
                    "documentation": "Contact administrator for valid API key"
                }
            )
        
        # API key valid, lanjutkan request
        response = await call_next(request)
        response.headers["X-API-Auth"] = "success"
        return response


def get_api_key_from_request(request: Request) -> Optional[str]:
    """
    Helper function untuk mendapatkan API key dari request
    
    Args:
        request: FastAPI Request object
    
    Returns:
        API key string atau None jika tidak ada
    """
    return request.headers.get("X-API-Key")


def verify_api_key(api_key: str) -> bool:
    """
    Verify jika API key valid
    
    Args:
        api_key: API key untuk diverifikasi
    
    Returns:
        True jika valid, False jika tidak
    """
    expected_api_key = os.getenv("API_KEY")
    if not expected_api_key:
        return True  # No API key set, allow all (dev mode)
    
    return api_key == expected_api_key
