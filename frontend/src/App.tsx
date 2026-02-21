import { useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import MapView from "./components/Map/MapView";
import StationSearch from "./components/Search/StationSearch";
import RoutePlanner from "./components/RoutePlanner/RoutePlanner";
import TrainInfoPanel from "./components/TrainInfo/TrainInfoPanel";
import AnalyticsDashboard from "./components/Analytics/AnalyticsDashboard";
import ETADisplay from "./components/ETA/ETADisplay";
import { getAllStations, type Station } from "./services/api";
import { useWebSocket } from "./hooks/useWebSocket";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 30000,
      staleTime: 20000,
    },
  },
});

function AppContent() {
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [showRoutePlanner, setShowRoutePlanner] = useState(false);
  const [showTrainInfo, setShowTrainInfo] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [etaStation, setETAStation] = useState<Station | null>(null);

  const { data: stationsData, isLoading: stationsLoading } = useQuery({
    queryKey: ["stations"],
    queryFn: getAllStations,
  });

  const { trains, isConnected } = useWebSocket('ws://localhost:8000/ws/trains');

  if (stationsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Delhi Metro...</p>
        </div>
      </div>
    );
  }

  const stations = stationsData || [];
  const yellowStations = stations.filter(s => s.line === 'Yellow');
  const blueStations = stations.filter(s => s.line === 'Blue');
  const violetStations = stations.filter(s => s.line === 'Violet');
  const orangeStations = stations.filter(s => s.line === 'Orange');
  const aquaStations = stations.filter(s => s.line === 'Aqua');
  const yellowTrains = trains.filter(t => t.line === 'Yellow');
  const blueTrains = trains.filter(t => t.line === 'Blue');
  const violetTrains = trains.filter(t => t.line === 'Violet');
  const orangeTrains = trains.filter(t => t.line === 'Orange');
  const aquaTrains = trains.filter(t => t.line === 'Aqua');

  const handleStationClick = (station: Station) => {
    setSelectedStation(station);
    setETAStation(station);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        position: 'relative', 
        zIndex: 1001, 
        backgroundColor: 'white', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '16px 20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  🚇 Delhi Metro - Live Tracker
                </h1>
                {isConnected && (
                  <div style={{ 
                    width: '10px', 
                    height: '10px', 
                    borderRadius: '50%', 
                    backgroundColor: '#10b981',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  }} title="Live updates active" />
                )}
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
                <span style={{ color: '#facc15', fontWeight: 600 }}>🟡 Yellow: {yellowStations.length} stations, {yellowTrains.length} trains</span>
                <span style={{ margin: '0 4px' }}>•</span>
                <span style={{ color: '#3b82f6', fontWeight: 600 }}>🔵 Blue: {blueStations.length} stations, {blueTrains.length} trains</span>
                <span style={{ margin: '0 4px' }}>•</span>
                <span style={{ color: '#8b5cf6', fontWeight: 600 }}>🟣 Violet: {violetStations.length} stations, {violetTrains.length} trains</span>
                <span style={{ margin: '0 4px' }}>•</span>
                <span style={{ color: '#f97316', fontWeight: 600 }}>🟠 Orange: {orangeStations.length} stations, {orangeTrains.length} trains</span>
                <span style={{ margin: '0 4px' }}>•</span>
                <span style={{ color: '#06b6d4', fontWeight: 600 }}>🔵 Aqua: {aquaStations.length} stations, {aquaTrains.length} trains</span>
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <StationSearch stations={stations} onStationSelect={handleStationClick} />
            
            <button
              onClick={() => setShowRoutePlanner(true)}
              style={{
                padding: '10px 18px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              📍 Plan Route
            </button>
            
            <button
              onClick={() => setShowAnalytics(true)}
              style={{
                padding: '10px 18px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}
            >
              📊 Analytics
            </button>
            
            <button
              onClick={() => setShowTrainInfo(!showTrainInfo)}
              style={{
                padding: '10px 18px',
                backgroundColor: showTrainInfo ? '#10b981' : '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = showTrainInfo ? '#059669' : '#4b5563';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = showTrainInfo ? '#10b981' : '#6b7280';
              }}
            >
              {showTrainInfo ? '🚇 Hide Trains' : '🚇 Show Trains'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <MapView
          stations={stations}
          trains={trains}
          selectedStation={selectedStation}
          onStationClick={handleStationClick}
        />
        
        {showTrainInfo && <TrainInfoPanel trains={trains} />}
      </div>

      <div style={{
        position: 'absolute',
        bottom: '16px',
        right: '16px',
        zIndex: 1000,
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        padding: '16px'
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Legend</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '4px', backgroundColor: '#facc15' }}></div>
            <span>Yellow Line</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '4px', backgroundColor: '#3b82f6' }}></div>
            <span>Blue Line</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '4px', backgroundColor: '#8b5cf6' }}></div>
            <span>Violet Line</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '4px', backgroundColor: '#f97316' }}></div>
            <span>Orange Line (Airport Express)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '4px', backgroundColor: '#06b6d4' }}></div>
            <span>Aqua Line (Noida Metro)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#dc2626', border: '2px solid white' }}></div>
            <span>Interchange</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🚇</span>
            <span>Live Train</span>
          </div>
        </div>
      </div>

      {showRoutePlanner && (
        <RoutePlanner 
          stations={stations} 
          onClose={() => setShowRoutePlanner(false)} 
        />
      )}

      {showAnalytics && (
        <AnalyticsDashboard onClose={() => setShowAnalytics(false)} />
      )}

      {etaStation && (
        <ETADisplay 
          stationId={etaStation.id}
          stationName={etaStation.name}
          onClose={() => setETAStation(null)}
        />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
