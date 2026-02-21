import { useQuery } from '@tanstack/react-query';

interface LineStatsProps {
  selectedLine: 'Yellow' | 'Blue' | 'Violet' | 'Orange' | 'Aqua';
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function getStationsByLine(line: string) {
  const response = await fetch(`${API_URL}/api/stations?line=${line}`);
  if (!response.ok) throw new Error('Failed to fetch stations');
  return response.json();
}

async function getTrainsByLine(line: string) {
  const response = await fetch(`${API_URL}/api/trains/live?line=${line}`);
  if (!response.ok) throw new Error('Failed to fetch trains');
  return response.json();
}
