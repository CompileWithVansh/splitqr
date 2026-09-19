import type { QrChunk, UpiProfile } from '../types';
import { buildUpiUrl, generateQrDataUrl } from './upi';

function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function computeSplitAmounts(
  totalAmount: number,
  threshold: number = 1999,
  strategy: 'max' | 'balanced' = 'max'
): number[] {
  if (totalAmount <= 0) return [];
  const safeTotal = round2(totalAmount);
  const safeThreshold = Math.max(10, round2(threshold));

  if (safeTotal <= safeThreshold) {
    return [safeTotal];
  }

  if (strategy === 'max') {
    const chunks: number[] = [];
    let remaining = safeTotal;

    while (remaining > safeThreshold) {
      chunks.push(safeThreshold);
      remaining = round2(remaining - safeThreshold);
    }

    if (remaining > 0) {
      chunks.push(remaining);
    }

    // Double check sum equality
    const currentSum = chunks.reduce((a, b) => a + b, 0);
    const diff = round2(safeTotal - currentSum);
    if (diff !== 0 && chunks.length > 0) {
      chunks[chunks.length - 1] = round2(chunks[chunks.length - 1] + diff);
    }

    return chunks;
  }

  // 'balanced' strategy: distribute evenly into N chunks all <= safeThreshold
  const count = Math.ceil(safeTotal / safeThreshold);
  const totalCents = Math.round(safeTotal * 100);
  const baseCents = Math.floor(totalCents / count);
  let remainderCents = totalCents - baseCents * count;

  const chunks: number[] = [];
  for (let i = 0; i < count; i++) {
    let cents = baseCents;
    if (remainderCents > 0) {
      cents += 1;
      remainderCents--;
    }
    chunks.push(cents / 100);
  }

  return chunks;
}

export async function createSplitSessionChunks(
  totalAmount: number,
  profile: UpiProfile
): Promise<QrChunk[]> {
  const amounts = computeSplitAmounts(
    totalAmount,
    profile.splitThreshold || 1999,
    profile.splitStrategy || 'max'
  );

  const totalParts = amounts.length;
  const chunks: QrChunk[] = [];

  for (let i = 0; i < totalParts; i++) {
    const amount = amounts[i];
    // Rotate UPI ID if multi-account mode is enabled and secondary UPI exists
    let chosenUpiId = profile.primaryUpiId;
    if (profile.multiAccountMode && profile.secondaryUpiId && i % 2 === 1) {
      chosenUpiId = profile.secondaryUpiId;
    }

    const note = `SplitQR Part ${i + 1} of ${totalParts}`;
    const upiUrl = buildUpiUrl(chosenUpiId, profile.payeeName, amount, note);
    const qrDataUrl = await generateQrDataUrl(upiUrl);

    chunks.push({
      id: `chunk_${Date.now()}_${i + 1}_${Math.random().toString(36).slice(2, 6)}`,
      partNumber: i + 1,
      totalParts,
      amount,
      upiId: chosenUpiId,
      payeeName: profile.payeeName,
      status: 'unpaid',
      upiUrl,
      qrDataUrl,
    });
  }

  return chunks;
}
