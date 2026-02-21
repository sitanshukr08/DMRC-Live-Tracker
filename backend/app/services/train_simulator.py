import random
from datetime import datetime
from typing import List, Dict

class TrainSimulator:
    def __init__(self):
        self.trains = []
        self.line_length = 45.7  # Yellow Line total length in km
        self._initialize_trains()
    
    def _initialize_trains(self):
        """Initialize trains on the line"""
        # Create 8 trains distributed across the line
        train_positions = [
            (1, 5.2, "towards_huda"),
            (2, 12.8, "towards_huda"),
            (3, 23.5, "towards_huda"),
            (4, 35.1, "towards_huda"),
            (5, 42.3, "towards_samaypur"),
            (6, 31.7, "towards_samaypur"),
            (7, 18.9, "towards_samaypur"),
            (8, 9.4, "towards_samaypur"),
        ]
        
        for train_num, position, direction in train_positions:
            self.trains.append({
                "train_id": f"YL-{train_num:03d}",
                "current_position_km": position,
                "direction": direction,
                "status": random.choice(["moving", "at_station"]),
                "speed_kmh": random.randint(30, 40) if random.random() > 0.3 else 0,
                "current_passengers": random.randint(150, 280),
                "capacity": 300,
                "last_updated": datetime.now().isoformat(),
                "next_station_id": self._get_next_station_id(position, direction),
                "next_station_name": self._get_station_name_at_position(position, direction)
            })
    
    def _get_next_station_id(self, position: float, direction: str) -> int:
        """Get next station ID based on position and direction"""
        # Approximate station positions (simplified)
        station_positions = [
            (1, 0.0), (2, 1.5), (3, 3.2), (4, 4.8), (5, 6.1), (6, 7.4), (7, 7.6),
            (8, 9.2), (9, 10.3), (10, 11.4), (11, 12.1), (12, 13.2), (13, 14.3),
            (14, 15.3), (15, 16.4), (16, 17.2), (17, 18.5), (18, 19.4), (19, 19.7),
            (20, 21.3), (21, 22.5), (22, 23.8), (23, 25.2), (24, 26.8), (25, 28.5),
            (26, 30.3), (27, 32.1), (28, 33.9), (29, 35.7), (30, 37.5), (31, 39.3),
            (32, 41.1), (33, 42.9), (34, 44.2), (35, 45.1), (36, 45.5), (37, 45.7)
        ]
        
        if direction == "towards_huda":
            # Find next station ahead
            for station_id, station_pos in station_positions:
                if station_pos > position:
                    return station_id
            return 37  # Last station
        else:
            # Find next station behind
            for station_id, station_pos in reversed(station_positions):
                if station_pos < position:
                    return station_id
            return 1  # First station
    
    def _get_station_name_at_position(self, position: float, direction: str) -> str:
        """Get station name near position"""
        station_names = {
            0.0: "Samaypur Badli", 1.5: "Rohini Sector 18-19", 3.2: "Haiderpur Badli Mor",
            4.8: "Jahangirpuri", 6.1: "Adarsh Nagar", 7.4: "Azadpur", 7.6: "Model Town",
            9.2: "GTB Nagar", 10.3: "Vishwavidyalaya", 11.4: "Vidhan Sabha", 12.1: "Civil Lines",
            13.2: "Kashmere Gate", 14.3: "Chandni Chowk", 15.3: "Chawri Bazar", 16.4: "New Delhi",
            17.2: "Rajiv Chowk", 18.5: "Patel Chowk", 19.4: "Central Secretariat", 19.7: "Udyog Bhawan",
            21.3: "Lok Kalyan Marg", 22.5: "Jor Bagh", 23.8: "INA", 25.2: "AIIMS",
            26.8: "Green Park", 28.5: "Hauz Khas", 30.3: "Malviya Nagar", 32.1: "Saket",
            33.9: "Qutab Minar", 35.7: "Chhatarpur", 37.5: "Sultanpur", 39.3: "Ghitorni",
            41.1: "Arjan Garh", 42.9: "Guru Dronacharya", 44.2: "Sikandarpur", 45.1: "MG Road",
            45.5: "IFFCO Chowk", 45.7: "HUDA City Centre"
        }
        
        # Find closest station
        closest_pos = min(station_names.keys(), key=lambda x: abs(x - position))
        
        if direction == "towards_huda":
            # Find next station ahead
            for pos in sorted(station_names.keys()):
                if pos > position:
                    return station_names[pos]
        else:
            # Find next station behind
            for pos in sorted(station_names.keys(), reverse=True):
                if pos < position:
                    return station_names[pos]
        
        return station_names[closest_pos]
    
    def get_all_trains(self) -> List[Dict]:
        """Get all active trains"""
        # Update train positions slightly for simulation
        for train in self.trains:
            if train["status"] == "moving":
                if train["direction"] == "towards_huda":
                    train["current_position_km"] += random.uniform(0.1, 0.3)
                    if train["current_position_km"] > self.line_length:
                        train["current_position_km"] = 0.0
                else:
                    train["current_position_km"] -= random.uniform(0.1, 0.3)
                    if train["current_position_km"] < 0:
                        train["current_position_km"] = self.line_length
                
                # Update next station
                train["next_station_id"] = self._get_next_station_id(
                    train["current_position_km"], 
                    train["direction"]
                )
                train["next_station_name"] = self._get_station_name_at_position(
                    train["current_position_km"], 
                    train["direction"]
                )
            
            # Randomly change status
            if random.random() < 0.05:
                train["status"] = "at_station" if train["status"] == "moving" else "moving"
                train["speed_kmh"] = 0 if train["status"] == "at_station" else random.randint(30, 40)
            
            train["last_updated"] = datetime.now().isoformat()
        
        return self.trains

# Create singleton instance
train_simulator = TrainSimulator()
