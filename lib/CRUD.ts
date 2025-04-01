/* eslint-disable @typescript-eslint/no-explicit-any */
import { google } from 'googleapis';
import fs from 'fs';
import CryptoJS from 'crypto-js';
import path from 'path';
import { convertGoogleDriveUrl } from './utils';

const secretKey = process.env.CREDENTIALS_SECRET_KEY;
if (!secretKey) {
  throw new Error('CREDENTIALS_SECRET_KEY is not defined in environment variables');
}

let credentialsArray: any;

try {
  const filePath = path.join(process.cwd(), 'lib', 'encrypted.hands');
  if (!fs.existsSync(filePath)) {
    throw new Error('Encrypted credentials file not found');
  }
  const encryptedData = fs.readFileSync(filePath, 'utf8');
  const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  const decryptedData = decryptedBytes.toString(CryptoJS.enc.Utf8);
  credentialsArray = JSON.parse(decryptedData);
} catch (error) {
  throw new Error('Failed to decrypt credentials: ' + error);
}

if (!credentialsArray || credentialsArray.length === 0) {
  throw new Error('No credentials found after decryption');
}

let currentIndex = Math.floor(Math.random() * credentialsArray.length);

function rotateCredentials() {
  if (credentialsArray.length === 0) {
    throw new Error('No credentials available in the array');
  }
  const credentials = credentialsArray[currentIndex];
  currentIndex = (currentIndex + 1) % credentialsArray.length;
  return credentials;
}

async function authenticateGoogleSheets() {
  try {
    const credentials = rotateCredentials();
    // console.log('\n\n\n\n=================================');
    // console.log('Total Hands', credentialsArray.length);
    // console.log('Current Hand', currentIndex);
    // console.log(credentials.projectId);
    // console.log('=================================\n\n\n\n');
    return await google.auth.getClient({
      projectId: credentials.projectId,
      credentials: {
        type: 'service_account',
        private_key: credentials.privateKey,
        client_email: credentials.clientEmail,
        client_id: credentials.clientId,
        token_url: 'https://oauth2.googleapis.com/token',
        universe_domain: 'googleapis.com',
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  } catch (error) {
    console.error('Error during authentication:', error);
    throw new Error('Google Sheets authentication failed');
  }
}

export async function getGoogleSheetsInstance() {
  const auth = await authenticateGoogleSheets();
  return google.sheets({ version: 'v4', auth });
}

export async function getGoogleSheetsData(spreadsheetId: string, range: string) {
  try {
    const sheets = await getGoogleSheetsInstance();
    const getData = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: range,
    });
    return getData.data.values || [];
  } catch (error) {
    console.error('ERROR in reading data: \n', error);
    throw new Error('Failed to fetch data from Google Sheets');
  }
}
export const CreditsOrTestimonialsDataModels = async () => {
  const rawCreditsData =
    (await getGoogleSheetsData(
      process.env.___SPREADSHEET_ID as string,
      process.env.CREDITS_OR_TESTIMONIALS_SHEETS as string
    )) || [];

  return rawCreditsData
    .map((creditsRow: string[]) => ({
      creditsimageUrl: convertGoogleDriveUrl(creditsRow[0]),
      item: creditsRow[1],
      posted: creditsRow[2],
    }))
    .reverse();
};

export const Recommendations = async () => {
  const rawRecommendationsData =
    (await getGoogleSheetsData(
      process.env.___SPREADSHEET_ID as string,
      process.env.MOVIE_RECOMMENDATIONS_SHEETS as string
    )) || [];

  return rawRecommendationsData
    .map((recommendationsRow: string[]) => ({
      title: recommendationsRow[0],
      description: recommendationsRow[1],
      recommendationsimageUrl: convertGoogleDriveUrl(recommendationsRow[2]),
      netflixUrl: recommendationsRow[3],
      date: recommendationsRow[4],
    }))
    .reverse();
};

export async function appendGoogleSheetsData(spreadsheetId: string, range: string, values: any[]) {
  try {
    const sheets = await getGoogleSheetsInstance();
    await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: range,
      valueInputOption: 'RAW',
      requestBody: {
        values: values,
      },
    });
    return { message: 'Data successfully added' };
  } catch (error) {
    console.error('ERROR in appending data: \n', error);
    throw error;
  }
}

export async function findAndUpdateRow(
  spreadsheetId: string,
  searchRange: string,
  searchValue: string,
  values: any[]
) {
  try {
    const sheets = await getGoogleSheetsInstance();

    console.log('Searching for value:', searchValue, 'in range:', searchRange);

    const getData = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: searchRange,
    });

    const rows = getData.data.values || [];
    console.log('Fetched rows:', rows);

    const rowIndex = rows.findIndex((row) => row.includes(searchValue));

    if (rowIndex === -1) {
      console.error('Search value not found in rows:', searchValue);
      throw new Error('Search value not found in the specified range.');
    }

    const updateRange = `${searchRange.split('!')[0]}!${searchRange.split('!')[1][0]}${
      rowIndex + 2
    }`;
    console.log('Updating range:', updateRange);

    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: updateRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values],
      },
    });

    return { message: 'Row successfully updated' };
  } catch (error) {
    console.error('ERROR in finding and updating row: \n', error);
    throw error;
  }
}

export async function updateUserField(
  spreadsheetId: string,
  sheetName: string,
  searchColumn: string,
  searchValue: string,
  updateColumn: string,
  newValue: string,
  startRow: number = 2
) {
  try {
    const sheets = await getGoogleSheetsInstance();

    const searchRange = `${sheetName}!${searchColumn}${startRow}:${searchColumn}`;

    const getData = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: searchRange,
    });

    const rows = getData.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === searchValue);

    if (rowIndex === -1) {
      throw new Error('Search value not found in the specified range.');
    }

    const actualRow = rowIndex + startRow;

    const updateRange = `${sheetName}!${updateColumn}${actualRow}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: updateRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[newValue]],
      },
    });

    return { message: 'Field successfully updated' };
  } catch (error) {
    console.error('Error updating user field:', error);
    throw error;
  }
}
export async function updateAvailableProductData(
  spreadsheetId: string,
  sheetName: string,
  personalKey: string,
  expireDate: string,
  orderDate: string,
  contact: string,
  startRow: number = 2,
  personalKeyColumn: string = 'A',
  expireDateColumn: string,
  orderDateColumn: string,
  contactColumn: string
) {
  try {
    const sheets = await getGoogleSheetsInstance();

    const searchRange = `${sheetName}!${personalKeyColumn}${startRow}:${personalKeyColumn}`;

    const getData = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: searchRange,
    });

    const rows = getData.data.values || [];

    const rowIndex = rows.findIndex((row) => row[0] === '');

    if (rowIndex === -1) {
      throw new Error('No available product found.');
    }

    const actualRow = rowIndex + startRow;

    const rangesToUpdate = [
      {
        range: `${sheetName}!${personalKeyColumn}${actualRow}`,
        value: personalKey,
      },
      {
        range: `${sheetName}!${expireDateColumn}${actualRow}`,
        value: expireDate,
      },
      {
        range: `${sheetName}!${orderDateColumn}${actualRow}`,
        value: orderDate,
      },
      { range: `${sheetName}!${contactColumn}${actualRow}`, value: contact },
    ];

    const updatePromises = rangesToUpdate.map((field) =>
      sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: field.range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[field.value]],
        },
      })
    );

    await Promise.all(updatePromises);

    return { message: 'Product data successfully updated' };
  } catch (error) {
    console.error('Error updating available product data:', error);
    throw error;
  }
}

export async function manageProductData(
  spreadsheetId: string,
  sheetName: string,
  rowIndex: number,
  updates: {
    personalKey: string;
    expireDate: string;
    orderDate: string;
    contact: string;
  },
  expireDateColumnIndex: number
) {
  try {
    const sheets = await getGoogleSheetsInstance();

    const personalKeyRange = `${sheetName}!A${rowIndex}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: personalKeyRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[updates.personalKey]],
      },
    });

    const dateContactRange = `${sheetName}!${String.fromCharCode(
      65 + expireDateColumnIndex
    )}${rowIndex}:${String.fromCharCode(65 + expireDateColumnIndex + 3)}${rowIndex}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: dateContactRange,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[updates.expireDate, updates.orderDate, updates.contact, 'Website']],
      },
    });

    return { message: `Row ${rowIndex} in ${sheetName} updated successfully` };
  } catch (error) {
    console.error('Error managing product data:', error);
    throw error;
  }
}
