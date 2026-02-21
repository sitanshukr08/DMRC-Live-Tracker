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

function calculateFare(distanceKm: number): number {
  if (distanceKm <= 2) return 10;
  if (distanceKm <= 5) return 20;
  if (distanceKm <= 12) return 30;
  if (distanceKm <= 21) return 40;
  if (distanceKm <= 32) return 50;
  return 60;
}

export default function RoutePlanner({ stations, onClose }: RoutePlannerProps) {
  const [source, setSource] = useState<number | null>(null);
  const [destination, setDestination] = useState<number | null>(null);

  const { data: routeData, isLoading, error } = useQuery({
    queryKey: ['route', source, destination],
    queryFn: () => source && destination ? getRoute(source, destination) : null,
    enabled: !!source && !!destination && source !== destination,
  });

  const fare = routeData?.total_distance_km ? calculateFare(routeData.total_distance_km) : null;

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '28px',
          maxWidth: '540px',
          width: '90%',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>🗺️ Plan Your Journey</h2>
          <button 
            onClick={onClose} 
            style={{ 
              fontSize: '28px', 
              cursor: 'pointer', 
              border: 'none', 
              background: 'none',
              color: '#6b7280',
              padding: '0 4px',
              lineHeight: '1',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
            📍 From Station:
          </label>
          <select
            value={source || ''}
            onChange={(e) => setSource(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
          >
            <option value="">Select source station</option>
            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name} {station.is_interchange ? '🔄' : ''}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
            📍 To Station:
          </label>
          <select
            value={destination || ''}
            onChange={(e) => setDestination(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
          >
            <option value="">Select destination station</option>
            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name} {station.is_interchange ? '🔄' : ''}
              </option>
            ))}
          </select>
        </div>

        {isLoading && (
          <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
            Calculating route...
          </div>
        )}

        {error && (
          <div style={{ padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px', color: '#dc2626', marginBottom: '16px' }}>
            Could not calculate route. Please try again.
          </div>
        )}

        {routeData && (
          <div style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Stations</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>{routeData.total_stations}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Distance</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{routeData.total_distance_km.toFixed(1)} km</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Time</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{Math.round(routeData.estimated_time_minutes)} min</div>
              </div>
            </div>

            {fare && (
              <div style={{ padding: '16px', backgroundColor: '#ecfdf5', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#059669', marginBottom: '4px' }}>Estimated Fare</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#047857' }}>₹{fare}</div>
              </div>
            )}

            <div style={{ marginTop: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
                Route ({routeData.direction})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {routeData.stations.map((station: any, index: number) => (
                  <div 
                    key={station.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px',
                      backgroundColor: 'white',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  >
                    <div style={{ 
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: index === 0 ? '#10b981' : index === routeData.stations.length - 1 ? '#dc2626' : '#3b82f6',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginRight: '12px',
                      flexShrink: 0,
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', color: '#111827' }}>{station.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{station.distance_from_origin_km.toFixed(1)} km</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!source && !destination && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🗺️</div>
            <p>Select source and destination to plan your journey</p>
          </div>
        )}
      </div>
    </div>
  );
}
