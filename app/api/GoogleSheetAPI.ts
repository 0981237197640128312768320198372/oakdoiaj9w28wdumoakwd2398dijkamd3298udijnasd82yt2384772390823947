/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { convertGoogleDriveUrl } from "@/lib/utils"
import { google } from "googleapis"

export async function getGoogleSheetsData(range: string) {
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

    return getData.data.values || []
  } catch (error) {
    console.error("ERROR HERE!!!: \n", error)
  }
}

export const CreditsOrTestimonialsDataModels = async () => {
  const rawCreditsData =
    (await getGoogleSheetsData(
      process.env.CREDITS_OR_TESTIMONIALS_SHEETS as string
    )) || []

  return rawCreditsData
    .map((creditsRow: string[]) => ({
      creditsimageUrl: convertGoogleDriveUrl(creditsRow[0]),
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
      recommendationsimageUrl: convertGoogleDriveUrl(recommendationsRow[2]),
      netflixUrl: recommendationsRow[3],
      date: recommendationsRow[4],
    }))
    .reverse()
}
