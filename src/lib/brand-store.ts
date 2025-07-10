
import fs from 'fs/promises';
import path from 'path';
import type { BrandInfo } from './types';

const dataFilePath = path.join(process.cwd(), 'data/brand.json');

// This function is intended for SERVER-SIDE USE ONLY.
export async function getBrandInfo(): Promise<BrandInfo> {
  try {
    const jsonData = await fs.readFile(dataFilePath, 'utf-8');
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
export async function setBrandInfo(newBrandInfo: BrandInfo): Promise<void> {
  try {
    await fs.writeFile(dataFilePath, JSON.stringify(newBrandInfo, null, 2));
  } catch (error) {
    console.error("Error writing brand info:", error);
    throw new Error("Could not save brand information.");
  }
}
