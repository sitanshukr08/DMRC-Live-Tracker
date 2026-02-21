import { useQuery } from '@tanstack/react-query';

interface HourlyPatternsProps {
  selectedLine: 'Yellow' | 'Blue' | 'Violet' | 'Orange' | 'Aqua';
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function getHourlyPatterns(line: string) {
  const response = await fetch(`${API_URL}/api/analytics/hourly-patterns?line=${line}`);
  if (!response.ok) throw new Error('Failed to fetch hourly patterns');
  return response.json();
}
