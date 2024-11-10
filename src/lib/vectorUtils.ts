// src/lib/vectorUtils.ts

export function serializeVector(vector: number[]): string {
  return `{${vector.join(',')}}`;
}

export function deserializeVector(vectorStr: string): number[] {
  return vectorStr
    .replace(/[{}]/g, '')
    .split(',')
    .map(Number);
}