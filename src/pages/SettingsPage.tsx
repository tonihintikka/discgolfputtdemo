import React from 'react';

const SettingsPage: React.FC = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Settings</h1>
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '4px' }}>
        <h2>Language Settings</h2>
        <p>This is a simple test of the settings page.</p>
        <button 
          style={{ 
            padding: '10px 20px',
            background: '#2e7d32',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Button
        </button>
      </div>
    </div>
  );
};

export default SettingsPage; 