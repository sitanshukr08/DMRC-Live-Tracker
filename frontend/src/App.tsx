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

const getWebSocketURL = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    return apiUrl.replace('http://', 'ws://').replace('https://', 'wss://') + '/ws/trains';
  }
  return 'ws://localhost:8000/ws/trains';
};

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

  const { trains, isConnected } = useWebSocket(getWebSocketURL());

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
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>
              🚇 Delhi Metro Live Tracker
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
              Real-time tracking • {trains.length} trains • {stations.length} stations
              {isConnected ? ' • 🟢 Live' : ' • 🔴 Disconnected'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowRoutePlanner(!showRoutePlanner)}
              style={{
                padding: '10px 18px',
                backgroundColor: showRoutePlanner ? '#3b82f6' : 'white',
                color: showRoutePlanner ? 'white' : '#3b82f6',
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              🗺️ Plan Route
            </button>
            <button
              onClick={() => setShowTrainInfo(!showTrainInfo)}
              style={{
                padding: '10px 18px',
                backgroundColor: showTrainInfo ? '#10b981' : 'white',
                color: showTrainInfo ? 'white' : '#10b981',
                border: '2px solid #10b981',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              🚂 Train Info
            </button>
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              style={{
                padding: '10px 18px',
                backgroundColor: showAnalytics ? '#f59e0b' : 'white',
                color: showAnalytics ? 'white' : '#f59e0b',
                border: '2px solid #f59e0b',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              📊 Analytics
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <MapView
          yellowStations={yellowStations}
          blueStations={blueStations}
          violetStations={violetStations}
          orangeStations={orangeStations}
          aquaStations={aquaStations}
          yellowTrains={yellowTrains}
          blueTrains={blueTrains}
          violetTrains={violetTrains}
          orangeTrains={orangeTrains}
          aquaTrains={aquaTrains}
          onStationClick={handleStationClick}
        />
        <StationSearch stations={stations} onStationSelect={handleStationClick} />
      </div>

      {showTrainInfo && <TrainInfoPanel trains={trains} />}
      {showRoutePlanner && <RoutePlanner stations={stations} onClose={() => setShowRoutePlanner(false)} />}
      {showAnalytics && <AnalyticsDashboard onClose={() => setShowAnalytics(false)} />}
      {etaStation && <ETADisplay stationId={etaStation.id} stationName={etaStation.name} onClose={() => setETAStation(null)} />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
