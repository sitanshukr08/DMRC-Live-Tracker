const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Station {
  id: number;
  station_id: string;
  name: string;
  display_name: string;
  line: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance_from_origin_km: number;
  layout: string;
  opened_year: number;
  is_interchange: boolean;
  interchange_lines: string[];
  facilities: string[];
}

export interface Train {
  train_id: string;
  line: string;
  current_position_km: number;
  direction: string;
  status: string;
  speed_kmh: number;
  current_passengers: number;
  capacity: number;
  next_station_id: number | null;
  next_station_name: string;
  last_updated: string;
}

export async function getAllStations(): Promise<Station[]> {
  const response = await fetch(`${API_BASE_URL}/api/stations`);
  if (!response.ok) throw new Error('Failed to fetch stations');
  const data = await response.json();
  return data.stations;
}

export async function getStationsByLine(line: string): Promise<Station[]> {
  const response = await fetch(`${API_BASE_URL}/api/stations?line=${line}`);
  if (!response.ok) throw new Error('Failed to fetch stations');
  const data = await response.json();
  return data.stations;
}

export async function getLiveTrains(): Promise<{ trains: Train[] }> {
  const response = await fetch(`${API_BASE_URL}/api/trains/live`);
  if (!response.ok) throw new Error('Failed to fetch trains');
  return response.json();
}

export async function getTrainsByLine(line: string): Promise<{ trains: Train[] }> {
  const response = await fetch(`${API_BASE_URL}/api/trains/live?line=${line}`);
  if (!response.ok) throw new Error('Failed to fetch trains');
  return response.json();
}
