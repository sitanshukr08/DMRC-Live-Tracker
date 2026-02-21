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

export default function ETADisplay({ stationId, stationName, onClose }: ETADisplayProps) {
  const { data: etaData, isLoading, error } = useQuery({
    queryKey: ['eta', stationId],
    queryFn: () => getETA(stationId),
    refetchInterval: 10000,
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (isLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading ETA...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }} onClick={onClose}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}>
          <p style={{ color: '#dc2626', fontSize: '18px', fontWeight: 'bold' }}>Failed to load ETA</p>
          <button
            onClick={onClose}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!etaData) return null;

  const directions = Object.entries(etaData.directions);

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
        zIndex: 2000,
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '28px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0 }}>🚇 Next Trains</h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>{stationName}</p>
          </div>
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

        {directions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            No trains approaching this station
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {directions.map(([direction, data]) => (
              <div key={direction} style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
                  → {data.direction_name}
                </h3>
                
                {data.trains.length === 0 ? (
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>No trains in this direction</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {data.trains.map((train) => {
                      const occupancy = (train.current_passengers / train.capacity) * 100;
                      const occupancyColor = occupancy > 80 ? '#dc2626' : occupancy > 60 ? '#f59e0b' : '#10b981';
                      
                      return (
                        <div 
                          key={train.train_id}
                          style={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            padding: '16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '4px' }}>
                              {train.eta_minutes} min
                            </div>
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>
                              {train.stations_away} {train.stations_away === 1 ? 'station' : 'stations'} away
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                              Occupancy
                            </div>
                            <div style={{ 
                              fontSize: '16px', 
                              fontWeight: 'bold', 
                              color: occupancyColor 
                            }}>
                              {occupancy.toFixed(0)}%
                            </div>
                            <div style={{ 
                              width: '80px', 
                              height: '6px', 
                              backgroundColor: '#e5e7eb', 
                              borderRadius: '3px',
                              marginTop: '6px',
                              overflow: 'hidden'
                            }}>
                              <div style={{ 
                                width: `${occupancy}%`, 
                                height: '100%', 
                                backgroundColor: occupancyColor,
                                transition: 'width 0.3s ease'
                              }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px', fontSize: '13px', color: '#3b82f6', textAlign: 'center' }}>
          ℹ️ Updates every 10 seconds
        </div>
      </div>
    </div>
  );
}
