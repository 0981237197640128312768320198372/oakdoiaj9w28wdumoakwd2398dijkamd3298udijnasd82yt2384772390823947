/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { google } from "googleapis"

let cachedData: any = null

export async function getGoogleSheetsData(
  spreadsheetId: string,
  range: string
) {
  if (cachedData) {
    return cachedData
  }

  try {
    const auth = await google.auth.getClient({
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

    const sheets = google.sheets({ version: "v4", auth })

    const getData = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: range,
    })

    cachedData = getData.data.values

    return cachedData
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error)
    throw new Error("Unable to retrieve data from Google Sheets")
  }
}
