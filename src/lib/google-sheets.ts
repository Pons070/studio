
import { google } from 'googleapis';

// --- IMPORTANT SETUP INSTRUCTIONS ---
// 1. Enable the Google Sheets API in your Google Cloud project.
// 2. Create a service account in your Google Cloud project.
// 3. Create and download a JSON key for the service account.
// 4. Share your Google Sheet with the service account's email address (e.g., your-service-account@your-project.iam.gserviceaccount.com).
// 5. Create a .env.local file in your project root and add the following variables:
//
//    GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
//    GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"
//    SPREADSHEET_ID=1oxr5VV4CkFJDtLcF_LiRy2h0hEhnBuSRSVp3POfY9Mc
//
//    Note: The private key must be wrapped in quotes and include the `\n` characters.

const SPREADSHEET_ID = process.env.SPREADSHEET_ID!;

const getAuth = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth;
};

const getSheets = () => {
  const auth = getAuth();
  return google.sheets({ version: 'v4', auth });
}

// Helper to convert sheet rows to an array of objects
const rowsToObjects = (headers: any[], rows: any[][]) => {
  return rows.map((row) => {
    const obj: { [key: string]: any } = {};
    headers.forEach((header, i) => {
      let value = row[i];
      // Attempt to parse JSON strings for arrays/objects
      try {
        if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
          value = JSON.parse(value);
        }
      } catch (e) {
        // Not a valid JSON string, keep as is
      }
      obj[header] = value;
    });
    return obj;
  });
};

export async function getSheetData(range: string) {
  try {
    const sheets = getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });
    const rows = response.data.values;
    if (rows && rows.length > 1) {
      const headers = rows[0];
      const dataRows = rows.slice(1);
      return rowsToObjects(headers, dataRows);
    }
    return [];
  } catch (error) {
    console.error(`Error getting sheet data from range ${range}:`, error);
    throw new Error('Could not access the spreadsheet. Please check configuration and permissions.');
  }
}

export async function appendSheetData(range: string, data: any[]) {
    try {
        const sheets = getSheets();
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [data],
            },
        });
        return response.data;
    } catch(error) {
        console.error(`Error appending sheet data to range ${range}:`, error);
        throw new Error('Could not append data to the spreadsheet.');
    }
}

export async function updateSheetData(range: string, data: any[]) {
    try {
        const sheets = getSheets();
        const response = await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [data],
            },
        });
        return response.data;
    } catch(error) {
        console.error(`Error updating sheet data at range ${range}:`, error);
        throw new Error('Could not update data in the spreadsheet.');
    }
}

export async function findRowIndex(sheetName: string, id: string): Promise<number> {
    const data = await getSheetData(`${sheetName}!A:A`);
    const rowIndex = data.findIndex((row: any) => row.id === id);
    return rowIndex !== -1 ? rowIndex + 2 : -1; // +2 to account for header row and 1-based indexing
}

// Convert object to array based on headers
export function objectToRow(headers: string[], obj: any): any[] {
  return headers.map(header => {
    const value = obj[header];
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return value ?? '';
  });
}
