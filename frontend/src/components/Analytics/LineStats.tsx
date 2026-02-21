import { useQuery } from '@tanstack/react-query';

interface LineStatsProps {
  selectedLine: 'Yellow' | 'Blue' | 'Violet' | 'Orange' | 'Aqua';
}

async function getStationsByLine(line: string) {
  const response = await fetch(`http://localhost:8000/api/stations?line=${line}`);
  if (!response.ok) throw new Error('Failed to fetch stations');
  return response.json();
}

async function getTrainsByLine(line: string) {
  const response = await fetch(`http://localhost:8000/api/trains/live?line=${line}`);
  if (!response.ok) throw new Error('Failed to fetch trains');
  return response.json();
}

export default function LineStats({ selectedLine }: LineStatsProps) {
  const { data: stationsData } = useQuery({
    queryKey: ['stations', selectedLine],
    queryFn: () => getStationsByLine(selectedLine),
  });

  const { data: trainsData } = useQuery({
    queryKey: ['trains', selectedLine],
    queryFn: () => getTrainsByLine(selectedLine),
  });

  const stations = stationsData?.stations || [];
  const trains = trainsData?.trains || [];
  const interchangeStations = stations.filter((s: any) => s.is_interchange).length;
  
  const totalLength = selectedLine === 'Yellow' ? 45.7 : 
                     selectedLine === 'Blue' ? 58.5 : 
                     selectedLine === 'Violet' ? 47.0 : 
                     selectedLine === 'Orange' ? 22.7 : 29.7;
  
  const avgStationDistance = stations.length > 1 ? (totalLength / (stations.length - 1)).toFixed(2) : '0';
  const trainFrequency = selectedLine === 'Orange' ? 15 : 
                        selectedLine === 'Aqua' ? 8 : 5;
  
  const dailyPassengers = selectedLine === 'Yellow' ? 218560 : 
                         selectedLine === 'Blue' ? 285000 : 
                         selectedLine === 'Violet' ? 195000 : 
                         selectedLine === 'Orange' ? 85000 : 125000;

  const lineColor = selectedLine === 'Yellow' ? '#fef9c3' : 
                   selectedLine === 'Blue' ? '#dbeafe' : 
                   selectedLine === 'Violet' ? '#f3e8ff' : 
                   selectedLine === 'Orange' ? '#fed7aa' : '#cffafe';

  const lineInfo = selectedLine === 'Yellow' ? (
    <>
      The Yellow Line runs from Samaypur Badli to HUDA City Centre, covering major areas including 
      North Delhi, Central Delhi, and Gurgaon. Currently operating with <strong>{trains.length} trains</strong>.
    </>
  ) : selectedLine === 'Blue' ? (
    <>
      The Blue Line runs from Dwarka Sector 21 to Noida Electronic City, covering major areas 
      including West Delhi, Central Delhi, and Noida. Currently operating with <strong>{trains.length} trains</strong>.
    </>
  ) : selectedLine === 'Violet' ? (
    <>
      The Violet Line runs from Kashmere Gate to Raja Nahar Singh (Ballabhgarh), covering major areas 
      including Central Delhi, South Delhi, and Faridabad. Currently operating with <strong>{trains.length} trains</strong>.
    </>
  ) : selectedLine === 'Orange' ? (
    <>
      The Orange Line (Airport Express) runs from New Delhi to IGI Airport Terminal 3 and Dwarka Sector 21, 
      providing premium high-speed service to the airport. Currently operating with <strong>{trains.length} trains</strong>.
      Features include luggage racks, airport check-in facilities, and faster travel speeds.
    </>
  ) : (
    <>
      The Aqua Line (Noida-Greater Noida Metro) runs from Noida Sector 51 to Greater Noida (Depot Station), 
      operated by Noida Metro Rail Corporation (NMRC). Currently operating with <strong>{trains.length} trains</strong>.
      This line connects major residential, commercial, and educational areas in Noida and Greater Noida.
    </>
  );

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{ padding: '24px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Stations</div>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#3b82f6' }}>{stations.length}</div>
        </div>
        <div style={{ padding: '24px', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Interchange Stations</div>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#dc2626' }}>{interchangeStations}</div>
        </div>
        <div style={{ padding: '24px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Line Length</div>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#10b981' }}>{totalLength} km</div>
        </div>
        <div style={{ padding: '24px', backgroundColor: '#fef9c3', borderRadius: '8px' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Avg Station Distance</div>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#f59e0b' }}>{avgStationDistance} km</div>
        </div>
        <div style={{ padding: '24px', backgroundColor: '#faf5ff', borderRadius: '8px' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Train Frequency</div>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#a855f7' }}>{trainFrequency} min</div>
        </div>
        <div style={{ padding: '24px', backgroundColor: '#ecfdf5', borderRadius: '8px' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Daily Passengers (Est.)</div>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#10b981' }}>{dailyPassengers.toLocaleString()}</div>
        </div>
      </div>

      {selectedLine === 'Orange' && (
        <div style={{
          padding: '20px',
          backgroundColor: '#fed7aa',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '2px solid #f97316'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#c2410c' }}>
            ✈️ Airport Express Premium Features
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <span>✅</span>
              <span>Luggage Storage Racks</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <span>✅</span>
              <span>Airport Check-in Facility</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <span>✅</span>
              <span>High-Speed Service (up to 135 km/h)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <span>✅</span>
              <span>Premium Seating</span>
            </div>
          </div>
        </div>
      )}

      {selectedLine === 'Aqua' && (
        <div style={{
          padding: '20px',
          backgroundColor: '#cffafe',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '2px solid #06b6d4'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#0e7490' }}>
            🏙️ Noida Metro Features
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <span>✅</span>
              <span>Connects Noida to Greater Noida</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <span>✅</span>
              <span>Operated by NMRC</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <span>✅</span>
              <span>Modern Elevated Stations</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <span>✅</span>
              <span>Interchange at Sector 51</span>
            </div>
          </div>
        </div>
      )}

      <div style={{
        padding: '24px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Operational Hours</h3>
        <div style={{ display: 'flex', gap: '40px' }}>
          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Weekday</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {selectedLine === 'Orange' ? '04:45 - 23:30' : 
               selectedLine === 'Aqua' ? '05:45 - 23:00' : '06:00 - 23:00'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Weekend</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {selectedLine === 'Orange' ? '04:45 - 23:30' : 
               selectedLine === 'Aqua' ? '05:45 - 23:00' : '06:00 - 23:30'}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '20px',
        padding: '24px',
        backgroundColor: lineColor,
        borderRadius: '8px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>
          {selectedLine === 'Orange' ? '✈️ ' : selectedLine === 'Aqua' ? '🏙️ ' : ''}{selectedLine} Line Information
        </h3>
        <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
          {lineInfo}
        </p>
      </div>
    </div>
  );
}
