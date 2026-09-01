import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0A0B0F 0%, #171A28 100%)',
        color: '#5B7CFF',
        fontSize: 260,
        fontWeight: 700,
        letterSpacing: '-0.06em',
      }}
    >
      SP
    </div>,
    size,
  );
}
