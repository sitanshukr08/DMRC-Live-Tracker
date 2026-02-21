interface Train {
  train_id: string;
  direction: string;
  status: string;
  next_station_name?: string;
  current_passengers: number;
  capacity: number;
}

interface TrainInfoPanelProps {
  trains: Train[];
}

export default function TrainInfoPanel({ trains }: TrainInfoPanelProps) {
  return (
    <div style={{
      position: 'absolute',
      top: '16px',
      left: '16px',
      zIndex: 1000,
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
      padding: '18px',
      maxHeight: '420px',
      overflowY: 'auto',
      width: '300px',
    }}>
      <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '14px', color: '#111827' }}>
        🚇 Live Trains ({trains.length})
      </h3>
      
      {trains.map(train => {
        const occupancy = ((train.current_passengers / train.capacity) * 100).toFixed(0);
        const isTowardsHuda = train.direction === 'towards_huda';
        
        return (
          <div key={train.train_id} style={{
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '14px',
            marginBottom: '14px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>{train.train_id}</div>
              <div style={{ 
                fontSize: '11px', 
                padding: '3px 10px', 
                borderRadius: '12px',
                fontWeight: 600,
                backgroundColor: train.status === 'moving' ? '#d1fae5' : '#fef3c7',
                color: train.status === 'moving' ? '#065f46' : '#92400e',
              }}>
                {train.status === 'moving' ? '🟢 Moving' : '🟡 Stopped'}
              </div>
            </div>
            
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px', fontWeight: 500 }}>
              {isTowardsHuda ? '→ HUDA City Centre' : '← Samaypur Badli'}
            </div>
            
            <div style={{ fontSize: '13px', marginBottom: '8px', color: '#374151' }}>
              <strong>Next:</strong> {train.next_station_name || 'N/A'}
            </div>
            
            <div style={{ marginBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', fontWeight: 500 }}>
                <span>Occupancy</span>
                <span>{occupancy}%</span>
              </div>
              <div style={{ 
                height: '8px', 
                backgroundColor: '#e5e7eb', 
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${occupancy}%`,
                  backgroundColor: Number(occupancy) > 80 ? '#ef4444' : Number(occupancy) > 60 ? '#f59e0b' : '#10b981',
                  transition: 'width 0.3s',
                  borderRadius: '4px',
                }}></div>
              </div>
            </div>
            
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
              👥 {train.current_passengers}/{train.capacity} passengers
            </div>
          </div>
        );
      })}
    </div>
  );
}
