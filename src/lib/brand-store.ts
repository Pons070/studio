
import fs from 'fs';
import path from 'path';
import type { BrandInfo } from './types';

const dataFilePath = path.join(process.cwd(), 'data/brand.json');
let brandCache: BrandInfo | null = null;

function readStore(): BrandInfo {
    if (brandCache) {
        return brandCache;
    }
    try {
        const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
        const data = JSON.parse(fileContent);
        brandCache = data;
        return data;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            console.error(`Error: Brand data file not found at ${dataFilePath}. Please ensure it exists.`);
            // In a real app, you might want a more robust fallback or error handling
            throw new Error("Brand information is missing.");
        }
        throw error;
    }
}

function writeStore(data: BrandInfo): void {
    brandCache = data;
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ---- Public API for the Brand Store ----

export function getBrandInfo(): BrandInfo {
  return readStore();
}

export function setBrandInfo(newBrandInfo: BrandInfo): void {
  writeStore(newBrandInfo);
}
