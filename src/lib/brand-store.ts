
import fs from 'fs';
import path from 'path';
import type { BrandInfo } from './types';

const dataFilePath = path.join(process.cwd(), 'data/brand.json');

// This function is intended for SERVER-SIDE USE ONLY.
export function getBrandInfo(): BrandInfo {
  try {
    const jsonData = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(jsonData);
  } catch (error) {
    console.error("Error reading brand info:", error);
    // Return a default/empty structure in case of an error
    return {
      name: "CulinaPreOrder",
      logoUrl: "",
      phone: "",
      adminEmail: "admin@example.com",
      showAddressInAbout: true,
      showPhoneInAbout: true,
      address: {
        label: "Main Branch",
        doorNumber: "",
        apartmentName: "",
        area: "",
        city: "",
        state: "",
        pincode: ""
      },
      about: "Welcome to our restaurant!",
      businessHours: {
        status: 'open',
        message: ''
      },
    };
  }
}

// This function is intended for SERVER-SIDE USE ONLY.
export function setBrandInfo(newBrandInfo: BrandInfo): void {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(newBrandInfo, null, 2));
  } catch (error) {
    console.error("Error writing brand info:", error);
  }
}
