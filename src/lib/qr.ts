import QRCode from 'qrcode';

/** The deployed application address. QR codes on passports and crates point here. */
export const DEPLOYED_URL = 'https://sooqroot.sooqroot.workers.dev';

/** Public passport address for a batch. No sign in is needed to open it. */
export function passportUrl(batchId: string): string {
  return `${DEPLOYED_URL}/#/passport/${encodeURIComponent(batchId)}`;
}

export function qrDataUrl(text: string, size = 160): Promise<string> {
  return QRCode.toDataURL(text, { margin: 1, width: size * 2, errorCorrectionLevel: 'M', color: { dark: '#183b2b', light: '#ffffff' } });
}
