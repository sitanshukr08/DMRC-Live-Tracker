import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Station } from '../../services/api';

interface MapViewProps {
  stations: Station[];
  trains: any[];
  selectedStation: Station | null;
  onStationClick: (station: Station) => void;
}

export default function MapView({ stations, trains, selectedStation, onStationClick }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const trainMarkersRef = useRef<{ [key: string]: L.Marker }>({});
  const lineLayersRef = useRef<{ [key: string]: L.Polyline }>({});

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map', {
        center: [28.6139, 77.2090],
        zoom: 11,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || stations.length === 0) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    Object.values(lineLayersRef.current).forEach(line => line.remove());
    lineLayersRef.current = {};

    const yellowStations = stations.filter(s => s.line === 'Yellow').sort((a, b) => a.distance_from_origin_km - b.distance_from_origin_km);
    const blueStations = stations.filter(s => s.line === 'Blue').sort((a, b) => a.distance_from_origin_km - b.distance_from_origin_km);
    const violetStations = stations.filter(s => s.line === 'Violet').sort((a, b) => a.distance_from_origin_km - b.distance_from_origin_km);
    const orangeStations = stations.filter(s => s.line === 'Orange').sort((a, b) => a.distance_from_origin_km - b.distance_from_origin_km);
    const aquaStations = stations.filter(s => s.line === 'Aqua').sort((a, b) => a.distance_from_origin_km - b.distance_from_origin_km);

    if (yellowStations.length > 0) {
      const yellowCoords = yellowStations.map(s => [s.coordinates.latitude, s.coordinates.longitude] as [number, number]);
      lineLayersRef.current['Yellow'] = L.polyline(yellowCoords, {
        color: '#facc15',
        weight: 4,
        opacity: 0.8,
      }).addTo(mapRef.current!);
    }

    if (blueStations.length > 0) {
      const blueCoords = blueStations.map(s => [s.coordinates.latitude, s.coordinates.longitude] as [number, number]);
      lineLayersRef.current['Blue'] = L.polyline(blueCoords, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.8,
      }).addTo(mapRef.current!);
    }

    if (violetStations.length > 0) {
      const violetCoords = violetStations.map(s => [s.coordinates.latitude, s.coordinates.longitude] as [number, number]);
      lineLayersRef.current['Violet'] = L.polyline(violetCoords, {
        color: '#8b5cf6',
        weight: 4,
        opacity: 0.8,
      }).addTo(mapRef.current!);
    }

    if (orangeStations.length > 0) {
      const orangeCoords = orangeStations.map(s => [s.coordinates.latitude, s.coordinates.longitude] as [number, number]);
      lineLayersRef.current['Orange'] = L.polyline(orangeCoords, {
        color: '#f97316',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 5',
      }).addTo(mapRef.current!);
    }

    if (aquaStations.length > 0) {
      const aquaCoords = aquaStations.map(s => [s.coordinates.latitude, s.coordinates.longitude] as [number, number]);
      lineLayersRef.current['Aqua'] = L.polyline(aquaCoords, {
        color: '#06b6d4',
        weight: 4,
        opacity: 0.8,
      }).addTo(mapRef.current!);
    }

    stations.forEach(station => {
      const color = station.is_interchange ? '#dc2626' : 
                    station.line === 'Yellow' ? '#facc15' : 
                    station.line === 'Blue' ? '#3b82f6' : 
                    station.line === 'Violet' ? '#8b5cf6' : 
                    station.line === 'Orange' ? '#f97316' : '#06b6d4';
      
      const marker = L.circleMarker(
        [station.coordinates.latitude, station.coordinates.longitude],
        {
          radius: station.is_interchange ? 8 : 6,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        }
      ).addTo(mapRef.current!);

      const tooltipText = station.line === 'Orange' ? `✈️ ${station.display_name}` : 
                         station.line === 'Aqua' ? `🏙️ ${station.display_name}` :
                         station.display_name;

      marker.bindTooltip(tooltipText, {
        permanent: false,
        direction: 'top',
        className: 'station-tooltip',
      });

      marker.on('click', () => onStationClick(station));
      markersRef.current.push(marker);
    });

  }, [stations, onStationClick]);

  useEffect(() => {
    if (!mapRef.current) return;

    const currentTrainIds = new Set(trains.map(t => t.train_id));
    
    Object.keys(trainMarkersRef.current).forEach(trainId => {
      if (!currentTrainIds.has(trainId)) {
        trainMarkersRef.current[trainId].remove();
        delete trainMarkersRef.current[trainId];
      }
    });

    trains.forEach(train => {
      const lineStations = stations
        .filter(s => s.line === train.line)
        .sort((a, b) => a.distance_from_origin_km - b.distance_from_origin_km);
      
      if (lineStations.length === 0) return;

      const totalDistance = lineStations[lineStations.length - 1].distance_from_origin_km;
      let trainPos = train.current_position_km % totalDistance;
      if (trainPos < 0) trainPos = totalDistance + trainPos;

      let station1 = lineStations[0];
      let station2 = lineStations[1];

      for (let i = 0; i < lineStations.length - 1; i++) {
        if (trainPos >= lineStations[i].distance_from_origin_km && 
            trainPos <= lineStations[i + 1].distance_from_origin_km) {
          station1 = lineStations[i];
          station2 = lineStations[i + 1];
          break;
        }
      }

      if (!station1 || !station2) return;

      const segmentStart = station1.distance_from_origin_km;
      const segmentEnd = station2.distance_from_origin_km;
      const segmentLength = segmentEnd - segmentStart;
      
      if (segmentLength === 0) return;
      
      const localProgress = (trainPos - segmentStart) / segmentLength;
      const clampedProgress = Math.max(0, Math.min(1, localProgress));

      const lat = station1.coordinates.latitude + 
                  (station2.coordinates.latitude - station1.coordinates.latitude) * clampedProgress;
      const lng = station1.coordinates.longitude + 
                  (station2.coordinates.longitude - station1.coordinates.longitude) * clampedProgress;

      const rotation = train.line === 'Blue' ? '90deg' : 
                      train.line === 'Violet' ? '45deg' : 
                      train.line === 'Orange' ? '-45deg' : 
                      train.line === 'Aqua' ? '135deg' : '0deg';
      
      const trainEmoji = train.line === 'Orange' ? '✈️' : '🚇';
      
      const trainIcon = L.divIcon({
        html: `<div class="train-marker" style="font-size: 24px; transform: rotate(${rotation});">${trainEmoji}</div>`,
        className: 'train-icon-wrapper',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      let marker = trainMarkersRef.current[train.train_id];

      if (marker) {
        marker.setLatLng([lat, lng]);
        marker.setIcon(trainIcon);
      } else {
        marker = L.marker([lat, lng], { 
          icon: trainIcon,
        }).addTo(mapRef.current!);
        trainMarkersRef.current[train.train_id] = marker;
      }

      const lineLabel = train.line === 'Orange' ? '✈️ Airport Express' : 
                       train.line === 'Aqua' ? '🏙️ Noida Metro' :
                       `${train.line} Line`;
      marker.bindTooltip(
        `<strong>${train.train_id}</strong> (${lineLabel})<br/>
         Status: ${train.status}<br/>
         Speed: ${train.speed_kmh} km/h<br/>
         ${train.current_passengers}/${train.capacity} passengers<br/>
         → ${train.next_station_name || 'Updating...'}`,
        { direction: 'top', className: 'train-tooltip' }
      );
    });

  }, [trains, stations]);

  useEffect(() => {
    if (!mapRef.current || !selectedStation) return;
    mapRef.current.setView([selectedStation.coordinates.latitude, selectedStation.coordinates.longitude], 14);
  }, [selectedStation]);

  return (
    <>
      <div id="map" style={{ width: '100%', height: '100%' }} />
      <style>{`
        .train-icon-wrapper {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        .train-marker {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .leaflet-marker-icon {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        .train-tooltip {
          background-color: rgba(0, 0, 0, 0.85);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          border: none;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .station-tooltip {
          background-color: rgba(255, 255, 255, 0.95);
          color: #1f2937;
          padding: 6px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        @keyframes train-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .train-marker:hover {
          animation: train-pulse 0.5s ease-in-out;
        }
      `}</style>
    </>
  );
}
