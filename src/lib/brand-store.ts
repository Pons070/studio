
import type { BrandInfo } from './types';
import { initialBrandInfo } from './mock-data';

declare global {
  var brandInfoStore: BrandInfo | undefined;
}

const getStore = (): BrandInfo => {
    if (!globalThis.brandInfoStore) {
        globalThis.brandInfoStore = initialBrandInfo;
    }
    return globalThis.brandInfoStore;
}

// ---- Public API for the Brand Store ----

export function getBrandInfo(): BrandInfo {
  return getStore();
}

export function setBrandInfo(newBrandInfo: BrandInfo) {
  globalThis.brandInfoStore = newBrandInfo;
}
