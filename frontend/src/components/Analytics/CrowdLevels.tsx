import { useQuery } from '@tanstack/react-query';

interface CrowdLevelsProps {
  selectedLine: 'Yellow' | 'Blue' | 'Violet' | 'Orange' | 'Aqua';
}

async function getCrowdData(line: string) {
  const response = await fetch(`http://localhost:8000/api/analytics/crowd?line=${line}`);
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {sortedStations.map((station: any) => {
          const crowdLevel = station.crowd_level;
          let borderColor = '#10b981';
          
          if (crowdLevel > 80) {
            borderColor = '#dc2626';
          } else if (crowdLevel > 60) {
            borderColor = '#f59e0b';
          } else if (crowdLevel > 40) {
            borderColor = '#facc15';
          }

          return (
            <div 
              key={station.station_id} 
              style={{ 
                padding: '16px', 
                backgroundColor: 'white', 
                border: `2px solid ${borderColor}`, 
                borderRadius: '8px' 
              }}
            >
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                {station.station_name}
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: borderColor, marginBottom: '4px' }}>
                {crowdLevel}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {station.category}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
