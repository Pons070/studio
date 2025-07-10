
import brandData from '../../data/brand.json';
import type { BrandInfo } from './types';

// NOTE: In a real app, this would fetch from a database.
// For this prototype, we are reading directly from a JSON file.

export function getBrandInfo(): BrandInfo {
  return brandData as BrandInfo;
}
