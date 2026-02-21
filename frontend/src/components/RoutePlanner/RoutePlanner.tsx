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

async function getRoute(sourceId: number, destinationId: number) {
  const response = await fetch(`http://localhost:8000/api/route/between/${sourceId}/${destinationId}`);
  if (!response.ok) throw new Error('Failed to fetch route');
  return response.json();
}

// Calculate fare based on distance (Delhi Metro fare structure)
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
              padding: '10px 12px',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">Select starting station</option>
            {stations.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
            🎯 To Station:
          </label>
          <select
            value={destination || ''}
            onChange={(e) => setDestination(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">Select destination station</option>
            {stations.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {isLoading && (
          <div style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
            <div>Calculating best route...</div>
          </div>
        )}

        {error && (
          <div style={{ 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '16px',
            color: '#991b1b',
            fontSize: '14px',
          }}>
            ❌ Unable to calculate route. Please try again.
          </div>
        )}

        {routeData && (
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e5e7eb',
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '16px', color: '#111827' }}>
              ✅ Journey Details
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '16px', 
              marginBottom: '20px',
              backgroundColor: 'white',
              padding: '16px',
              borderRadius: '8px',
            }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Distance</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#3b82f6' }}>
                  {routeData.total_distance_km?.toFixed(1)} km
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Duration</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#10b981' }}>
                  {routeData.estimated_time_minutes} min
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Fare</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#f59e0b' }}>
                  ₹{fare}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Stations</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#8b5cf6' }}>
                  {routeData.total_stations}
                </div>
              </div>
            </div>

            <div style={{ 
              backgroundColor: '#e0f2fe',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#075985',
            }}>
              <strong>Direction:</strong> {routeData.direction === 'towards_huda' ? '→ Towards HUDA City Centre' : '← Towards Samaypur Badli'}
              {routeData.interchange_stations?.length > 0 && (
                <div style={{ marginTop: '4px' }}>
                  <strong>Interchanges:</strong> {routeData.interchange_stations.length} station(s)
                </div>
              )}
            </div>

            {routeData.stations && routeData.stations.length > 0 && (
              <div style={{ 
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '16px',
              }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#374151' }}>
                  🚇 Route Stations:
                </div>
                <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                  {routeData.stations.map((station: any, idx: number) => (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: '6px',
                      paddingBottom: '6px',
                      borderBottom: idx < routeData.stations.length - 1 ? '1px dashed #e5e7eb' : 'none',
                    }}>
                      <div style={{ 
                        width: '10px', 
                        height: '10px', 
                        borderRadius: '50%', 
                        backgroundColor: station.is_interchange ? '#ef4444' : '#3b82f6',
                        marginRight: '10px',
                        flexShrink: 0,
                      }}></div>
                      <span style={{ 
                        fontWeight: idx === 0 || idx === routeData.stations.length - 1 ? 600 : 400,
                        flex: 1,
                      }}>
                        {station.name}
                      </span>
                      {station.is_interchange && (
                        <span style={{ fontSize: '11px', color: '#ef4444', marginLeft: '8px' }}>🔄</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
