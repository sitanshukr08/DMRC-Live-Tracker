import json
from pathlib import Path
from typing import Dict, List, Optional
from app.config import settings

class DataLoader:
    """Service to load and cache metro data"""
    
    def __init__(self):
        self._yellow_line_data: Optional[Dict] = None
        self._fare_structure: Optional[Dict] = None
        self._operational_params: Optional[Dict] = None
        self._stations_by_id: Dict[int, Dict] = {}
        self._stations_by_station_id: Dict[str, Dict] = {}
        
    def load_all_data(self):
        """Load all required data files"""
        print("📂 Loading Yellow Line data...")
        self._yellow_line_data = self._load_json(settings.yellow_line_file)
        
        print("💰 Loading fare structure...")
        self._fare_structure = self._load_json(settings.fare_structure_file)
        
        print("⚙️  Loading operational parameters...")
        self._operational_params = self._load_json(settings.operational_params_file)
        
        # Build station lookup dictionaries
        self._build_station_lookups()
        
        print(f"✅ Data loaded: {len(self.get_all_stations())} stations")
        
    def _load_json(self, file_path: Path) -> Dict:
        """Load JSON file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            raise FileNotFoundError(f"Data file not found: {file_path}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in {file_path}: {e}")
    
    def _build_station_lookups(self):
        """Build quick lookup dictionaries for stations"""
        stations = self._yellow_line_data.get('stations', [])
        
        for station in stations:
            station_id = station.get('id')
            station_code = station.get('station_id')
            
            if station_id:
                self._stations_by_id[station_id] = station
            if station_code:
                self._stations_by_station_id[station_code] = station
    
    # Yellow Line Data Methods
    def get_line_info(self) -> Dict:
        """Get Yellow Line metadata"""
        return self._yellow_line_data.get('line_info', {})
    
    def get_all_stations(self) -> List[Dict]:
        """Get all stations"""
        return self._yellow_line_data.get('stations', [])
    
    def get_station_by_id(self, station_id: int) -> Optional[Dict]:
        """Get station by numeric ID (1-37)"""
        return self._stations_by_id.get(station_id)
    
    def get_station_by_code(self, station_code: str) -> Optional[Dict]:
        """Get station by code (e.g., 'YL01')"""
        return self._stations_by_station_id.get(station_code)
    
    def get_all_segments(self) -> List[Dict]:
        """Get all track segments"""
        return self._yellow_line_data.get('segments', [])
    
    def get_segment_between(self, from_id: int, to_id: int) -> Optional[Dict]:
        """Get segment between two stations"""
        segments = self.get_all_segments()
        
        from_station = self.get_station_by_id(from_id)
        to_station = self.get_station_by_id(to_id)
        
        if not from_station or not to_station:
            return None
        
        from_code = from_station.get('station_id')
        to_code = to_station.get('station_id')
        segment_id = f"{from_code}-{to_code}"
        
        for segment in segments:
            if segment.get('segment_id') == segment_id:
                return segment
        
        return None
    
    # Fare Structure Methods
    def get_fare_structure(self) -> Dict:
        """Get complete fare structure"""
        return self._fare_structure
    
    def get_fare_slabs(self, is_weekend: bool = False) -> List[Dict]:
        """Get fare slabs for weekday or weekend"""
        fare_slabs = self._fare_structure.get('fare_slabs', {})
        return fare_slabs.get('weekend' if is_weekend else 'weekday', [])
    
    # Operational Parameters Methods
    def get_operational_params(self) -> Dict:
        """Get operational parameters"""
        return self._operational_params
    
    def get_train_specs(self) -> Dict:
        """Get train specifications"""
        return self._operational_params.get('train_specs', {})
    
    def get_train_frequency(self) -> Dict:
        """Get train frequency schedules"""
        return self._operational_params.get('train_frequency', {})
    
    def get_crowd_thresholds(self) -> Dict:
        """Get crowd level thresholds"""
        return self._operational_params.get('crowd_thresholds', {})
    
    # Utility Methods
    def get_total_distance(self) -> float:
        """Get total line distance"""
        return self.get_line_info().get('total_distance_km', 0)
    
    def get_station_count(self) -> int:
        """Get total station count"""
        return len(self.get_all_stations())
    
    def search_stations(self, query: str) -> List[Dict]:
        """Search stations by name"""
        query = query.lower()
        stations = self.get_all_stations()
        
        return [
            station for station in stations
            if query in station.get('name', '').lower()
        ]
    
    def get_interchange_stations(self) -> List[Dict]:
        """Get all interchange stations"""
        return [
            station for station in self.get_all_stations()
            if station.get('is_interchange', False)
        ]

# Create global instance
data_loader = DataLoader()