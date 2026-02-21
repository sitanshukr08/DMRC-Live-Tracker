from typing import List, Dict, Optional
from datetime import datetime
import random

class AnalyticsService:
    def __init__(self):
        self.all_stations = []
    
    def set_stations(self, stations: List[Dict]):
        self.all_stations = stations
    
    def get_crowd_levels_by_line(self, line: str) -> Dict:
        current_hour = datetime.now().hour
        is_peak = current_hour in [7, 8, 9, 10, 17, 18, 19, 20]
        current_period = "peak" if is_peak else "off-peak"
        
        line_stations = [s for s in self.all_stations if s.get('line') == line]
        
        station_crowds = []
        total_passengers = 0
        
        for station in line_stations:
            multiplier = station.get('avg_crowd_multiplier', {})
            base = multiplier.get('peak' if is_peak else 'offpeak', 1.0)
            crowd = int(base * 100)
            
            station_crowds.append({
                'station_id': station['id'],
                'station_name': station['name'],
                'crowd_level': crowd,
                'category': self._get_crowd_category(crowd)
            })
            
            total_passengers += crowd
        
        busiest = max(station_crowds, key=lambda x: x['crowd_level']) if station_crowds else None
        busiest_station_name = busiest['station_name'] if busiest else 'Unknown'
        
        return {
            'line': line,
            'current_period': current_period,
            'total_current_passengers': total_passengers,
            'busiest_station': busiest_station_name,
            'station_crowds': station_crowds
        }
    
    def get_crowd_levels(self) -> Dict:
        return self.get_crowd_levels_by_line('Yellow')
    
    def _get_crowd_category(self, level: int) -> str:
        if level > 80:
            return "Very High Crowd"
        elif level > 60:
            return "High Crowd"
        elif level > 40:
            return "Moderate Crowd"
        else:
            return "Low Crowd"
    
    def get_hourly_patterns_by_line(self, line: str) -> Dict:
        peak_hours = [7, 8, 9, 10, 17, 18, 19, 20]
        off_peak_hours = [0, 1, 2, 3, 4, 5, 6, 22, 23]
        
        line_multipliers = {
            'Yellow': 1.0,
            'Blue': 1.3,
            'Violet': 0.9,
            'Orange': 0.6,
            'Aqua': 0.7
        }
        
        multiplier = line_multipliers.get(line, 1.0)
        
        hourly_data = []
        for hour in range(24):
            is_peak = hour in peak_hours
            
            if is_peak:
                base_passengers = int(random.randint(700, 900) * multiplier)
            else:
                base_passengers = int(random.randint(150, 250) * multiplier)
            
            hourly_data.append({
                'hour': hour,
                'avg_passengers': base_passengers,
                'period': 'Morning Peak' if hour in [7, 8, 9, 10] else
                         'Evening Peak' if hour in [17, 18, 19, 20] else
                         'Midday' if hour in [11, 12, 13, 14, 15, 16] else
                         'Off Peak'
            })
        
        return {
            'line': line,
            'peak_hours': peak_hours,
            'off_peak_hours': off_peak_hours,
            'hourly_patterns': hourly_data
        }
    
    def get_hourly_patterns(self) -> Dict:
        return self.get_hourly_patterns_by_line('Yellow')
    
    def get_line_stats(self) -> Dict:
        total_stations = len(self.all_stations)
        interchange_count = sum(1 for s in self.all_stations if s.get('is_interchange', False))
        
        if self.all_stations:
            max_distance = max(s.get('distance_from_origin_km', 0) for s in self.all_stations)
        else:
            max_distance = 0
        
        return {
            'total_stations': total_stations,
            'interchange_stations': interchange_count,
            'total_line_length_km': max_distance,
            'avg_station_distance_km': round(max_distance / (total_stations - 1), 2) if total_stations > 1 else 0,
            'train_frequency_minutes': 5,
            'daily_passengers_estimate': 218560,
            'operational_hours': {
                'weekday': '06:00 - 23:00',
                'weekend': '06:00 - 23:30'
            }
        }

analytics_service = AnalyticsService()
