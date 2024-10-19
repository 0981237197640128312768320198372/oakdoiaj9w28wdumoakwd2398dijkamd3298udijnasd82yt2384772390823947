/* eslint-disable @typescript-eslint/no-explicit-any */
import { google } from "googleapis"

async function authenticateGoogleSheets() {
  try {
    return await google.auth.getClient({
      projectId: process.env.GOOGLE_SHEETS_PROJECT_ID,
      credentials: {
        type: "service_account",
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n"
        ),
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_SHEETS_CLIENT_ID,
        token_url: "https://oauth2.googleapis.com/token",
        universe_domain: "googleapis.com",
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })
  } catch (error) {
    console.error("Error during authentication", error)
    throw new Error("Google Sheets authentication failed")
  }
}

async function getGoogleSheetsInstance() {
  const auth = await authenticateGoogleSheets()
  return google.sheets({ version: "v4", auth })
}

export async function getGoogleSheetsData(range: string) {
  try {
    const sheets = await getGoogleSheetsInstance()
    const getData = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: range,
    })
    return getData.data.values || []
  } catch (error) {
    console.error("ERROR in reading data: \n", error)
  }
}

export async function appendGoogleSheetsData(range: string, values: any[]) {
  try {
    const sheets = await getGoogleSheetsInstance()
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: range,
      valueInputOption: "RAW",
      requestBody: {
        values: values,
      },
    })
    return { message: "Data successfully added" }
  } catch (error) {
    console.error("ERROR in appending data: \n", error)
    throw error
  }
}

export async function findAndUpdateRow(searchValue: string, values: any[]) {
  try {
    const sheets = await getGoogleSheetsInstance()

    const getData = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: "EmailAccess",
    })

    const rows = getData.data.values || []

    const rowIndex = rows.findIndex((row) => row.includes(searchValue))

    if (rowIndex === -1) {
      throw new Error("Search value not found in the sheet.")
    }

    const range = `EmailAccess!A${rowIndex + 1}:B${rowIndex + 1}`

    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [values],
      },
    })

    return { message: "Row successfully updated" }
  } catch (error) {
    console.error("ERROR in finding and updating row: \n", error)
    throw error
  }
}

export async function findAndDeleteRow(sheetName: string, searchValue: string) {
  try {
    const sheets = await getGoogleSheetsInstance()

    // Step 1: Fetch the spreadsheet metadata to get the correct sheetId
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
    })

    // Fetch the sheet by name dynamically
    const sheet = spreadsheet.data.sheets?.find(
      (sheet) => sheet.properties?.title === sheetName
    )
    const sheetId = sheet?.properties?.sheetId

    if (!sheetId) {
      throw new Error(`Sheet with name ${sheetName} not found.`)
    }

    // Step 2: Read the entire sheet to find the search value
    const getData = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${sheetName}`, // Use dynamic sheet name
    })

    const rows = getData.data.values || []

    // Step 3: Find the index of the row containing the search value
    const rowIndex = rows.findIndex((row) => row.includes(searchValue))

    if (rowIndex === -1) {
      throw new Error("Search value not found in the sheet.")
    }

    // Step 4: Construct the batchUpdate request to delete the row
    const batchUpdateRequest = {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetId, // Use the dynamic sheetId
              dimension: "ROWS",
              startIndex: rowIndex, // 0-based index of the row to delete
              endIndex: rowIndex + 1, // Delete just this one row
            },
          },
        },
      ],
    }

    // Step 5: Execute the batchUpdate to delete the row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.SPREADSHEET_ID,
      requestBody: batchUpdateRequest,
    })

    return { message: "Row successfully deleted" }
  } catch (error) {
    console.error("ERROR in finding and deleting row: \n", error)
    throw error
  }
}
