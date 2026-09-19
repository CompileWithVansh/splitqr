import type { QrChunk, UpiProfile } from '../types';
import { buildUpiUrl, generateQrDataUrl } from './upi';

function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function computeSplitAmounts(
  totalAmount: number,
  threshold: number = 1999,
  strategy: 'max' | 'balanced' | 'random' = 'max'
): number[] {
  if (totalAmount <= 0) return [];
  const safeTotal = round2(totalAmount);
  const safeThreshold = Math.max(10, round2(threshold));

  if (safeTotal <= safeThreshold) {
    return [safeTotal];
  }

  // 1. Greedy Max Strategy (₹1,999 chunks + remainder)
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

  // 2. Anti-Tracing Random Natural Split (Organic jitter, e.g. ₹2,500 -> ₹1,747 + ₹753)
  if (strategy === 'random') {
    const count = Math.max(2, Math.ceil(safeTotal / safeThreshold));
    let remPaisa = Math.round(safeTotal * 100);
    const threshPaisa = Math.round(safeThreshold * 100);
    
    // Natural minimum per chunk (e.g. ₹50 or safe floor)
    const minFloor = Math.max(20, Math.min(100, Math.floor(safeTotal / (count * 4))));
    const minPaisaFloor = Math.round(minFloor * 100);
    const isWholeRupees = remPaisa % 100 === 0 && threshPaisa % 100 === 0;

    const chunks: number[] = [];
    for (let i = 0; i < count - 1; i++) {
      const remainingCount = count - i;
      // Bounds ensuring all remaining chunks can stay within [minFloor, safeThreshold]
      const lowerBoundPaisa = Math.max(minPaisaFloor, remPaisa - (remainingCount - 1) * threshPaisa);
      const upperBoundPaisa = Math.min(threshPaisa, remPaisa - (remainingCount - 1) * minPaisaFloor);

      let chosenPaisa = lowerBoundPaisa;
      if (upperBoundPaisa > lowerBoundPaisa) {
        if (isWholeRupees) {
          const lowerR = Math.ceil(lowerBoundPaisa / 100);
          const upperR = Math.floor(upperBoundPaisa / 100);
          if (upperR >= lowerR) {
            const chosenR = Math.floor(lowerR + Math.random() * (upperR - lowerR + 1));
            chosenPaisa = chosenR * 100;
          }
        } else {
          chosenPaisa = Math.round(lowerBoundPaisa + Math.random() * (upperBoundPaisa - lowerBoundPaisa));
        }
      }

      chunks.push(round2(chosenPaisa / 100));
      remPaisa -= chosenPaisa;
    }

    // Last chunk takes the exact remainder
    chunks.push(round2(remPaisa / 100));

    // Fisher-Yates shuffle so high/low amounts are unpredictably ordered
    for (let i = chunks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chunks[i], chunks[j]] = [chunks[j], chunks[i]];
    }

    // Precision guarantee: enforce exact total match
    const currentSum = chunks.reduce((a, b) => a + b, 0);
    const diff = round2(safeTotal - currentSum);
    if (diff !== 0 && chunks.length > 0) {
      chunks[chunks.length - 1] = round2(chunks[chunks.length - 1] + diff);
    }

    return chunks;
  }

  // 3. 'balanced' strategy: distribute evenly into N chunks all <= safeThreshold
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
