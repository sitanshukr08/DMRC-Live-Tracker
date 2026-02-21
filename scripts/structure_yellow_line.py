import pandas as pd
import json
from datetime import datetime

def parse_connections(station_name):
    """Extract interchange line connections from station name"""
    if '[Conn:' in station_name:
        conn_part = station_name.split('[Conn:')[1].split(']')[0]
        connections = [line.strip() for line in conn_part.split(',')]
        clean_name = station_name.split('[Conn:')[0].strip()
        return clean_name, connections
    return station_name, []

def determine_station_type(station_name, distance_km):
    """Classify station type based on location knowledge"""
    commercial_keywords = ['chowk', 'market', 'central', 'place', 'bhawan', 'nagar']
    interchange_stations = ['kashmere gate', 'rajiv chowk', 'central secretariat', 'hauz khas']
    
    name_lower = station_name.lower()
    
    if any(keyword in name_lower for keyword in interchange_stations):
        return 'commercial'
    elif any(keyword in name_lower for keyword in commercial_keywords):
        return 'mixed'
    elif 'sector' in name_lower or 'vihar' in name_lower:
        return 'residential'
    else:
        return 'mixed'

def calculate_importance_score(station_name, is_interchange, station_type, distance_km):
    """Calculate importance score 1-10"""
    score = 5  # Base score
    
    name_lower = station_name.lower()
    
    # Major hubs
    if 'rajiv chowk' in name_lower:
        return 10
    if any(hub in name_lower for hub in ['kashmere gate', 'hauz khas', 'central secretariat']):
        return 9
    
    # Interchange bonus
    if is_interchange:
        score += 2
    
    # Station type
    if station_type == 'commercial':
        score += 2
    elif station_type == 'mixed':
        score += 1
    
    # Terminal stations
    if distance_km == 0 or distance_km > 44:
        score += 1
    
    # Tourist/historical areas
    if any(area in name_lower for area in ['chandni chowk', 'chawri bazar', 'new delhi']):
        score += 2
    
    return min(10, max(1, score))

def get_crowd_multiplier(importance_score, station_type):
    """Calculate crowd multipliers based on station characteristics"""
    base_peak = 1.0 + (importance_score / 20)
    base_offpeak = 0.5 + (importance_score / 30)
    
    if station_type == 'commercial':
        return {
            'peak': round(base_peak * 1.3, 2),
            'offpeak': round(base_offpeak * 0.8, 2),
            'weekend': round(base_offpeak * 0.6, 2)
        }
    elif station_type == 'residential':
        return {
            'peak': round(base_peak * 1.1, 2),
            'offpeak': round(base_offpeak * 1.0, 2),
            'weekend': round(base_offpeak * 0.9, 2)
        }
    else:  # mixed
        return {
            'peak': round(base_peak * 1.2, 2),
            'offpeak': round(base_offpeak * 0.9, 2),
            'weekend': round(base_offpeak * 0.8, 2)
        }

def get_facilities(layout, is_interchange, opened_year):
    """Determine available facilities"""
    facilities = []
    
    # All stations have basic facilities
    if opened_year >= 2010:
        facilities.extend(['elevator', 'escalator'])
    else:
        facilities.append('elevator')
    
    if is_interchange:
        facilities.extend(['restroom', 'atm'])
    
    if layout.lower() == 'elevated':
        facilities.append('parking')
    
    return facilities

# Load raw data
df = pd.read_csv('Delhi metro.csv')
yellow_line = df[df['Metro Line'] == 'Yellow line'].copy()

# Build structured data
structured_data = {
    "line_info": {
        "id": "YELLOW",
        "name": "Yellow Line",
        "full_name": "Samaypur Badli - HUDA City Centre",
        "color": "#FFD700",
        "total_stations": len(yellow_line),
        "total_distance_km": float(yellow_line.iloc[-1]['Dist. From First Station(km)']),
        "operating_hours": {
            "start": "05:30",
            "end": "23:30"
        },
        "train_frequency": {
            "peak_minutes": 3,
            "offpeak_minutes": 6,
            "night_minutes": 12
        },
        "avg_speed_kmh": 32,
        "station_halt_seconds": 30
    },
    "stations": [],
    "segments": []
}

# Process stations
print("Processing stations...")
for idx, row in yellow_line.iterrows():
    station_name, connections = parse_connections(row['Station Names'])
    is_interchange = len(connections) > 0
    distance_km = float(row['Dist. From First Station(km)'])
    station_type = determine_station_type(station_name, distance_km)
    importance = calculate_importance_score(station_name, is_interchange, station_type, distance_km)
    
    station_data = {
        "id": int(row['ID (Station ID)']),
        "station_id": f"YL{int(row['ID (Station ID)']):02d}",
        "name": station_name,
        "display_name": row['Station Names'],
        "coordinates": {
            "latitude": float(row['Latitude']),
            "longitude": float(row['Longitude'])
        },
        "distance_from_origin_km": distance_km,
        "layout": row['Layout'].lower(),
        "opened_year": int(row['Opened(Year)'].split('-')[-1]),
        "is_interchange": is_interchange,
        "interchange_lines": connections,
        "facilities": get_facilities(row['Layout'], is_interchange, int(row['Opened(Year)'].split('-')[-1])),
        "importance_score": importance,
        "station_type": station_type,
        "avg_crowd_multiplier": get_crowd_multiplier(importance, station_type)
    }
    
    structured_data['stations'].append(station_data)
    print(f"  ✓ {station_name} (Importance: {importance}, Type: {station_type})")

# Create segments
print("\nCreating segments...")
stations = structured_data['stations']
for i in range(len(stations) - 1):
    from_station = stations[i]
    to_station = stations[i + 1]
    
    distance = to_station['distance_from_origin_km'] - from_station['distance_from_origin_km']
    # Calculate travel time: distance / speed * 60 + halt time
    travel_time = (distance / structured_data['line_info']['avg_speed_kmh'] * 60) + 0.5  # 30 sec halt
    
    segment = {
        "segment_id": f"{from_station['station_id']}-{to_station['station_id']}",
        "from_station_id": from_station['station_id'],
        "to_station_id": to_station['station_id'],
        "distance_km": round(distance, 2),
        "avg_travel_time_minutes": round(travel_time, 2),
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [from_station['coordinates']['longitude'], from_station['coordinates']['latitude']],
                [to_station['coordinates']['longitude'], to_station['coordinates']['latitude']]
            ]
        }
    }
    
    structured_data['segments'].append(segment)
    print(f"  ✓ {from_station['name']} → {to_station['name']} ({distance:.1f} km, ~{travel_time:.1f} min)")

# Save structured data
with open('data/processed/yellow_line.json', 'w') as f:
    json.dump(structured_data, f, indent=2)

print(f"\n✅ Successfully created data/processed/yellow_line.json")
print(f"   Total stations: {len(structured_data['stations'])}")
print(f"   Total segments: {len(structured_data['segments'])}")
print(f"   Total distance: {structured_data['line_info']['total_distance_km']} km")