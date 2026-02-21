from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services.multi_line_station_service import multi_line_station_service

router = APIRouter(prefix="/api/stations", tags=["stations"])

@router.get("")
async def get_all_stations(
    line: Optional[str] = Query(None, description="Filter by line (Yellow, Blue)")
):
    """
    Get all stations or filter by line
    
    Parameters:
    - line: Optional filter (Yellow, Blue)
    """
    if line:
        stations = multi_line_station_service.get_stations_by_line(line)
        return {
            "total": len(stations),
            "line": line,
            "stations": stations
        }
    
    stations = multi_line_station_service.get_all_stations()
    
    return {
        "total": len(stations),
        "lines": {
            "Yellow": len([s for s in stations if s['line'] == 'Yellow']),
            "Blue": len([s for s in stations if s['line'] == 'Blue'])
        },
        "stations": stations
    }

@router.get("/{station_id}")
async def get_station_by_id(station_id: int):
    """Get detailed information about a specific station"""
    station = multi_line_station_service.get_station_by_id(station_id)
    
    if not station:
        raise HTTPException(
            status_code=404,
            detail=f"Station with ID {station_id} not found"
        )
    
    return station

@router.get("/search/{query}")
async def search_stations(query: str):
    """Search for stations by name"""
    stations = multi_line_station_service.get_all_stations()
    
    query_lower = query.lower()
    matching_stations = [
        s for s in stations 
        if query_lower in s['name'].lower() or 
           query_lower in s.get('display_name', '').lower()
    ]
    
    return {
        "query": query,
        "total_results": len(matching_stations),
        "stations": matching_stations
    }

@router.get("/interchange/all")
async def get_interchange_stations():
    """Get all interchange stations"""
    stations = multi_line_station_service.get_interchange_stations()
    
    return {
        "total": len(stations),
        "stations": stations
    }

@router.get("/line/{line_name}")
async def get_line_stations(line_name: str):
    """Get all stations for a specific line"""
    stations = multi_line_station_service.get_stations_by_line(line_name)
    
    if not stations:
        raise HTTPException(
            status_code=404,
            detail=f"Line '{line_name}' not found"
        )
    
    return {
        "line": line_name,
        "total": len(stations),
        "stations": stations
    }
