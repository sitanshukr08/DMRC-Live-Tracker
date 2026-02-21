from fastapi import APIRouter, Query
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/crowd")
async def get_crowd_analytics(line: str = Query(default="Yellow", description="Metro line (Yellow, Blue, Violet, Orange)")):
    """Get current crowd levels at all stations for a specific line"""
    return analytics_service.get_crowd_levels_by_line(line)

@router.get("/hourly-patterns")
async def get_hourly_patterns(line: str = Query(default="Yellow", description="Metro line (Yellow, Blue, Violet, Orange)")):
    """Get hourly passenger patterns for a specific line"""
    return analytics_service.get_hourly_patterns_by_line(line)

@router.get("/line-stats")
async def get_line_stats():
    """Get overall line statistics"""
    return analytics_service.get_line_stats()
