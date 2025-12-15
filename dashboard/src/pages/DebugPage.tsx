import { useEffect, useState } from 'react';

export function DebugPage() {
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    const SERVICE_PORTS: Record<string, number> = {
      "decision-intelligence": 3001,
    };

    const API_CONFIG = {
      baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
    };

    function getServiceBaseURL(serviceId?: string): string {
      if (!serviceId) {
        return API_CONFIG.baseURL;
      }
      const port = SERVICE_PORTS[serviceId];
      if (port) {
        const baseURL = new URL(API_CONFIG.baseURL);
        baseURL.port = port.toString();
        return baseURL.toString().replace(/\/$/, "");
      }
      return API_CONFIG.baseURL;
    }

    const envVar = import.meta.env.VITE_API_BASE_URL;
    const baseURL = API_CONFIG.baseURL;
    const testURL = getServiceBaseURL("decision-intelligence");

    setInfo({
      envVar,
      baseURL,
      testURL,
      allEnv: import.meta.env,
    });
  }, []);

  if (!info) return <div>Loading...</div>;

  const isCorrect = !info.testURL.includes('localhost') && info.testURL.includes('34.136.153.216');

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', background: '#1e1e1e', color: '#d4d4d4', minHeight: '100vh' }}>
      <h1 style={{ color: '#4ec9b0' }}>🔍 API URL Debug</h1>
      <div style={{ background: '#252526', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
        <div style={{ marginBottom: '15px' }}>
          <strong>import.meta.env.VITE_API_BASE_URL:</strong><br/>
          <code style={{ background: '#1e1e1e', padding: '5px', borderRadius: '3px' }}>
            {info.envVar || <span style={{ color: '#f48771' }}>undefined (BLANK)</span>}
          </code>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <strong>API_CONFIG.baseURL:</strong><br/>
          <code style={{ color: '#4fc1ff', fontWeight: 'bold' }}>{info.baseURL}</code>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <strong>getServiceBaseURL('decision-intelligence'):</strong><br/>
          <code style={{ color: '#4fc1ff', fontWeight: 'bold' }}>{info.testURL}</code>
        </div>

        <div style={{
          marginBottom: '15px',
          padding: '10px',
          border: `2px solid ${isCorrect ? '#89d185' : '#f48771'}`,
          borderRadius: '4px'
        }}>
          <strong>Status:</strong><br/>
          {isCorrect
            ? <span style={{ color: '#89d185' }}>✅ Using VM IP - Configuration is CORRECT</span>
            : <span style={{ color: '#f48771' }}>❌ Still using localhost or wrong URL - Configuration is WRONG</span>}
        </div>

        <div style={{ marginTop: '20px' }}>
          <strong>All import.meta.env values:</strong><br/>
          <pre style={{ background: '#1e1e1e', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
            {JSON.stringify(info.allEnv, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
