import pandas as pd
import json
import os

# Create directories if they don't exist
os.makedirs('data/raw', exist_ok=True)
os.makedirs('data/processed', exist_ok=True)

# Load CSV
df = pd.read_csv('Delhi metro.csv')

# Filter Yellow Line
yellow_line = df[df['Metro Line'] == 'Yellow line'].copy()

# Validate
print(f"✅ Total stations: {len(yellow_line)}")
print(f"✅ First station: {yellow_line.iloc[0]['Station Names']}")
print(f"✅ Last station: {yellow_line.iloc[-1]['Station Names']}")
print(f"✅ Total distance: {yellow_line.iloc[-1]['Dist. From First Station(km)']} km\n")

# Check for coordinate issues
print("Checking coordinates...")
issues = []
for idx, row in yellow_line.iterrows():
    lat, lon = row['Latitude'], row['Longitude']
    
    # Delhi NCR bounds: Lat 28.4-28.9, Lon 76.8-77.6
    if not (28.4 <= lat <= 28.9 and 76.8 <= lon <= 77.6):
        issues.append({
            'station': row['Station Names'],
            'latitude': lat,
            'longitude': lon,
            'distance_km': row['Dist. From First Station(km)']
        })
        print(f"⚠️  {row['Station Names']}: ({lat}, {lon})")

if not issues:
    print("✅ All coordinates look valid!\n")
else:
    print(f"\n❌ Found {len(issues)} stations with suspicious coordinates\n")

# Check for missing data
print("Checking for missing data...")
missing = yellow_line.isnull().sum()
if missing.any():
    print(missing[missing > 0])
else:
    print("✅ No missing data\n")

# Save raw extraction
yellow_line.to_json('data/raw/yellow_line_raw.json', orient='records', indent=2)
print("✅ Saved: data/raw/yellow_line_raw.json")

# Save issues if any
if issues:
    with open('data/raw/coordinate_issues.json', 'w') as f:
        json.dump(issues, f, indent=2)
    print("⚠️  Saved: data/raw/coordinate_issues.json")