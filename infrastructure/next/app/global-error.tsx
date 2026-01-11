"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{ 
            maxWidth: '500px', 
            textAlign: 'center',
            padding: '40px',
            border: '2px solid #ef4444',
            borderRadius: '12px'
          }}>
            <h1 style={{ fontSize: '48px', color: '#ef4444', marginBottom: '16px' }}>
              Erreur critique
            </h1>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              Une erreur critique s'est produite. Veuillez rafraîchir la page.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Réessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
