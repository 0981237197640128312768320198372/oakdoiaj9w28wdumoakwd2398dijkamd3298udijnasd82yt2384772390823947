/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { google } from "googleapis"
let cachedData: any = null
let lastFetchedTime: number = 0

export async function getGoogleSheetsData(range: string) {
  const cacheDuration = 5 * 1000

  if (Date.now() - lastFetchedTime < cacheDuration && cachedData) {
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
    lastFetchedTime = Date.now()

    return cachedData
  } catch (error) {
    console.error("ERROR HERE!!!: \n", error)
  }
}

const convertGoogleDriveUrl = (shareableUrl: string): string => {
  const fileIdMatch = shareableUrl.match(/(?:\/d\/|id=)([a-zA-Z0-9_-]{25,})/)
  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1]
    return `https://drive.usercontent.google.com/download?id=${fileId}&authuser=0`
  } else {
    throw new Error("Invalid Google Drive URL format")
  }
}

export const CreditsOrTestimonialsDataModels = async () => {
  const rawCreditsData =
    (await getGoogleSheetsData(
      process.env.CREDITS_OR_TESTIMONIALS_SHEETS as string
    )) || []

  return rawCreditsData
    .map((creditsRow: string[]) => ({
      creditsimageUrl: creditsRow[0],
      item: creditsRow[1],
      posted: creditsRow[2],
    }))
    .reverse()
}

export const Recommendations = async () => {
  const rawRecommendationsData =
    (await getGoogleSheetsData(
      process.env.MOVIE_RECOMMENDATIONS_SHEETS as string
    )) || []

  return rawRecommendationsData
    .map((recommendationsRow: string[]) => ({
      title: recommendationsRow[0],
      description: recommendationsRow[1],
      recommendationsimageUrl: recommendationsRow[2],
      netflixUrl: recommendationsRow[3],
      date: recommendationsRow[4],
    }))
    .reverse()
}
