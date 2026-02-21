from pydantic import BaseModel
from typing import List, Optional

class RouteRequest(BaseModel):
    source_station_id: int
    destination_station_id: int

class RouteStation(BaseModel):
    id: int
    name: str
    distance_from_origin_km: float
    
class RouteResponse(BaseModel):
    source: RouteStation
    destination: RouteStation
    stations: List[RouteStation]
    total_stations: int
    total_distance_km: float
    estimated_time_minutes: float
    direction: str