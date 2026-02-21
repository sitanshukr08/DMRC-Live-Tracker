import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

interface ETADisplayProps {
  stationId: number;
  stationName: string;
  onClose: () => void;
}

interface ETAData {
  station_id: number;
  station_name: string;
  line: string;
  directions: {
    [key: string]: {
      direction_name: string;
      trains: Array<{
        train_id: string;
        eta_minutes: number;
        stations_away: number;
        current_passengers: number;
        capacity: number;
      }>;
    };
  };
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function getETA(stationId: number): Promise<ETAData> {
  const response = await fetch(`${API_URL}/api/eta/station/${stationId}`);
  if (!response.ok) throw new Error('Failed to fetch ETA');
  return response.json();
}
