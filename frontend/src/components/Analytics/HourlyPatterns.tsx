import { useQuery } from '@tanstack/react-query';

interface HourlyPatternsProps {
  selectedLine: 'Yellow' | 'Blue' | 'Violet' | 'Orange' | 'Aqua';
}

async function getHourlyPatterns(line: string) {
  const response = await fetch(`http://localhost:8000/api/analytics/hourly-patterns?line=${line}`);
  if (!response.ok) throw new Error('Failed to fetch hourly patterns');
  return response.json();
}

export default function HourlyPatterns({ selectedLine }: HourlyPatternsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['hourly-patterns', selectedLine],
    queryFn: () => getHourlyPatterns(selectedLine),
    refetchInterval: 60000,
  });

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading patterns...</div>;
  }

  const patterns = data?.hourly_patterns || [];
  const peakHours = data?.peak_hours || [];
  const offPeakHours = data?.off_peak_hours || [];
  const line = data?.line || selectedLine;

  const totalDaily = patterns.reduce((sum: number, p: any) => sum + p.avg_passengers, 0);
  const avgHourly = Math.round(totalDaily / 24);
  const peakAvg = Math.round(
    patterns.filter((p: any) => peakHours.includes(p.hour))
      .reduce((sum: number, p: any) => sum + p.avg_passengers, 0) / peakHours.length
  );

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', backgroundColor: '#eff6ff', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Daily Total (Est.)</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>
            {totalDaily.toLocaleString()}
          </div>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#fef9c3', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Peak Hour Avg</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>
            {peakAvg.toLocaleString()}
          </div>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Hourly Average</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>
            {avgHourly.toLocaleString()}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', backgroundColor: '#fef9c3', borderRadius: '8px' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>⏰ Peak Hours</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            {peakHours.map((h: number) => `${h}:00`).join(', ')}
          </div>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>🌙 Off-Peak Hours</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            {offPeakHours.map((h: number) => `${h}:00`).join(', ')}
          </div>
        </div>
      </div>

      <div style={{
        padding: '16px',
        backgroundColor: line === 'Yellow' ? '#fef9c3' : line === 'Blue' ? '#dbeafe' : line === 'Violet' ? '#f3e8ff' : line === 'Orange' ? '#fed7aa' : '#cffafe',
        borderRadius: '8px',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <span style={{ fontSize: '14px', color: '#4b5563', fontWeight: 600 }}>
          📊 Showing data for {line === 'Orange' ? '✈️ ' : line === 'Aqua' ? '🏙️ ' : ''}{line} Line
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '16px'
      }}>
        {patterns.map((pattern: any) => {
          const isPeak = peakHours.includes(pattern.hour);
          const isCurrent = new Date().getHours() === pattern.hour;
          
          return (
            <div 
              key={pattern.hour} 
              style={{ 
                padding: '20px', 
                backgroundColor: isCurrent ? '#dcfce7' : isPeak ? '#fef9c3' : '#f3f4f6', 
                borderRadius: '8px', 
                textAlign: 'center',
                border: isCurrent ? '2px solid #10b981' : 'none',
                position: 'relative'
              }}
            >
              {isCurrent && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  fontSize: '10px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}>
                  NOW
                </div>
              )}
              <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                {pattern.hour}:00
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: isPeak ? '#f59e0b' : '#3b82f6' }}>
                {pattern.avg_passengers}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                {pattern.period}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
