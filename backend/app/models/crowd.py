from pydantic import BaseModel
from typing import List

class CrowdLevel(BaseModel):
    station_id: int
    station_name: str
    crowd_percentage: int
    crowd_label: str
    crowd_color: str
    crowd_emoji: str

class CrowdResponse(BaseModel):
    timestamp: str
    current_time: str
    is_peak_hour: bool
    stations: List[CrowdLevel]