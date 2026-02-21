from pydantic import BaseModel, Field
from typing import List, Optional, Dict

class Coordinates(BaseModel):
    latitude: float
    longitude: float

class Station(BaseModel):
    id: int
    station_id: str
    name: str
    display_name: str
    coordinates: Coordinates
    distance_from_origin_km: float
    layout: str
    opened_year: int
    is_interchange: bool
    interchange_lines: List[str] = []
    facilities: List[str] = []
    importance_score: int
    station_type: str
    avg_crowd_multiplier: Dict[str, float]

class LineInfo(BaseModel):
    id: str
    name: str
    full_name: str
    color: str
    total_stations: int
    total_distance_km: float
    operating_hours: Dict
    train_frequency: Dict
    avg_speed_kmh: int
    station_halt_seconds: int

class StationListResponse(BaseModel):
    total: int
    stations: List[Station]

class StationDetailResponse(BaseModel):
    station: Station
    previous_station: Optional[Station] = None
    next_station: Optional[Station] = None