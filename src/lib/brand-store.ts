
"use client";

import { initialBrandInfo } from './mock-data';
import type { BrandInfo } from './types';

let brandInfo: BrandInfo = { ...initialBrandInfo };

// ---- Public API for the Brand Store ----

export function getBrandInfo(): BrandInfo {
  return brandInfo;
}

export function setBrandInfo(newBrandInfo: BrandInfo): void {
  brandInfo = newBrandInfo;
}
