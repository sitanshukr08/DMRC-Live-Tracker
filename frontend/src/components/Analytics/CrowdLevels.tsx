import { useQuery } from '@tanstack/react-query';

interface CrowdLevelsProps {
  selectedLine: 'Yellow' | 'Blue' | 'Violet' | 'Orange' | 'Aqua';
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function getCrowdData(line: string) {
  const response = await fetch(`${API_URL}/api/analytics/crowd?line=${line}`);
  if (!response.ok) throw new Error('Failed to fetch crowd data');
  return response.json();
}

export default function CrowdLevels({ selectedLine }: CrowdLevelsProps) {
  const { data: crowdData, isLoading, error } = useQuery({
    queryKey: ['crowd', selectedLine],
    queryFn: () => getCrowdData(selectedLine),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading crowd data...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#dc2626' }}>
      Error loading data. Please try again.
    </div>;
  }

  const currentPeriod = String(crowdData?.current_period || 'off-peak');
  const totalPassengers = Number(crowdData?.total_current_passengers || 0);
  const busiestStation = String(crowdData?.busiest_station || 'Unknown');
  const stationCrowds = crowdData?.station_crowds || [];

  if (stationCrowds.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
      No crowd data available for {selectedLine} Line
    </div>;
  }

  const sortedStations = [...stationCrowds].sort((a: any, b: any) => b.crowd_level - a.crowd_level);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', backgroundColor: '#eff6ff', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Period</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6', textTransform: 'capitalize' }}>
            {currentPeriod}
          </div>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Passengers</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>
            {totalPassengers.toLocaleString()}
          </div>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Busiest Station</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#dc2626' }}>
            {busiestStation}
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#1f2937' }}>
          Station-wise Crowd Levels
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {sortedStations.map((station: any) => {
            const crowdPercentage = (station.crowd_level / 100) * 100;
            const crowdColor = crowdPercentage > 75 ? '#dc2626' : crowdPercentage > 50 ? '#f59e0b' : '#10b981';
            
            return (
              <div key={station.station_id} style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600', color: '#374151' }}>{station.station_name}</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: crowdColor }}>
                    {station.crowd_level}%
                  </span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${crowdPercentage}%`, 
                    backgroundColor: crowdColor,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ marginTop: '8px', fontSize: '13px', color: '#6b7280' }}>
                  Est. {station.estimated_passengers?.toLocaleString() || 'N/A'} passengers
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
