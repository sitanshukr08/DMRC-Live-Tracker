from datetime import datetime
from typing import Dict, List, Optional
from app.services.data_loader import data_loader

class CrowdEstimator:
    """Service to estimate crowd levels at stations"""
    
    def estimate_current_crowd(self) -> Dict:
        """
        Estimate current crowd levels at all stations.
        Returns crowd percentage (0-100) for each station.
        """
        
        now = datetime.now()
        is_peak = self._is_peak_hour(now)
        is_weekend = now.weekday() in [5, 6]
        
        stations = data_loader.get_all_stations()
        crowd_levels = []
        
        for station in stations:
            crowd_percentage = self._calculate_crowd_percentage(
                station,
                is_peak,
                is_weekend,
                now
            )
            
            crowd_info = self._get_crowd_info(crowd_percentage)
            
            crowd_levels.append({
                "station_id": station['id'],
                "station_name": station['name'],
                "crowd_percentage": crowd_percentage,
                "crowd_label": crowd_info['label'],
                "crowd_color": crowd_info['color'],
                "crowd_emoji": crowd_info['emoji'],
                "is_interchange": station.get('is_interchange', False)
            })
        
        return {
            "timestamp": now.isoformat(),
            "current_time": now.strftime("%H:%M"),
            "is_peak_hour": is_peak,
            "is_weekend": is_weekend,
            "day_of_week": now.strftime("%A"),
            "stations": crowd_levels
        }
    
    def estimate_station_crowd(
        self,
        station_id: int,
        time_str: Optional[str] = None
    ) -> Optional[Dict]:
        """
        Estimate crowd level for a specific station.
        
        Args:
            station_id: Station ID (1-37)
            time_str: Optional time in HH:MM format. If None, uses current time.
        """
        
        station = data_loader.get_station_by_id(station_id)
        if not station:
            return None
        
        # Parse time or use current
        if time_str:
            try:
                now = datetime.now()
                time_parts = time_str.split(':')
                check_time = now.replace(
                    hour=int(time_parts[0]),
                    minute=int(time_parts[1])
                )
            except (ValueError, IndexError):
                check_time = datetime.now()
        else:
            check_time = datetime.now()
        
        is_peak = self._is_peak_hour(check_time)
        is_weekend = check_time.weekday() in [5, 6]
        
        crowd_percentage = self._calculate_crowd_percentage(
            station,
            is_peak,
            is_weekend,
            check_time
        )
        
        crowd_info = self._get_crowd_info(crowd_percentage)
        
        # Get hourly pattern
        hourly_pattern = self._get_hourly_crowd_pattern(station, is_weekend)
        
        return {
            "station": {
                "id": station['id'],
                "name": station['name'],
                "importance_score": station['importance_score'],
                "station_type": station['station_type'],
                "is_interchange": station.get('is_interchange', False)
            },
            "crowd": {
                "percentage": crowd_percentage,
                "label": crowd_info['label'],
                "color": crowd_info['color'],
                "emoji": crowd_info['emoji']
            },
            "context": {
                "time": check_time.strftime("%H:%M"),
                "is_peak_hour": is_peak,
                "is_weekend": is_weekend,
                "day_of_week": check_time.strftime("%A")
            },
            "hourly_pattern": hourly_pattern,
            "recommendation": self._get_crowd_recommendation(crowd_percentage, is_peak)
        }
    
    def _calculate_crowd_percentage(
        self,
        station: Dict,
        is_peak: bool,
        is_weekend: bool,
        dt: datetime
    ) -> int:
        """
        Calculate crowd percentage based on multiple factors.
        Returns: 0-100
        """
        
        # Base crowd level (importance score contributes 0-50%)
        importance_score = station.get('importance_score', 5)
        base_crowd = (importance_score / 10) * 50  # 0-50%
        
        # Get station's crowd multiplier
        multipliers = station.get('avg_crowd_multiplier', {})
        
        if is_weekend:
            multiplier = multipliers.get('weekend', 0.6)
        elif is_peak:
            multiplier = multipliers.get('peak', 1.2)
        else:
            multiplier = multipliers.get('offpeak', 0.6)
        
        # Apply multiplier
        crowd_percentage = base_crowd * multiplier
        
        # Time-based adjustment (more granular)
        hour = dt.hour
        
        # Morning peak (7-10 AM)
        if 7 <= hour < 10 and not is_weekend:
            crowd_percentage *= 1.3
        
        # Evening peak (5-9 PM)
        elif 17 <= hour < 21 and not is_weekend:
            crowd_percentage *= 1.4
        
        # Lunch time (12-2 PM)
        elif 12 <= hour < 14:
            crowd_percentage *= 1.1
        
        # Late night (after 10 PM)
        elif hour >= 22 or hour < 6:
            crowd_percentage *= 0.5
        
        # Commercial stations are busier on weekdays
        if station.get('station_type') == 'commercial' and not is_weekend:
            crowd_percentage *= 1.2
        
        # Residential stations are busier on weekends
        elif station.get('station_type') == 'residential' and is_weekend:
            crowd_percentage *= 1.1
        
        # Interchange stations are always busier
        if station.get('is_interchange', False):
            crowd_percentage *= 1.15
        
        # Cap at 100%
        return min(100, max(0, round(crowd_percentage)))
    
    def _is_peak_hour(self, dt: datetime) -> bool:
        """Check if given time is peak hour"""
        hour = dt.hour
        weekday = dt.weekday()
        
        if weekday in [5, 6]:  # Weekend
            return False
        
        # Peak: 7-10 AM and 5-9 PM on weekdays
        return (7 <= hour < 10) or (17 <= hour < 21)
    
    def _get_crowd_info(self, percentage: int) -> Dict:
        """Get crowd label, color, and emoji based on percentage"""
        crowd_thresholds = data_loader.get_crowd_thresholds()
        
        for level, info in crowd_thresholds.items():
            if info['min'] <= percentage < info['max']:
                return {
                    'label': info['label'],
                    'color': info['color'],
                    'emoji': info['emoji']
                }
        
        # Default to very high if above all thresholds
        very_high = crowd_thresholds.get('very_high', {})
        return {
            'label': very_high.get('label', 'Very High'),
            'color': very_high.get('color', '#F44336'),
            'emoji': very_high.get('emoji', '🔴')
        }
    
    def _get_hourly_crowd_pattern(
        self,
        station: Dict,
        is_weekend: bool
    ) -> List[Dict]:
        """
        Generate hourly crowd pattern for the day.
        Useful for charts/visualization.
        """
        
        pattern = []
        now = datetime.now()
        
        for hour in range(6, 24):  # 6 AM to 11 PM
            check_time = now.replace(hour=hour, minute=0)
            is_peak = self._is_peak_hour(check_time)
            
            crowd_pct = self._calculate_crowd_percentage(
                station,
                is_peak,
                is_weekend,
                check_time
            )
            
            crowd_info = self._get_crowd_info(crowd_pct)
            
            pattern.append({
                "hour": hour,
                "time": f"{hour:02d}:00",
                "crowd_percentage": crowd_pct,
                "crowd_label": crowd_info['label']
            })
        
        return pattern
    
    def _get_crowd_recommendation(self, percentage: int, is_peak: bool) -> str:
        """Get recommendation based on crowd level"""
        if percentage >= 85:
            return "Very crowded. Consider waiting for next train or travelling at a different time."
        elif percentage >= 60:
            return "High crowd expected. Allow extra time for boarding."
        elif percentage >= 30:
            return "Moderate crowd. Normal travel conditions."
        else:
            return "Low crowd. Good time to travel comfortably."
    
    def compare_station_crowds(self, station_ids: List[int]) -> Dict:
        """Compare crowd levels across multiple stations"""
        
        now = datetime.now()
        is_peak = self._is_peak_hour(now)
        is_weekend = now.weekday() in [5, 6]
        
        comparisons = []
        
        for station_id in station_ids:
            station = data_loader.get_station_by_id(station_id)
            if not station:
                continue
            
            crowd_pct = self._calculate_crowd_percentage(
                station,
                is_peak,
                is_weekend,
                now
            )
            
            crowd_info = self._get_crowd_info(crowd_pct)
            
            comparisons.append({
                "station_id": station['id'],
                "station_name": station['name'],
                "crowd_percentage": crowd_pct,
                "crowd_label": crowd_info['label'],
                "crowd_emoji": crowd_info['emoji']
            })
        
        comparisons.sort(key=lambda x: x['crowd_percentage'], reverse=True)
        
        return {
            "timestamp": now.isoformat(),
            "stations": comparisons,
            "most_crowded": comparisons[0] if comparisons else None,
            "least_crowded": comparisons[-1] if comparisons else None
        }

crowd_estimator = CrowdEstimator()