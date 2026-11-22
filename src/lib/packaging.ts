import { Unit } from '../types';

/** Weight carried by one pack, in kilograms, read from the packaging description. */
export function packKgFor(packaging: string, unit: Unit): number {
  const m = packaging.match(/(\d+(?:\.\d+)?)\s*kg/i);
  if (m) return Number(m[1]);
  if (unit === 'jars') return 12 * 0.5;
  const p = packaging.toLowerCase();
  if (p.includes('cooler')) return 20;
  if (p.includes('clamshell') || p.includes('punnet')) return 5;
  return 10;
}

export function crateCountFor(qty: number, packKg: number): number {
  return Math.max(1, Math.ceil(qty / Math.max(0.5, packKg)));
}
