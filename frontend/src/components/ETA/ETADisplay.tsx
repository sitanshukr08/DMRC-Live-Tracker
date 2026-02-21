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

async function getETA(stationId: number): Promise<ETAData> {
  const response = await fetch(`http://localhost:8000/api/eta/station/${stationId}`);
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

  const directions = etaData?.directions || {};
  const directionKeys = Object.keys(directions);

  const lineColor = etaData?.line === 'Yellow' ? '#facc15' : 
                   etaData?.line === 'Blue' ? '#3b82f6' : 
                   etaData?.line === 'Violet' ? '#8b5cf6' : '#f97316';

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
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: lineColor,
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px' }}>{etaData?.line === 'Orange' ? '✈️' : '🚇'}</span>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                Next Trains at {stationName}
              </h2>
            </div>
            {etaData?.line && (
              <p style={{ fontSize: '14px', color: '#4b5563', margin: '4px 0 0 32px' }}>
                {etaData.line} Line {etaData.line === 'Orange' ? '(Airport Express)' : ''}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {directionKeys.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <p style={{ fontSize: '16px' }}>No train information available</p>
            </div>
          ) : (
            directionKeys.map(directionKey => {
              const direction = directions[directionKey];
              const trains = direction.trains || [];

              return (
                <div key={directionKey} style={{ marginBottom: '24px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px',
                    paddingBottom: '8px',
                    borderBottom: '2px solid #e5e7eb',
                  }}>
                    <span style={{ fontSize: '20px' }}>→</span>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                      {direction.direction_name}
                    </h3>
                  </div>

                  {trains.length === 0 ? (
                    <div style={{
                      padding: '20px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      textAlign: 'center',
                      color: '#6b7280',
                    }}>
                      No trains currently approaching
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {trains.map((train, index) => (
                        <div
                          key={train.train_id}
                          style={{
                            padding: '16px',
                            backgroundColor: index === 0 ? '#eff6ff' : '#f9fafb',
                            borderRadius: '8px',
                            border: index === 0 ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '18px' }}>{etaData?.line === 'Orange' ? '✈️' : '🚇'}</span>
                              <span style={{ fontWeight: '600', color: '#1f2937' }}>{train.train_id}</span>
                              {index === 0 && (
                                <span style={{
                                  padding: '2px 8px',
                                  backgroundColor: '#3b82f6',
                                  color: 'white',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                }}>
                                  Next
                                </span>
                              )}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                                {train.eta_minutes} min
                              </div>
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                {train.stations_away} {train.stations_away === 1 ? 'station' : 'stations'} away
                              </div>
                            </div>
                          </div>

                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginTop: '8px',
                            paddingTop: '8px',
                            borderTop: '1px solid #e5e7eb',
                          }}>
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>👥 Occupancy:</span>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{
                                flex: 1,
                                height: '8px',
                                backgroundColor: '#e5e7eb',
                                borderRadius: '4px',
                                overflow: 'hidden',
                              }}>
                                <div style={{
                                  width: `${(train.current_passengers / train.capacity) * 100}%`,
                                  height: '100%',
                                  backgroundColor: train.current_passengers / train.capacity > 0.8 ? '#dc2626' :
                                                  train.current_passengers / train.capacity > 0.6 ? '#f59e0b' : '#10b981',
                                  transition: 'width 0.3s ease',
                                }} />
                              </div>
                              <span style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                                {train.current_passengers}/{train.capacity}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}

          <div style={{
            marginTop: '20px',
            padding: '12px',
            backgroundColor: '#f0fdf4',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#166534',
            textAlign: 'center',
          }}>
            🔄 Auto-updating every 10 seconds
          </div>
        </div>
      </div>
    </div>
  );
}
