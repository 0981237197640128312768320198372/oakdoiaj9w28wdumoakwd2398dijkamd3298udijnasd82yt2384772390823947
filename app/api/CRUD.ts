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

export async function getGoogleSheetsData(
  spreadsheetId: string,
  range: string
) {
  try {
    const sheets = await getGoogleSheetsInstance()
    const getData = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: range,
    })
    return getData.data.values || []
  } catch (error) {
    console.error("ERROR in reading data: \n", error)
  }
}

export async function appendGoogleSheetsData(
  spreadsheetId: string,
  range: string,
  values: any[]
) {
  try {
    const sheets = await getGoogleSheetsInstance()
    await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
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

export async function findAndUpdateRow(
  spreadsheetId: string,
  searchRange: string,
  searchValue: string,
  values: any[]
) {
  try {
    const sheets = await getGoogleSheetsInstance()

    // Log the search range and value for debugging
    console.log("Searching for value:", searchValue, "in range:", searchRange)

    // Fetch the data from the specified range for searching
    const getData = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: searchRange,
    })

    const rows = getData.data.values || []
    console.log("Fetched rows:", rows) // Log fetched rows for visibility

    // Find the index of the row that includes the search value
    const rowIndex = rows.findIndex((row) => row.includes(searchValue))

    if (rowIndex === -1) {
      console.error("Search value not found in rows:", searchValue)
      throw new Error("Search value not found in the specified range.")
    }

    // Determine the range to update based on the row index and the specified columns
    const updateRange = `${searchRange.split("!")[0]}!${
      searchRange.split("!")[1][0]
    }${rowIndex + 2}`
    console.log("Updating range:", updateRange) // Log the range we are about to update

    // Update the specified range with new values
    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: updateRange,
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

export async function updateUserField(
  spreadsheetId: string,
  sheetName: string,
  searchColumn: string,
  searchValue: string,
  updateColumn: string,
  newValue: string,
  startRow: number = 2 // Default to start from row 2 to skip headers
) {
  try {
    const sheets = await getGoogleSheetsInstance()

    // Define the search range dynamically (e.g., "UserInfo!A2:A" if searchColumn is "A" and startRow is 2)
    const searchRange = `${sheetName}!${searchColumn}${startRow}:${searchColumn}`

    // Fetch data from the specified search range
    const getData = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: searchRange,
    })

    const rows = getData.data.values || []

    // Find the row index where the searchValue is located
    const rowIndex = rows.findIndex((row) => row[0] === searchValue)

    if (rowIndex === -1) {
      throw new Error("Search value not found in the specified range.")
    }

    // Calculate the actual row in the Google Sheet by adding the startRow offset
    const actualRow = rowIndex + startRow

    // Define the range to update (e.g., "UserInfo!B3" if updateColumn is "B" and actualRow is 3)
    const updateRange = `${sheetName}!${updateColumn}${actualRow}`

    // Update the cell in the specified update column with the new value
    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: updateRange,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[newValue]],
      },
    })

    return { message: "Field successfully updated" }
  } catch (error) {
    console.error("Error updating user field:", error)
    throw error
  }
}
export async function updateAvailableProductData(
  spreadsheetId: string,
  sheetName: string,
  personalKey: string,
  expireDate: string,
  orderDate: string,
  contact: string,
  startRow: number = 2, // Start from row 2 to skip headers
  personalKeyColumn: string = "A", // Column where Personal Key is stored
  expireDateColumn: string, // Column for Expired Date
  orderDateColumn: string, // Column for Order Date
  contactColumn: string // Column for Contact
) {
  try {
    const sheets = await getGoogleSheetsInstance()

    // Define the range to search for an available product (e.g., "ProductSheet!A2:A")
    const searchRange = `${sheetName}!${personalKeyColumn}${startRow}:${personalKeyColumn}`

    // Fetch data from the specified range
    const getData = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: searchRange,
    })

    const rows = getData.data.values || []

    // Find the first available row with an empty Personal Key (no owner)
    const rowIndex = rows.findIndex((row) => row[0] === "")

    if (rowIndex === -1) {
      throw new Error("No available product found.")
    }

    // Calculate the actual row in the Google Sheet by adding the startRow offset
    const actualRow = rowIndex + startRow

    // Define the range for each field we want to update
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
    ]

    // Update each field in the specified columns
    const updatePromises = rangesToUpdate.map((field) =>
      sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: field.range,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[field.value]],
        },
      })
    )

    // Wait for all updates to complete
    await Promise.all(updatePromises)

    return { message: "Product data successfully updated" }
  } catch (error) {
    console.error("Error updating available product data:", error)
    throw error
  }
}

export async function manageProductData(
  spreadsheetId: string,
  sheetName: string,
  rowIndex: number,
  updates: {
    personalKey: string
    expireDate: string
    orderDate: string
    contact: string
  },
  expireDateColumnIndex: number
) {
  try {
    const sheets = await getGoogleSheetsInstance()

    // Update Personal Key in the A column
    const personalKeyRange = `${sheetName}!A${rowIndex}`
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: personalKeyRange,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[updates.personalKey]],
      },
    })

    // Update Expire Date, Order Date, and Contact
    const dateContactRange = `${sheetName}!${String.fromCharCode(
      65 + expireDateColumnIndex
    )}${rowIndex}:${String.fromCharCode(
      65 + expireDateColumnIndex + 2
    )}${rowIndex}`
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: dateContactRange,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[updates.expireDate, updates.orderDate, updates.contact]],
      },
    })

    return { message: `Row ${rowIndex} in ${sheetName} updated successfully` }
  } catch (error) {
    console.error("Error managing product data:", error)
    throw error
  }
}
