from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services.route_calculator import route_calculator
from app.services.fare_calculator import fare_calculator

router = APIRouter(prefix="/api/journey", tags=["journey"])

@router.get("/plan/{source_id}/{destination_id}")
async def plan_journey(
    source_id: int,
    destination_id: int,
    weekend: bool = Query(False, description="Weekend travel"),
    smart_card: bool = Query(True, description="Use smart card")
):
    """
    Complete journey planner - combines route and fare information.
    Returns everything needed for a journey in one call.
    """
    
    if source_id == destination_id:
        raise HTTPException(
            status_code=400,
            detail="Source and destination cannot be the same"
        )

    route = route_calculator.calculate_route(source_id, destination_id)
    if not route:
        raise HTTPException(
            status_code=404,
            detail="Could not calculate route"
        )
    
    fare = fare_calculator.calculate_fare(
        source_id,
        destination_id,
        weekend,
        smart_card
    )
    if not fare:
        raise HTTPException(
            status_code=404,
            detail="Could not calculate fare"
        )
    
    fare_comparison = fare_calculator.compare_fares(source_id, destination_id)
    
    return {
        "journey": {
            "source": route['source'],
            "destination": route['destination'],
            "distance_km": route['total_distance_km'],
            "estimated_time_minutes": route['estimated_time_minutes'],
            "direction": route['direction']
        },
        "route": {
            "total_stations": route['total_stations'],
            "stations": route['stations'],
            "interchange_stations": route['interchange_stations']
        },
        "fare": {
            "selected_fare": fare['final_fare'],
            "payment_method": fare['payment_method'],
            "is_weekend": fare['is_weekend'],
            "time_limit_minutes": fare['time_limit_minutes'],
            "currency": fare['currency']
        },
        "fare_options": fare_comparison['fares'] if fare_comparison else {},
        "savings": fare_comparison['savings'] if fare_comparison else {}
    }