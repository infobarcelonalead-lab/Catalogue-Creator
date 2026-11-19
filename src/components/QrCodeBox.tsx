import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QrCodeBoxProps {
  value: string;
  size?: number;
  darkColor?: string;
  lightColor?: string;
  label?: string;
  className?: string;
}

export function QrCodeBox({
  value,
  size = 84,
  darkColor = '#0F172A',
  lightColor = '#FFFFFF',
  label,
  className = '',
}: QrCodeBoxProps) {
  const [src, setSrc] = useState<string>('');

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value || 'https://sporttanger.com', {
      width: size * 2,
      margin: 1,
      color: { dark: darkColor, light: lightColor },
    })
      .then((url) => {
        if (active) setSrc(url);
      })
      .catch(() => {
        if (active) setSrc('');
      });
    return () => {
      active = false;
    };
  }, [value, size, darkColor, lightColor]);

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <div
        className="rounded-md bg-white p-1.5 border border-slate-200/80 flex items-center justify-center"
        style={{ width: size + 12, height: size + 12 }}
      >
        {src ? (
          <img
            src={src}
            alt={label || 'Código QR'}
            width={size}
            height={size}
            referrerPolicy="no-referrer"
            className="block w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 rounded-sm" />
        )}
      </div>
      {label ? (
        <span className="mt-1.5 text-[10px] leading-tight text-center opacity-80 max-w-[110px]">
          {label}
        </span>
      ) : null}
    </div>
  );
}
