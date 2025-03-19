import React, { useState } from 'react';

function App() {
  const [exporting, setExporting] = useState(false);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | ''>('');

  const handleExport = async () => {
    setExporting(true);
    setStatus('Exporting...');
    setStatusType('');

    try {
      // This is a placeholder for future React-based implementation
      // Currently, the extension uses plain JS in popup.js
      setStatus('Export successful!');
      setStatusType('success');
    } catch (error) {
      console.error('Export error:', error);
      setStatus('Export failed. Please try again.');
      setStatusType('error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="container">
      <h1>Chat Exporter</h1>
      <button
        className="button"
        onClick={handleExport}
        disabled={exporting}
      >
        {exporting ? 'Exporting...' : 'Export Chat'}
      </button>
      {status && (
        <div className={`status ${statusType}`}>
          {status}
        </div>
      )}
    </div>
  );
}

export default App;
