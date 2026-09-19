import QRCode from 'qrcode';

export function buildUpiUrl(
  upiId: string,
  payeeName: string,
  amount: number,
  transactionNote: string = 'SplitQR Payment'
): string {
  const cleanUpi = (upiId || '').trim();
  const cleanPayee = (payeeName || 'Merchant').trim();
  const formattedAmount = Number(amount || 0).toFixed(2);

  const params = new URLSearchParams({
    pa: cleanUpi,
    pn: cleanPayee,
    am: formattedAmount,
    cu: 'INR',
    tn: transactionNote,
  });

  return `upi://pay?${params.toString()}`;
}

export async function generateQrDataUrl(upiUrl: string): Promise<string> {
  try {
    return await QRCode.toDataURL(upiUrl, {
      errorCorrectionLevel: 'M',
      margin: 2,
      scale: 8,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate QR code data URL:', err);
    return '';
  }
}
