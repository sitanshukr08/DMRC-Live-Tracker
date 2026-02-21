import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Station {
  id: number;
  name: string;
  is_interchange?: boolean;
}

interface RoutePlannerProps {
  stations: Station[];
  onClose: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function getRoute(sourceId: number, destinationId: number) {
  const response = await fetch(`${API_URL}/api/route/between/${sourceId}/${destinationId}`);
  if (!response.ok) throw new Error('Failed to fetch route');
  return response.json();
}
