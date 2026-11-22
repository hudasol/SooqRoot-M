import { useEffect, useState } from 'react';
import { passportUrl, qrDataUrl } from '../lib/qr';

/** QR code for a batch passport. Generated in the browser with the qrcode package. */
export function QrCode({ batchId, size = 112, className = '' }: { batchId: string; size?: number; className?: string }) {
  const [src, setSrc] = useState<string>('');
  useEffect(() => {
    let alive = true;
    qrDataUrl(passportUrl(batchId), size)
      .then((u) => alive && setSrc(u))
      .catch(() => alive && setSrc(''));
    return () => {
      alive = false;
    };
  }, [batchId, size]);

  return src ? (
    <img src={src} width={size} height={size} alt={`QR ${batchId}`} className={`rounded-md bg-white ${className}`} />
  ) : (
    <span style={{ width: size, height: size }} className={`inline-block rounded-md bg-charcoal-100 ${className}`} />
  );
}
