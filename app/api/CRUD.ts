/* eslint-disable @typescript-eslint/no-explicit-any */
import { google } from "googleapis"

async function authenticateGoogleSheets(
  credentialsSet: "default" | "second" | "third" = "default"
) {
  try {
    const credentials = (() => {
      if (credentialsSet === "default") {
        return {
          projectId: process.env.GOOGLE_SHEETS_PROJECT_ID,
          private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(
            /\\n/g,
            "\n"
          ),
          client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
          client_id: process.env.GOOGLE_SHEETS_CLIENT_ID,
        }
      } else if (credentialsSet === "second") {
        return {
          projectId: process.env.GOOGLE_SHEETS_PROJECT_ID_2,
          private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY_2?.replace(
            /\\n/g,
            "\n"
          ),
          client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL_2,
          client_id: process.env.GOOGLE_SHEETS_CLIENT_ID_2,
        }
      } else if (credentialsSet === "third") {
        return {
          projectId: process.env.GOOGLE_SHEETS_PROJECT_ID_3,
          private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY_3?.replace(
            /\\n/g,
            "\n"
          ),
          client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL_3,
          client_id: process.env.GOOGLE_SHEETS_CLIENT_ID_3,
        }
      } else {
        throw new Error("Invalid credentialsSet value")
      }
    })()

    return await google.auth.getClient({
      projectId: credentials.projectId,
      credentials: {
        type: "service_account",
        private_key: credentials.private_key,
        client_email: credentials.client_email,
        client_id: credentials.client_id,
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

async function getGoogleSheetsInstance(
  credentialsSet: "default" | "second" | "third" = "default"
) {
  const auth = await authenticateGoogleSheets(credentialsSet)
  return google.sheets({ version: "v4", auth })
}

export async function getGoogleSheetsData(
  spreadsheetId: string,
  range: string,
  credentialsSet: "default" | "second" | "third" = "default"
) {
  try {
    const sheets = await getGoogleSheetsInstance(credentialsSet)
    const getData = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: range,
    })
    return getData.data.values || []
  } catch (error) {
    console.error("ERROR in reading data: \n", error)
    throw new Error("Failed to fetch data from Google Sheets")
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

    console.log("Searching for value:", searchValue, "in range:", searchRange)

    const getData = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: searchRange,
    })

    const rows = getData.data.values || []
    console.log("Fetched rows:", rows)

    const rowIndex = rows.findIndex((row) => row.includes(searchValue))

    if (rowIndex === -1) {
      console.error("Search value not found in rows:", searchValue)
      throw new Error("Search value not found in the specified range.")
    }

    const updateRange = `${searchRange.split("!")[0]}!${
      searchRange.split("!")[1][0]
    }${rowIndex + 2}`
    console.log("Updating range:", updateRange)

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

    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
    })
    const sheet = spreadsheet.data.sheets?.find(
      (sheet) => sheet.properties?.title === sheetName
    )
    const sheetId = sheet?.properties?.sheetId

    if (!sheetId) {
      throw new Error(`Sheet with name ${sheetName} not found.`)
    }

    const getData = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${sheetName}`,
    })

    const rows = getData.data.values || []

    const rowIndex = rows.findIndex((row) => row.includes(searchValue))

    if (rowIndex === -1) {
      throw new Error("Search value not found in the sheet.")
    }

    const batchUpdateRequest = {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: "ROWS",
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    }

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
  startRow: number = 2
) {
  try {
    const sheets = await getGoogleSheetsInstance()

    const searchRange = `${sheetName}!${searchColumn}${startRow}:${searchColumn}`

    const getData = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: searchRange,
    })

    const rows = getData.data.values || []
    const rowIndex = rows.findIndex((row) => row[0] === searchValue)

    if (rowIndex === -1) {
      throw new Error("Search value not found in the specified range.")
    }

    const actualRow = rowIndex + startRow

    const updateRange = `${sheetName}!${updateColumn}${actualRow}`

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
  startRow: number = 2,
  personalKeyColumn: string = "A",
  expireDateColumn: string,
  orderDateColumn: string,
  contactColumn: string
) {
  try {
    const sheets = await getGoogleSheetsInstance()

    const searchRange = `${sheetName}!${personalKeyColumn}${startRow}:${personalKeyColumn}`

    const getData = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: searchRange,
    })

    const rows = getData.data.values || []

    const rowIndex = rows.findIndex((row) => row[0] === "")

    if (rowIndex === -1) {
      throw new Error("No available product found.")
    }

    const actualRow = rowIndex + startRow

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

    const personalKeyRange = `${sheetName}!A${rowIndex}`
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: personalKeyRange,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[updates.personalKey]],
      },
    })

    const dateContactRange = `${sheetName}!${String.fromCharCode(
      65 + expireDateColumnIndex
    )}${rowIndex}:${String.fromCharCode(
      65 + expireDateColumnIndex + 3
    )}${rowIndex}`
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: dateContactRange,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [updates.expireDate, updates.orderDate, updates.contact, "Website"],
        ],
      },
    })

    return { message: `Row ${rowIndex} in ${sheetName} updated successfully` }
  } catch (error) {
    console.error("Error managing product data:", error)
    throw error
  }
}
