import { useState, useRef, useEffect } from 'react';

interface Station {
  id: number;
  name: string;
  display_name?: string;
  is_interchange: boolean;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance_from_origin_km: number;
}

interface StationSearchProps {
  stations: Station[];
  onStationSelect: (station: Station) => void;
}

export default function StationSearch({ stations, onStationSelect }: StationSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredStations = query.length > 0
    ? stations.filter(s => 
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.display_name?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10)
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '350px' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          placeholder="🔍 Search stations..."
          style={{
            width: '100%',
            padding: '10px 14px',
            border: '2px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            backgroundColor: 'white',
            boxSizing: 'border-box',
          }}
        />
      </div>
      
      {isOpen && filteredStations.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          maxHeight: '350px',
          overflowY: 'auto',
          zIndex: 99999,
        }}>
          {filteredStations.map(station => (
            <div
              key={station.id}
              onClick={() => {
                onStationSelect(station);
                setQuery('');
                setIsOpen(false);
              }}
              style={{
                padding: '12px 14px',
                cursor: 'pointer',
                borderBottom: '1px solid #f3f4f6',
                fontSize: '14px',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <div style={{ fontWeight: 500, marginBottom: '2px' }}>{station.name}</div>
              {station.is_interchange && (
                <div style={{ fontSize: '12px', color: '#ef4444' }}>
                  🔄 Interchange Station
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
