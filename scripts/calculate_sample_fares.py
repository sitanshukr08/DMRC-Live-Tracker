import json
from datetime import datetime

def load_fare_structure():
    with open('data/metadata/fare_structure.json', 'r') as f:
        return json.load(f)

def calculate_fare(distance_km, is_weekend=False, use_smart_card=False):
    """Calculate fare based on distance and day"""
    fare_data = load_fare_structure()
    
    # Select appropriate fare slab
    slabs = fare_data['fare_slabs']['weekend'] if is_weekend else fare_data['fare_slabs']['weekday']
    
    # Find applicable slab
    base_fare = None
    time_limit = None
    for slab in slabs:
        if slab['min_distance_km'] <= distance_km <= slab['max_distance_km']:
            base_fare = slab['fare']
            time_limit = slab['time_limit_minutes']
            break
    
    if base_fare is None:
        # Distance exceeds max, use last slab
        base_fare = slabs[-1]['fare']
        time_limit = slabs[-1]['time_limit_minutes']
    
    # Apply smart card discount
    final_fare = base_fare
    if use_smart_card:
        discount = fare_data['smart_card_discount_percent']
        final_fare = round(base_fare * (1 - discount/100))
    
    return {
        'distance_km': distance_km,
        'base_fare': base_fare,
        'final_fare': final_fare,
        'time_limit_minutes': time_limit,
        'is_weekend': is_weekend,
        'smart_card_used': use_smart_card,
        'discount_amount': base_fare - final_fare if use_smart_card else 0
    }

def test_yellow_line_fares():
    """Test fares for Yellow Line journey examples"""
    
    print("="*60)
    print("YELLOW LINE FARE CALCULATOR - TEST CASES")
    print("="*60)
    
    test_cases = [
        {
            'route': 'Rajiv Chowk → Kashmere Gate',
            'distance': 4.0
        },
        {
            'route': 'Samaypur Badli → Rajiv Chowk',
            'distance': 17.2
        },
        {
            'route': 'Hauz Khas → HUDA City Centre',
            'distance': 18.3
        },
        {
            'route': 'Samaypur Badli → HUDA City Centre (Full line)',
            'distance': 45.7
        },
        {
            'route': 'Chandni Chowk → New Delhi',
            'distance': 1.8
        },
        {
            'route': 'Central Secretariat → Hauz Khas',
            'distance': 8.0
        }
    ]
    
    for test in test_cases:
        print(f"\n📍 {test['route']}")
        print(f"   Distance: {test['distance']} km")
        print()
        
        # Weekday token
        weekday = calculate_fare(test['distance'], is_weekend=False, use_smart_card=False)
        print(f"   💳 Weekday (Token):      ₹{weekday['final_fare']} (Time limit: {weekday['time_limit_minutes']} min)")
        
        # Weekday smart card
        weekday_sc = calculate_fare(test['distance'], is_weekend=False, use_smart_card=True)
        print(f"   💳 Weekday (Smart Card): ₹{weekday_sc['final_fare']} (Save ₹{weekday_sc['discount_amount']})")
        
        # Weekend token
        weekend = calculate_fare(test['distance'], is_weekend=True, use_smart_card=False)
        savings = weekday['final_fare'] - weekend['final_fare']
        print(f"   💳 Weekend (Token):      ₹{weekend['final_fare']} (Save ₹{savings} vs weekday)")
        
        # Weekend smart card (best price)
        weekend_sc = calculate_fare(test['distance'], is_weekend=True, use_smart_card=True)
        total_savings = weekday['final_fare'] - weekend_sc['final_fare']
        print(f"   💳 Weekend (Smart Card): ₹{weekend_sc['final_fare']} ⭐ BEST PRICE (Save ₹{total_savings} total)")
        
        print("   " + "-"*50)
    
    print("\n" + "="*60)
    print("✅ Fare calculation test complete!")
    print("="*60)

if __name__ == "__main__":
    test_yellow_line_fares()