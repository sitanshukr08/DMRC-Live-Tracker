export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Station {
  id: number;
  name: string;
  distance_from_origin_km: number;
  coordinates: Coordinates;
  is_interchange: boolean;
  interchange_lines?: string[];
  importance_score?: number;
  station_type?: string;
}

export interface Train {
  train_id: string;
  direction: 'towards_huda' | 'towards_samaypur';
  current_position_km: number;
  current_station_id: number;
  current_station_name: string;
  speed_kmh: number;
  status: 'moving' | 'at_station';
  capacity: number;
  current_passengers: number;
  last_updated: string;
}

export interface TrainResponse {
  timestamp: string;
  total_trains: number;
  trains: Train[];
}

export interface RouteStation {
  id: number;
  name: string;
  distance_from_origin_km: number;
  is_interchange: boolean;
  interchange_lines: string[];
}

export interface RouteResponse {
  source: RouteStation;
  destination: RouteStation;
  total_distance_km: number;
  estimated_time_minutes: number;
  total_stations: number;
  direction: string;
  stations: RouteStation[];
  interchange_stations: RouteStation[];
}

export interface JourneyResponse {
  journey: {
    source: RouteStation;
    destination: RouteStation;
    distance_km: number;
    estimated_time_minutes: number;
    direction: string;
  };
  route: {
    total_stations: number;
    stations: RouteStation[];
    interchange_stations: RouteStation[];
  };
  fare: {
    selected_fare: number;
    payment_method: string;
    is_weekend: boolean;
    time_limit_minutes: number;
    currency: string;
  };
}

export interface CrowdStation {
  station_id: number;
  station_name: string;
  crowd_percentage: number;
  crowd_label: string;
  crowd_color: string;
  crowd_emoji: string;
  is_interchange: boolean;
  coordinates?: Coordinates;
}
