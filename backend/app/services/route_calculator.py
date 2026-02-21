from typing import Dict, List, Optional

class RouteCalculator:
    def __init__(self):
        self.stations = []
    
    def set_stations(self, stations: List[Dict]):
        """Set stations data"""
        self.stations = sorted(stations, key=lambda x: x['distance_from_origin_km'])
    
    def calculate_route(self, source_id: int, destination_id: int) -> Optional[Dict]:
        """Calculate route between two stations"""
        source = next((s for s in self.stations if s['id'] == source_id), None)
        destination = next((s for s in self.stations if s['id'] == destination_id), None)
        
        if not source or not destination:
            return None
        
        # Determine direction
        direction = 'towards_huda' if destination_id > source_id else 'towards_samaypur'
        
        # Get stations in route
        if source_id < destination_id:
            route_stations = [s for s in self.stations if source_id <= s['id'] <= destination_id]
        else:
            route_stations = [s for s in self.stations if destination_id <= s['id'] <= source_id]
            route_stations.reverse()
        
        # Calculate distance
        distance_km = abs(destination['distance_from_origin_km'] - source['distance_from_origin_km'])
        
        # Calculate time (avg speed 35 km/h + 1 min per station)
        travel_time = (distance_km / 35) * 60  # minutes
        stop_time = len(route_stations) * 1  # 1 min per station
        total_time = int(travel_time + stop_time)
        
        # Calculate fare
        fare = self._calculate_fare(distance_km)
        
        # Find interchange stations
        interchange_stations = [s for s in route_stations if s['is_interchange']]
        
        return {
            'source': {
                'id': source['id'],
                'name': source['name'],
                'distance_from_origin_km': source['distance_from_origin_km']
            },
            'destination': {
                'id': destination['id'],
                'name': destination['name'],
                'distance_from_origin_km': destination['distance_from_origin_km']
            },
            'stations': route_stations,
            'total_stations': len(route_stations),
            'total_distance_km': round(distance_km, 2),
            'estimated_time_minutes': total_time,
            'fare': fare,
            'direction': direction,
            'interchange_stations': [s['name'] for s in interchange_stations]
        }
    
    def _calculate_fare(self, distance_km: float) -> int:
        """Calculate fare based on distance"""
        if distance_km <= 2:
            return 10
        elif distance_km <= 5:
            return 20
        elif distance_km <= 12:
            return 30
        elif distance_km <= 21:
            return 40
        elif distance_km <= 32:
            return 50
        else:
            return 60

route_calculator = RouteCalculator()
