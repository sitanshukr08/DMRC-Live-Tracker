from typing import List, Dict, Optional
from datetime import datetime

class ETACalculator:
    def __init__(self):
        self.stations = []
        self.trains = []
    
    def set_stations(self, stations: List[Dict]):
        self.stations = stations
    
    def set_trains(self, trains: List[Dict]):
        self.trains = trains
    
    def calculate_eta(self, station_id: int) -> Dict:
        station = next((s for s in self.stations if s['id'] == station_id), None)
        
        if not station:
            return {"error": "Station not found"}
        
        line_stations = sorted(
            [s for s in self.stations if s['line'] == station['line']],
            key=lambda x: x['distance_from_origin_km']
        )
        
        if station['line'] == 'Yellow':
            direction_1 = "Towards HUDA City Centre"
            direction_2 = "Towards Samaypur Badli"
        elif station['line'] == 'Blue':
            direction_1 = "Towards Noida Electronic City"
            direction_2 = "Towards Dwarka Sector 21"
        elif station['line'] == 'Violet':
            direction_1 = "Towards Raja Nahar Singh (Ballabhgarh)"
            direction_2 = "Towards Kashmere Gate"
        elif station['line'] == 'Orange':
            direction_1 = "Towards IGI Airport Terminal 3"
            direction_2 = "Towards New Delhi"
        elif station['line'] == 'Aqua':
            direction_1 = "Towards Greater Noida (Depot Station)"
            direction_2 = "Towards Noida Sector 51"
        else:
            direction_1 = "Direction 1"
            direction_2 = "Direction 2"
        
        line_trains = [t for t in self.trains if t['line'] == station['line']]
        
        trains_direction_1 = []
        trains_direction_2 = []
        
        for train in line_trains:
            distance_diff = station['distance_from_origin_km'] - train['current_position_km']
            
            if 'towards_huda' in train['direction'] or \
               'towards_noida' in train['direction'] or \
               'towards_ballabhgarh' in train['direction'] or \
               'towards_airport' in train['direction'] or \
               'towards_greaternoida' in train['direction']:
                if distance_diff > 0 and distance_diff < 20:
                    stations_away = sum(1 for s in line_stations 
                                      if train['current_position_km'] < s['distance_from_origin_km'] <= station['distance_from_origin_km'])
                    
                    avg_speed = 45 if train['line'] == 'Orange' else 35
                    eta_minutes = int((distance_diff / avg_speed) * 60)
                    
                    trains_direction_1.append({
                        'train_id': train['train_id'],
                        'eta_minutes': max(1, eta_minutes),
                        'stations_away': stations_away,
                        'current_passengers': train['current_passengers'],
                        'capacity': train['capacity']
                    })
            else:
                if distance_diff < 0 and abs(distance_diff) < 20:
                    stations_away = sum(1 for s in line_stations 
                                      if station['distance_from_origin_km'] < s['distance_from_origin_km'] <= train['current_position_km'])
                    
                    avg_speed = 45 if train['line'] == 'Orange' else 35
                    eta_minutes = int((abs(distance_diff) / avg_speed) * 60)
                    
                    trains_direction_2.append({
                        'train_id': train['train_id'],
                        'eta_minutes': max(1, eta_minutes),
                        'stations_away': stations_away,
                        'current_passengers': train['current_passengers'],
                        'capacity': train['capacity']
                    })
        
        trains_direction_1.sort(key=lambda x: x['eta_minutes'])
        trains_direction_2.sort(key=lambda x: x['eta_minutes'])
        
        return {
            'station_id': station_id,
            'station_name': station['name'],
            'line': station['line'],
            'directions': {
                'direction_1': {
                    'direction_name': direction_1,
                    'trains': trains_direction_1[:3]
                },
                'direction_2': {
                    'direction_name': direction_2,
                    'trains': trains_direction_2[:3]
                }
            }
        }

eta_calculator = ETACalculator()
