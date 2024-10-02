import { google } from "googleapis"

let cachedData: any = null

export async function getGoogleSheetsData(range: string) {
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
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: range,
    })

    cachedData = getData.data.values || []

    return cachedData
  } catch (error) {
    console.error("ERROR HERE!!!: \n", error)
  }
}
const convertGoogleDriveUrl = (shareableUrl: string): string => {
  const fileIdMatch = shareableUrl.match(/\/d\/([a-zA-Z0-9_-]+)\//)
  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1]
    return `https://drive.google.com/uc?id=${fileId}`
  } else {
    throw new Error("Invalid Google Drive URL format")
  }
}
export const CreditsOrTestimonialsDataModels = async () => {
  const rawData = await getGoogleSheetsData(
    process.env.CREDITS_OR_TESTIMONIALS_SHEETS as string
  )

  return rawData
    .map((row: string[]) => ({
      imageUrl: convertGoogleDriveUrl(row[0]),
      item: row[1],
      posted: row[2],
    }))
    .reverse()
}