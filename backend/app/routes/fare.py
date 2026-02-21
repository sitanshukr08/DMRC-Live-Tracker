from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services.fare_calculator import fare_calculator
from app.models.fare import FareRequest, FareResponse

router = APIRouter(prefix="/api/fare", tags=["fare"])

@router.post("/calculate", response_model=FareResponse)
async def calculate_fare(request: FareRequest):
    """
    Calculate fare between two stations.
    
    Supports:
    - Weekday/Weekend pricing
    - Token/Smart Card payment methods
    - Auto-detection of weekend from travel date
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
    
    fare = fare_calculator.calculate_fare(
        request.source_station_id,
        request.destination_station_id,
        request.is_weekend,
        request.use_smart_card,
        request.travel_date
    )
    
    if not fare:
        raise HTTPException(
            status_code=404,
            detail="Could not calculate fare"
        )
    
    # Format response to match FareResponse model
    return {
        "source_station": fare['source_station'],
        "destination_station": fare['destination_station'],
        "distance_km": fare['distance_km'],
        "is_weekend": fare['is_weekend'],
        "token_fare": fare['base_fare'],
        "smart_card_fare": fare['final_fare'] if fare['payment_method'] == 'smart_card' else fare['base_fare'] - fare.get('smart_card_discount', 0),
        "savings_with_smart_card": fare.get('smart_card_discount', fare['base_fare'] - (fare['base_fare'] - round(fare['base_fare'] * 0.1))),
        "time_limit_minutes": fare['time_limit_minutes'],
        "currency": fare['currency']
    }

@router.get("/between/{source_id}/{destination_id}")
async def get_fare_simple(
    source_id: int,
    destination_id: int,
    weekend: bool = Query(False, description="Weekend pricing"),
    smart_card: bool = Query(False, description="Use smart card discount")
):
    """Simple GET endpoint for fare calculation"""
    
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
    
    return fare

@router.get("/compare/{source_id}/{destination_id}")
async def compare_fares(source_id: int, destination_id: int):
    """
    Compare all fare options (weekday/weekend, token/smart card).
    Shows best pricing option and potential savings.
    """
    
    comparison = fare_calculator.compare_fares(source_id, destination_id)
    
    if not comparison:
        raise HTTPException(
            status_code=404,
            detail="Could not compare fares"
        )
    
    return comparison