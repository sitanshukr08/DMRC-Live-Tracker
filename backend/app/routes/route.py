from fastapi import APIRouter, HTTPException
from app.services.route_calculator import route_calculator
from app.models.route import RouteRequest, RouteResponse

router = APIRouter(prefix="/api/route", tags=["route"])

@router.post("/calculate", response_model=RouteResponse)
async def calculate_route(request: RouteRequest):
    """
    Calculate route between source and destination stations.
    
    Returns:
    - All stations in the route
    - Total distance and time
    - Direction of travel
    - Interchange stations
    """
    
    if request.source_station_id == request.destination_station_id:
        raise HTTPException(
            status_code=400, 
            detail="Source and destination cannot be the same"
        )
    
    if not (1 <= request.source_station_id <= 37):
        raise HTTPException(
            status_code=400, 
            detail="Invalid source station ID (must be 1-37)"
        )
    
    if not (1 <= request.destination_station_id <= 37):
        raise HTTPException(
            status_code=400, 
            detail="Invalid destination station ID (must be 1-37)"
        )
    
    route = route_calculator.calculate_route(
        request.source_station_id,
        request.destination_station_id
    )
    
    if not route:
        raise HTTPException(
            status_code=404,
            detail="Could not calculate route"
        )
    
    return route

@router.get("/between/{source_id}/{destination_id}")
async def get_route_simple(source_id: int, destination_id: int):
    """Simple GET endpoint for route calculation"""
    
    route = route_calculator.calculate_route(source_id, destination_id)
    
    if not route:
        raise HTTPException(
            status_code=404,
            detail="Could not calculate route"
        )
    
    return route