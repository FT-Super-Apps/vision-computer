#!/usr/bin/env python3
"""
Pydantic Models for API
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime

# ============================================================================
# REQUEST MODELS
# ============================================================================

class BypassRequest(BaseModel):
    """Request model for bypass operation"""
    filename: str
    strategy: str = Field(default="header_focused", description="Bypass strategy")
    homoglyph_density: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    invisible_density: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    flag_file: Optional[str] = Field(default=None, description="Custom flag file")

# ============================================================================
# RESPONSE MODELS
# ============================================================================

class BypassResponse(BaseModel):
    """Response model for bypass operation"""
    success: bool
    message: str
    input_file: str
    output_file: str
    strategy: str
    statistics: Dict = Field(default_factory=dict)
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "message": "Document processed successfully",
                "input_file": "original.docx",
                "output_file": "output_bypassed_20251020_123456.docx",
                "strategy": "header_focused",
                "statistics": {
                    "headers_modified": 5,
                    "phrases_modified": 10,
                    "total_modifications": 15,
                    "homoglyph_density": 0.95,
                    "invisible_density": 0.40
                },
                "timestamp": "2025-10-20T12:34:56"
            }
        }

class AnalysisResponse(BaseModel):
    """Response model for document analysis"""
    success: bool
    message: str
    filename: str
    total_paragraphs: int
    flagged_phrases: List[Dict]
    statistics: Dict = Field(default_factory=dict)
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "message": "Analysis completed",
                "filename": "original.docx",
                "total_paragraphs": 25,
                "flagged_phrases": [
                    {
                        "phrase": "B. Rumusan Masalah",
                        "category": "header",
                        "occurrences": 1
                    }
                ],
                "statistics": {
                    "total_flags": 15,
                    "headers": 5,
                    "standard_phrases": 10
                },
                "timestamp": "2025-10-20T12:34:56"
            }
        }

class ComparisonResponse(BaseModel):
    """Response model for document comparison"""
    success: bool
    message: str
    original_file: str
    bypassed_file: str
    comparison: Dict
    success_rate: float
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "message": "Comparison completed",
                "original_file": "original.docx",
                "bypassed_file": "bypassed.docx",
                "comparison": {
                    "total_flags": 15,
                    "hidden_flags": 12,
                    "still_detected": 3
                },
                "success_rate": 80.0,
                "timestamp": "2025-10-20T12:34:56"
            }
        }

# ============================================================================
# CONFIGURATION MODELS
# ============================================================================

class StrategyConfig(BaseModel):
    """Strategy configuration model"""
    name: str
    description: str
    homoglyph_density: float
    invisible_density: float
    use_case: str

class ConfigResponse(BaseModel):
    """Configuration response model"""
    strategies: Dict[str, StrategyConfig]
    default_strategy: str
    homoglyphs_count: int
    invisible_chars_count: int
