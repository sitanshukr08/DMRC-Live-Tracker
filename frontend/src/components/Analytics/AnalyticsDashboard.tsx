import { useState } from 'react';
import CrowdLevels from './CrowdLevels';
import HourlyPatterns from './HourlyPatterns';
import LineStats from './LineStats';

interface AnalyticsDashboardProps {
  onClose: () => void;
}

export default function AnalyticsDashboard({ onClose }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'crowd' | 'hourly' | 'stats'>('crowd');
  const [selectedLine, setSelectedLine] = useState<'Yellow' | 'Blue' | 'Violet' | 'Orange' | 'Aqua'>('Yellow');

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
              📊 Analytics Dashboard
            </h2>
            
            <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f3f4f6', padding: '4px', borderRadius: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedLine('Yellow')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: selectedLine === 'Yellow' ? '#facc15' : 'transparent',
                  color: selectedLine === 'Yellow' ? '#000' : '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                🟡 Yellow
              </button>
              <button
                onClick={() => setSelectedLine('Blue')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: selectedLine === 'Blue' ? '#3b82f6' : 'transparent',
                  color: selectedLine === 'Blue' ? '#fff' : '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                🔵 Blue
              </button>
              <button
                onClick={() => setSelectedLine('Violet')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: selectedLine === 'Violet' ? '#8b5cf6' : 'transparent',
                  color: selectedLine === 'Violet' ? '#fff' : '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                🟣 Violet
              </button>
              <button
                onClick={() => setSelectedLine('Orange')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: selectedLine === 'Orange' ? '#f97316' : 'transparent',
                  color: selectedLine === 'Orange' ? '#fff' : '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                🟠 Orange
              </button>
              <button
                onClick={() => setSelectedLine('Aqua')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: selectedLine === 'Aqua' ? '#06b6d4' : 'transparent',
                  color: selectedLine === 'Aqua' ? '#fff' : '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                🔵 Aqua
              </button>
            </div>
          </div>
          
          <button
            onClick={onClose}
            style={{
              padding: '8px 12px',
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 24px',
          gap: '8px'
        }}>
          <button
            onClick={() => setActiveTab('crowd')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'crowd' ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === 'crowd' ? '#3b82f6' : '#6b7280',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            👥 Crowd Levels
          </button>
          <button
            onClick={() => setActiveTab('hourly')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'hourly' ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === 'hourly' ? '#3b82f6' : '#6b7280',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            📈 Hourly Patterns
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'stats' ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === 'stats' ? '#3b82f6' : '#6b7280',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            📋 Line Stats
          </button>
        </div>

        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px'
        }}>
          {activeTab === 'crowd' && <CrowdLevels selectedLine={selectedLine} />}
          {activeTab === 'hourly' && <HourlyPatterns selectedLine={selectedLine} />}
          {activeTab === 'stats' && <LineStats selectedLine={selectedLine} />}
        </div>
      </div>
    </div>
  );
}
