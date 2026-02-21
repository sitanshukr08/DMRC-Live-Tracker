from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from app.services.crowd_estimator import crowd_estimator

router = APIRouter(prefix="/api/crowd", tags=["crowd"])

@router.get("/current")
async def get_current_crowd():
    """
    Get current crowd levels at all Yellow Line stations.
    Updates based on time of day, day of week, and station characteristics.
    """
    
    crowd_data = crowd_estimator.estimate_current_crowd()
    return crowd_data

@router.get("/station/{station_id}")
async def get_station_crowd(
    station_id: int,
    time: Optional[str] = Query(
        None,
        description="Time in HH:MM format. If not provided, uses current time.",
        regex="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
    )
):
    """
    Get detailed crowd information for a specific station.
    Includes hourly pattern and recommendations.
    """
    
    if not (1 <= station_id <= 37):
        raise HTTPException(
            status_code=400,
            detail="Invalid station ID (must be 1-37)"
        )
    
    crowd_data = crowd_estimator.estimate_station_crowd(station_id, time)
    
    if not crowd_data:
        raise HTTPException(
            status_code=404,
            detail="Station not found"
        )
    
    return crowd_data

@router.get("/compare")
async def compare_stations(
    station_ids: str = Query(
        ...,
        description="Comma-separated station IDs (e.g., '16,25,12')"
    )
):
    """
    Compare crowd levels across multiple stations.
    Useful for finding least crowded interchange.
    """
    
    try:
        ids = [int(id.strip()) for id in station_ids.split(',')]
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid station IDs format"
        )
    
    if not all(1 <= id <= 37 for id in ids):
        raise HTTPException(
            status_code=400,
            detail="All station IDs must be between 1-37"
        )
    
    comparison = crowd_estimator.compare_station_crowds(ids)
    return comparison

@router.get("/heatmap")
async def get_crowd_heatmap():
    """
    Get crowd data optimized for heatmap visualization.
    Returns all stations with coordinates and crowd levels.
    """
    
    crowd_data = crowd_estimator.estimate_current_crowd()
    stations = crowd_data['stations']
    
    # Enhance with coordinates for mapping
    from app.services.data_loader import data_loader
    
    heatmap_data = []
    for crowd_station in stations:
        station = data_loader.get_station_by_id(crowd_station['station_id'])
        if station:
            heatmap_data.append({
                **crowd_station,
                "coordinates": station['coordinates']
            })
    
    return {
        "timestamp": crowd_data['timestamp'],
        "is_peak_hour": crowd_data['is_peak_hour'],
        "stations": heatmap_data
    }