import random
from datetime import datetime
from typing import List, Dict

class MultiLineTrainSimulator:
    def __init__(self):
        self.trains = []
        self.yellow_line_length = 45.7
        self.blue_line_length = 58.5
        self.violet_line_length = 47.0
        self.orange_line_length = 22.7
        self.aqua_line_length = 29.7
        self._initialize_trains()
    
    def _initialize_trains(self):
        """Initialize trains on all five lines"""
        # Yellow Line trains (8 trains)
        yellow_positions = [
            (1, 5.2, "towards_huda"),
            (2, 12.8, "towards_huda"),
            (3, 23.5, "towards_huda"),
            (4, 35.1, "towards_huda"),
            (5, 42.3, "towards_samaypur"),
            (6, 31.7, "towards_samaypur"),
            (7, 18.9, "towards_samaypur"),
            (8, 9.4, "towards_samaypur"),
        ]
        
        for train_num, position, direction in yellow_positions:
            self.trains.append({
                "train_id": f"YL-{train_num:03d}",
                "line": "Yellow",
                "current_position_km": position,
                "direction": direction,
                "status": random.choice(["moving", "at_station"]),
                "speed_kmh": random.randint(30, 40) if random.random() > 0.3 else 0,
                "current_passengers": random.randint(150, 280),
                "capacity": 300,
                "last_updated": datetime.now().isoformat(),
                "next_station_id": None,
                "next_station_name": "Updating..."
            })
        
        # Blue Line trains (10 trains)
        blue_positions = [
            (1, 5.0, "towards_noida"),
            (2, 12.5, "towards_noida"),
            (3, 20.0, "towards_noida"),
            (4, 28.0, "towards_noida"),
            (5, 38.0, "towards_noida"),
            (6, 50.0, "towards_dwarka"),
            (7, 42.0, "towards_dwarka"),
            (8, 32.0, "towards_dwarka"),
            (9, 22.0, "towards_dwarka"),
            (10, 10.0, "towards_dwarka"),
        ]
        
        for train_num, position, direction in blue_positions:
            self.trains.append({
                "train_id": f"BL-{train_num:03d}",
                "line": "Blue",
                "current_position_km": position,
                "direction": direction,
                "status": random.choice(["moving", "at_station"]),
                "speed_kmh": random.randint(30, 40) if random.random() > 0.3 else 0,
                "current_passengers": random.randint(180, 300),
                "capacity": 320,
                "last_updated": datetime.now().isoformat(),
                "next_station_id": None,
                "next_station_name": "Updating..."
            })
        
        # Violet Line trains (8 trains)
        violet_positions = [
            (1, 5.0, "towards_ballabhgarh"),
            (2, 12.0, "towards_ballabhgarh"),
            (3, 20.0, "towards_ballabhgarh"),
            (4, 30.0, "towards_ballabhgarh"),
            (5, 40.0, "towards_kashmere"),
            (6, 32.0, "towards_kashmere"),
            (7, 20.0, "towards_kashmere"),
            (8, 10.0, "towards_kashmere"),
        ]
        
        for train_num, position, direction in violet_positions:
            self.trains.append({
                "train_id": f"VL-{train_num:03d}",
                "line": "Violet",
                "current_position_km": position,
                "direction": direction,
                "status": random.choice(["moving", "at_station"]),
                "speed_kmh": random.randint(30, 40) if random.random() > 0.3 else 0,
                "current_passengers": random.randint(160, 290),
                "capacity": 310,
                "last_updated": datetime.now().isoformat(),
                "next_station_id": None,
                "next_station_name": "Updating..."
            })
        
        # Orange Line trains (4 trains - Airport Express)
        orange_positions = [
            (1, 3.0, "towards_airport"),
            (2, 10.0, "towards_airport"),
            (3, 18.0, "towards_newdelhi"),
            (4, 8.0, "towards_newdelhi"),
        ]
        
        for train_num, position, direction in orange_positions:
            self.trains.append({
                "train_id": f"OL-{train_num:03d}",
                "line": "Orange",
                "current_position_km": position,
                "direction": direction,
                "status": random.choice(["moving", "at_station"]),
                "speed_kmh": random.randint(35, 50) if random.random() > 0.2 else 0,
                "current_passengers": random.randint(80, 150),
                "capacity": 180,
                "last_updated": datetime.now().isoformat(),
                "next_station_id": None,
                "next_station_name": "Updating..."
            })
        
        # Aqua Line trains (6 trains - Noida Metro)
        aqua_positions = [
            (1, 3.0, "towards_greaternoida"),
            (2, 10.0, "towards_greaternoida"),
            (3, 18.0, "towards_greaternoida"),
            (4, 25.0, "towards_sector51"),
            (5, 15.0, "towards_sector51"),
            (6, 8.0, "towards_sector51"),
        ]
        
        for train_num, position, direction in aqua_positions:
            self.trains.append({
                "train_id": f"AQ-{train_num:03d}",
                "line": "Aqua",
                "current_position_km": position,
                "direction": direction,
                "status": random.choice(["moving", "at_station"]),
                "speed_kmh": random.randint(30, 40) if random.random() > 0.3 else 0,
                "current_passengers": random.randint(120, 220),
                "capacity": 250,
                "last_updated": datetime.now().isoformat(),
                "next_station_id": None,
                "next_station_name": "Updating..."
            })
    
    def get_all_trains(self) -> List[Dict]:
        """Get all active trains"""
        for train in self.trains:
            if train["status"] == "moving":
                line_length = self.yellow_line_length if train["line"] == "Yellow" else \
                             self.blue_line_length if train["line"] == "Blue" else \
                             self.violet_line_length if train["line"] == "Violet" else \
                             self.orange_line_length if train["line"] == "Orange" else \
                             self.aqua_line_length
                
                if "towards_huda" in train["direction"] or \
                   "towards_noida" in train["direction"] or \
                   "towards_ballabhgarh" in train["direction"] or \
                   "towards_airport" in train["direction"] or \
                   "towards_greaternoida" in train["direction"]:
                    train["current_position_km"] += random.uniform(0.1, 0.3)
                    if train["current_position_km"] > line_length:
                        train["current_position_km"] = 0.0
                else:
                    train["current_position_km"] -= random.uniform(0.1, 0.3)
                    if train["current_position_km"] < 0:
                        train["current_position_km"] = line_length
            
            if random.random() < 0.05:
                train["status"] = "at_station" if train["status"] == "moving" else "moving"
                train["speed_kmh"] = 0 if train["status"] == "at_station" else random.randint(30, 50 if train["line"] == "Orange" else 40)
            
            train["last_updated"] = datetime.now().isoformat()
        
        return self.trains
    
    def get_trains_by_line(self, line: str) -> List[Dict]:
        """Get trains for specific line"""
        return [t for t in self.get_all_trains() if t["line"] == line]

multi_line_train_simulator = MultiLineTrainSimulator()
