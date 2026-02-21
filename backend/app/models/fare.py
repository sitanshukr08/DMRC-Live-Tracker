from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FareRequest(BaseModel):
    source_station_id: int
    destination_station_id: int
    is_weekend: Optional[bool] = False
    use_smart_card: Optional[bool] = False
    travel_date: Optional[str] = None

class FareBreakdown(BaseModel):
    distance_km: float
    base_fare: int
    smart_card_discount: int
    final_fare: int
    time_limit_minutes: int

class FareResponse(BaseModel):
    source_station: str
    destination_station: str
    distance_km: float
    is_weekend: bool
    token_fare: int
    smart_card_fare: int
    savings_with_smart_card: int
    time_limit_minutes: int
    currency: str = "INR"