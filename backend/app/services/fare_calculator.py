from typing import Dict, Optional
from datetime import datetime
from app.services.data_loader import data_loader

class FareCalculator:
    """Service to calculate metro fares"""
    
    def calculate_fare(
        self,
        source_id: int,
        destination_id: int,
        is_weekend: bool = False,
        use_smart_card: bool = False,
        travel_date: Optional[str] = None
    ) -> Optional[Dict]:
        """
        Calculate fare between two stations.
        
        Args:
            source_id: Source station ID (1-37)
            destination_id: Destination station ID (1-37)
            is_weekend: Whether it's weekend/holiday pricing
            use_smart_card: Whether to apply smart card discount
            travel_date: Optional date string (YYYY-MM-DD) to auto-detect weekend
        
        Returns:
            Dictionary with fare breakdown
        """
        
        source = data_loader.get_station_by_id(source_id)
        destination = data_loader.get_station_by_id(destination_id)
        
        if not source or not destination:
            return None
        
        # Auto-detect weekend if date provided
        if travel_date and not is_weekend:
            try:
                date_obj = datetime.strptime(travel_date, "%Y-%m-%d")
                # 5 = Saturday, 6 = Sunday
                is_weekend = date_obj.weekday() in [5, 6]
            except ValueError:
                pass  # Invalid date format, use provided is_weekend
        
        # Calculate distance
        distance = abs(
            destination['distance_from_origin_km'] - 
            source['distance_from_origin_km']
        )
        
        # Get fare slabs
        fare_structure = data_loader.get_fare_structure()
        fare_slabs = data_loader.get_fare_slabs(is_weekend)
        
        # Find applicable fare
        base_fare = self._find_fare_for_distance(fare_slabs, distance)
        time_limit = self._find_time_limit_for_distance(fare_slabs, distance)
        
        if base_fare is None:
            return None
        
        # Calculate smart card discount
        smart_card_discount = 0
        final_fare = base_fare
        
        if use_smart_card:
            discount_percent = fare_structure.get('smart_card_discount_percent', 10)
            smart_card_discount = round(base_fare * discount_percent / 100)
            final_fare = base_fare - smart_card_discount
        
        return {
            "source_station": source['name'],
            "destination_station": destination['name'],
            "distance_km": round(distance, 2),
            "is_weekend": is_weekend,
            "base_fare": base_fare,
            "smart_card_discount": smart_card_discount,
            "final_fare": final_fare,
            "time_limit_minutes": time_limit,
            "currency": fare_structure.get('currency', 'INR'),
            "payment_method": "smart_card" if use_smart_card else "token"
        }
    
    def _find_fare_for_distance(self, fare_slabs: list, distance: float) -> Optional[int]:
        """Find applicable fare based on distance"""
        for slab in fare_slabs:
            if slab['min_distance_km'] <= distance <= slab['max_distance_km']:
                return slab['fare']
        
        # If distance exceeds max, return last slab fare
        if fare_slabs:
            return fare_slabs[-1]['fare']
        
        return None
    
    def _find_time_limit_for_distance(self, fare_slabs: list, distance: float) -> int:
        """Find time limit based on distance"""
        for slab in fare_slabs:
            if slab['min_distance_km'] <= distance <= slab['max_distance_km']:
                return slab['time_limit_minutes']
        
        # If distance exceeds max, return last slab time limit
        if fare_slabs:
            return fare_slabs[-1]['time_limit_minutes']
        
        return 0
    
    def compare_fares(
        self,
        source_id: int,
        destination_id: int
    ) -> Optional[Dict]:
        """
        Compare all fare options for a journey.
        Shows weekday/weekend and token/smart card combinations.
        """
        
        source = data_loader.get_station_by_id(source_id)
        destination = data_loader.get_station_by_id(destination_id)
        
        if not source or not destination:
            return None
        
        distance = abs(
            destination['distance_from_origin_km'] - 
            source['distance_from_origin_km']
        )
        
        # Calculate all combinations
        weekday_token = self.calculate_fare(source_id, destination_id, False, False)
        weekday_smart = self.calculate_fare(source_id, destination_id, False, True)
        weekend_token = self.calculate_fare(source_id, destination_id, True, False)
        weekend_smart = self.calculate_fare(source_id, destination_id, True, True)
        
        return {
            "source_station": source['name'],
            "destination_station": destination['name'],
            "distance_km": round(distance, 2),
            "fares": {
                "weekday_token": weekday_token['final_fare'],
                "weekday_smart_card": weekday_smart['final_fare'],
                "weekend_token": weekend_token['final_fare'],
                "weekend_smart_card": weekend_smart['final_fare']
            },
            "savings": {
                "smart_card_weekday": weekday_token['final_fare'] - weekday_smart['final_fare'],
                "smart_card_weekend": weekend_token['final_fare'] - weekend_smart['final_fare'],
                "weekend_vs_weekday": weekday_token['final_fare'] - weekend_token['final_fare'],
                "best_option_savings": weekday_token['final_fare'] - weekend_smart['final_fare']
            },
            "best_option": {
                "fare": weekend_smart['final_fare'],
                "description": "Weekend + Smart Card"
            },
            "time_limit_minutes": weekday_token['time_limit_minutes']
        }

# Create global instance
fare_calculator = FareCalculator()