import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #020617 0%, #0F172A 100%)',
          borderRadius: '110px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '8px',
            background: 'linear-gradient(135deg, #1E293B 0%, #020617 100%)',
            borderRadius: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* A glowing stylized "O" for Odyssey */}
          <div
            style={{
              width: '60%',
              height: '60%',
              border: '40px solid #3B82F6',
              borderRadius: '50%',
              boxShadow: '0 0 80px rgba(59, 130, 246, 0.8), inset 0 0 80px rgba(59, 130, 246, 0.8)',
              display: 'flex',
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
