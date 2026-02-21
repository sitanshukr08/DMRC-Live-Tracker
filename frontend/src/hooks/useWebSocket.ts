import { useEffect, useState, useRef } from 'react';

interface Train {
  train_id: string;
  line: string;
  current_position_km: number;
  direction: string;
  status: string;
  speed_kmh: number;
  current_passengers: number;
  capacity: number;
  last_updated: string;
  next_station_id: number | null;
  next_station_name: string;
}

interface WebSocketMessage {
  trains: Train[];
  timestamp: string;
  total_trains: number;
}

export function useWebSocket(url: string) {
  const [trains, setTrains] = useState<Train[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;

    const connect = () => {
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isMounted) {
            console.log('✅ WebSocket connected');
            setIsConnected(true);
          }
        };

        ws.onmessage = (event) => {
          try {
            const data: WebSocketMessage = JSON.parse(event.data);
            if (isMounted && data.trains) {
              console.log(`🚇 Received ${data.trains.length} trains via WebSocket`);
              setTrains(data.trains);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('🔌 WebSocket disconnected');
          if (isMounted) {
            setIsConnected(false);
            // Attempt to reconnect after 3 seconds
            reconnectTimeoutRef.current = setTimeout(() => {
              if (isMounted) {
                console.log('🔄 Attempting to reconnect WebSocket...');
                connect();
              }
            }, 3000);
          }
        };
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        if (isMounted) {
          reconnectTimeoutRef.current = setTimeout(() => {
            if (isMounted) {
              connect();
            }
          }, 3000);
        }
      }
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url]);

  return { trains, isConnected };
}
