import json
import sys
from pathlib import Path

def validate_yellow_line_data():
    """Comprehensive validation of Yellow Line data"""
    
    print("🔍 VALIDATING YELLOW LINE DATA")
    print("="*70)
    
    errors = []
    warnings = []
    
    # Check if files exist
    files_to_check = [
        'data/processed/yellow_line.json',
        'data/metadata/fare_structure.json',
        'data/metadata/operational_params.json'
    ]
    
    print("\n📁 Checking file existence...")
    for file_path in files_to_check:
        if not Path(file_path).exists():
            errors.append(f"Missing file: {file_path}")
            print(f"   ❌ {file_path}")
        else:
            print(f"   ✅ {file_path}")
    
    if errors:
        print("\n❌ Critical files missing. Cannot proceed with validation.")
        return False
    
    # Load data
    print("\n📊 Loading data files...")
    try:
        with open('data/processed/yellow_line.json', 'r') as f:
            data = json.load(f)
        print("   ✅ yellow_line.json loaded")
        
        with open('data/metadata/fare_structure.json', 'r') as f:
            fare_data = json.load(f)
        print("   ✅ fare_structure.json loaded")
        
        with open('data/metadata/operational_params.json', 'r') as f:
            ops_data = json.load(f)
        print("   ✅ operational_params.json loaded")
    except json.JSONDecodeError as e:
        errors.append(f"JSON parse error: {e}")
        print(f"   ❌ JSON parsing failed: {e}")
        return False
    except Exception as e:
        errors.append(f"File loading error: {e}")
        print(f"   ❌ Error loading files: {e}")
        return False
    
    # Validate line info
    print("\n" + "="*70)
    print("🚇 VALIDATING LINE INFORMATION")
    print("="*70)
    
    line_info = data.get('line_info', {})
    
    expected_fields = ['id', 'name', 'full_name', 'color', 'total_stations', 
                       'total_distance_km', 'operating_hours', 'train_frequency']
    
    for field in expected_fields:
        if field not in line_info:
            errors.append(f"Missing field in line_info: {field}")
    
    print(f"   Line ID: {line_info.get('id', 'MISSING')}")
    print(f"   Line Name: {line_info.get('name', 'MISSING')}")
    print(f"   Full Name: {line_info.get('full_name', 'MISSING')}")
    print(f"   Color: {line_info.get('color', 'MISSING')}")
    print(f"   Total Stations: {line_info.get('total_stations', 0)}")
    print(f"   Total Distance: {line_info.get('total_distance_km', 0)} km")
    
    # Validate stations
    print("\n" + "="*70)
    print("🚉 VALIDATING STATIONS")
    print("="*70)
    
    stations = data.get('stations', [])
    expected_station_count = line_info.get('total_stations', 37)
    
    print(f"\n   Expected stations: {expected_station_count}")
    print(f"   Actual stations: {len(stations)}")
    
    if len(stations) != expected_station_count:
        errors.append(f"Station count mismatch: Expected {expected_station_count}, got {len(stations)}")
        print(f"   ❌ Station count mismatch!")
    else:
        print(f"   ✅ Station count correct")
    
    # Validate first and last stations
    if stations:
        first_station = stations[0]
        last_station = stations[-1]
        
        print(f"\n   First Station: {first_station.get('name', 'UNKNOWN')}")
        print(f"   Last Station: {last_station.get('name', 'UNKNOWN')}")
        
        if first_station.get('distance_from_origin_km', -1) != 0:
            errors.append(f"First station should have distance 0, got {first_station.get('distance_from_origin_km')}")
        
        expected_last_distance = line_info.get('total_distance_km', 0)
        actual_last_distance = last_station.get('distance_from_origin_km', 0)
        
        if abs(expected_last_distance - actual_last_distance) > 0.1:
            warnings.append(f"Last station distance mismatch: Expected {expected_last_distance}, got {actual_last_distance}")
    
    # Validate each station
    print(f"\n   Validating individual stations...")
    
    station_issues = 0
    interchange_count = 0
    layout_counts = {'elevated': 0, 'underground': 0, 'at_grade': 0}
    
    for i, station in enumerate(stations):
        station_errors = []
        
        # Check required fields
        required_fields = ['id', 'station_id', 'name', 'coordinates', 'distance_from_origin_km',
                          'layout', 'opened_year', 'is_interchange', 'importance_score', 'station_type']
        
        for field in required_fields:
            if field not in station:
                station_errors.append(f"Missing field: {field}")
        
        # Validate ID sequence
        if station.get('id') != i + 1:
            station_errors.append(f"ID should be {i+1}, got {station.get('id')}")
        
        # Validate coordinates
        coords = station.get('coordinates', {})
        lat = coords.get('latitude', 0)
        lon = coords.get('longitude', 0)
        
        # Delhi NCR bounds
        if not (28.4 <= lat <= 28.9):
            station_errors.append(f"Invalid latitude: {lat} (should be 28.4-28.9)")
        
        if not (76.8 <= lon <= 77.6):
            station_errors.append(f"Invalid longitude: {lon} (should be 76.8-77.6)")
        
        # Validate importance score
        importance = station.get('importance_score', 0)
        if not (1 <= importance <= 10):
            station_errors.append(f"Invalid importance score: {importance} (should be 1-10)")
        
        # Validate distance ordering
        if i > 0:
            prev_distance = stations[i-1].get('distance_from_origin_km', 0)
            curr_distance = station.get('distance_from_origin_km', 0)
            
            if curr_distance <= prev_distance:
                station_errors.append(f"Distance not increasing: {prev_distance} -> {curr_distance}")
        
        # Count interchanges
        if station.get('is_interchange', False):
            interchange_count += 1
        
        # Count layouts
        layout = station.get('layout', '').lower()
        if layout in layout_counts:
            layout_counts[layout] += 1
        
        # Report station errors
        if station_errors:
            station_issues += 1
            print(f"   ❌ Station {i+1} ({station.get('name', 'UNKNOWN')}): {len(station_errors)} issues")
            for error in station_errors[:3]:  # Show first 3 errors
                print(f"      • {error}")
            errors.extend([f"Station {station.get('name')}: {err}" for err in station_errors])
        else:
            if i < 3 or i >= len(stations) - 3:  # Show first and last 3
                print(f"   ✅ Station {i+1:2d}: {station.get('name', 'UNKNOWN'):30s} (Score: {importance}, Type: {station.get('station_type', 'N/A')})")
    
    if station_issues == 0:
        print(f"\n   ✅ All {len(stations)} stations validated successfully!")
    else:
        print(f"\n   ⚠️  Found issues in {station_issues} station(s)")
    
    print(f"\n   📊 Station Statistics:")
    print(f"      • Interchange stations: {interchange_count}")
    print(f"      • Elevated: {layout_counts['elevated']}")
    print(f"      • Underground: {layout_counts['underground']}")
    print(f"      • At-grade: {layout_counts['at_grade']}")
    
    # Validate segments
    print("\n" + "="*70)
    print("🛤️  VALIDATING SEGMENTS")
    print("="*70)
    
    segments = data.get('segments', [])
    expected_segment_count = len(stations) - 1
    
    print(f"\n   Expected segments: {expected_segment_count}")
    print(f"   Actual segments: {len(segments)}")
    
    if len(segments) != expected_segment_count:
        errors.append(f"Segment count should be {expected_segment_count}, got {len(segments)}")
        print(f"   ❌ Segment count mismatch!")
    else:
        print(f"   ✅ Segment count correct")
    
    # Validate each segment
    total_calculated_distance = 0
    segment_issues = 0
    
    print(f"\n   Validating individual segments...")
    
    for i, segment in enumerate(segments):
        segment_errors = []
        
        distance = segment.get('distance_km', 0)
        time = segment.get('avg_travel_time_minutes', 0)
        
        # Validate distance
        if distance <= 0:
            segment_errors.append(f"Invalid distance: {distance}")
        
        if distance > 5:
            warnings.append(f"Segment {segment.get('segment_id')}: Unusually long distance {distance} km")
        
        # Validate travel time
        if time <= 0:
            segment_errors.append(f"Invalid travel time: {time}")
        
        # Calculate and validate speed
        if distance > 0 and time > 0:
            speed_kmh = (distance / time) * 60
            
            if not (15 <= speed_kmh <= 60):
                warnings.append(f"Segment {segment.get('segment_id')}: Unusual speed {speed_kmh:.1f} km/h")
        
        # Validate geometry
        geometry = segment.get('geometry', {})
        if geometry.get('type') != 'LineString':
            segment_errors.append("Invalid geometry type")
        
        coords = geometry.get('coordinates', [])
        if len(coords) != 2:
            segment_errors.append(f"Geometry should have 2 points, got {len(coords)}")
        
        total_calculated_distance += distance
        
        if segment_errors:
            segment_issues += 1
            print(f"   ❌ Segment {i+1}: {segment.get('segment_id', 'UNKNOWN')} - {len(segment_errors)} issues")
            errors.extend([f"Segment {segment.get('segment_id')}: {err}" for err in segment_errors])
        else:
            if i < 3 or i >= len(segments) - 3:  # Show first and last 3
                print(f"   ✅ Segment {i+1:2d}: {segment.get('segment_id', 'UNKNOWN'):20s} ({distance:.1f} km, {time:.1f} min)")
    
    print(f"\n   Total calculated distance: {total_calculated_distance:.1f} km")
    print(f"   Expected total distance: {line_info.get('total_distance_km', 0)} km")
    
    distance_diff = abs(total_calculated_distance - line_info.get('total_distance_km', 0))
    if distance_diff > 0.5:
        warnings.append(f"Distance sum mismatch: Difference of {distance_diff:.1f} km")
        print(f"   ⚠️  Distance mismatch: {distance_diff:.1f} km difference")
    else:
        print(f"   ✅ Distance sum matches (±{distance_diff:.2f} km)")
    
    # Validate fare structure
    print("\n" + "="*70)
    print("💰 VALIDATING FARE STRUCTURE")
    print("="*70)
    
    weekday_slabs = fare_data.get('fare_slabs', {}).get('weekday', [])
    weekend_slabs = fare_data.get('fare_slabs', {}).get('weekend', [])
    
    print(f"\n   Weekday fare slabs: {len(weekday_slabs)}")
    print(f"   Weekend fare slabs: {len(weekend_slabs)}")
    
    if len(weekday_slabs) != 6 or len(weekend_slabs) != 6:
        warnings.append("Expected 6 fare slabs for both weekday and weekend")
    
    print("\n   Weekday Fare Structure:")
    for slab in weekday_slabs:
        print(f"      {slab['min_distance_km']:5.1f}-{slab['max_distance_km']:5.1f} km → ₹{slab['fare']:2d} (limit: {slab['time_limit_minutes']} min)")
    
    print("\n   Weekend Fare Structure:")
    for slab in weekend_slabs:
        print(f"      {slab['min_distance_km']:5.1f}-{slab['max_distance_km']:5.1f} km → ₹{slab['fare']:2d} (limit: {slab['time_limit_minutes']} min)")
    
    # Validate operational parameters
    print("\n" + "="*70)
    print("⚙️  VALIDATING OPERATIONAL PARAMETERS")
    print("="*70)
    
    train_specs = ops_data.get('train_specs', {})
    print(f"\n   Average speed: {train_specs.get('average_speed_kmh', 'N/A')} km/h")
    print(f"   Max speed: {train_specs.get('max_speed_kmh', 'N/A')} km/h")
    print(f"   Station halt: {train_specs.get('station_halt_seconds', 'N/A')} seconds")
    print(f"   Train capacity: {train_specs.get('total_capacity', 'N/A')} passengers")
    
    train_freq = ops_data.get('train_frequency', {})
    print(f"\n   Train Frequency:")
    print(f"      • Peak: {train_freq.get('peak', {}).get('frequency_minutes', 'N/A')} minutes")
    print(f"      • Off-peak: {train_freq.get('offpeak', {}).get('frequency_minutes', 'N/A')} minutes")
    print(f"      • Weekend: {train_freq.get('weekend', {}).get('frequency_minutes', 'N/A')} minutes")
    
    # Summary
    print("\n" + "="*70)
    print("📋 VALIDATION SUMMARY")
    print("="*70)
    
    print(f"\n   Stations validated: {len(stations)}")
    print(f"   Segments validated: {len(segments)}")
    print(f"   Total distance: {total_calculated_distance:.1f} km")
    print(f"   Interchange stations: {interchange_count}")
    
    print(f"\n   Errors found: {len(errors)}")
    print(f"   Warnings found: {len(warnings)}")
    
    if errors:
        print(f"\n❌ VALIDATION FAILED - {len(errors)} ERROR(S) FOUND:")
        print("="*70)
        for i, error in enumerate(errors[:10], 1):  # Show first 10 errors
            print(f"   {i}. {error}")
        if len(errors) > 10:
            print(f"   ... and {len(errors) - 10} more errors")
    else:
        print("\n✅ NO ERRORS FOUND!")
    
    if warnings:
        print(f"\n⚠️  {len(warnings)} WARNING(S):")
        print("="*70)
        for i, warning in enumerate(warnings[:10], 1):  # Show first 10 warnings
            print(f"   {i}. {warning}")
        if len(warnings) > 10:
            print(f"   ... and {len(warnings) - 10} more warnings")
    else:
        print("\n✅ NO WARNINGS!")
    
    # Final verdict
    print("\n" + "="*70)
    if not errors:
        print("🎉 DATA VALIDATION PASSED!")
        print("="*70)
        print("\n✅ Your Yellow Line dataset is production-ready!")
        print("✅ You can proceed to Phase 2: Backend Development\n")
        return True
    else:
        print("❌ DATA VALIDATION FAILED!")
        print("="*70)
        print("\n⚠️  Please fix the errors above before proceeding to Phase 2.\n")
        return False

if __name__ == "__main__":
    success = validate_yellow_line_data()
    sys.exit(0 if success else 1)