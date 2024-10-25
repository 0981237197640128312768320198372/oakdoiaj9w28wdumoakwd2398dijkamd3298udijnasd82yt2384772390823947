/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react"
import PageHeadline from "@/components/PageHeadline"
import ShowRecommendations from "@/components/ShowRecommendations"
import { convertGoogleDriveUrl, generateMetadata } from "@/lib/utils"

// Fetch recommendations via the API route
const getRecommendationsFromAPI = async (): Promise<any[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/CRUDsheet/read?sheet=MovieAndSeriesRecommendation&range=A2:E`,
      {
        headers: {
          "x-api-key": process.env.API_KEY as string, // Make sure to use the public key
        },
      }
    )

    if (!response.ok) {
      throw new Error("Failed to fetch recommendations data")
    }

    const data = await response.json()
    return data.data.map((recommendationsRow: string[]) => ({
      title: recommendationsRow[0],
      description: recommendationsRow[1],
      recommendationsimageUrl: convertGoogleDriveUrl(recommendationsRow[2]),
      netflixUrl: recommendationsRow[3],
      date: recommendationsRow[4],
    }))
  } catch (error) {
    console.error("Error fetching recommendations:", error)
    return []
  }
}

// Generate metadata for the page dynamically
export const metadata = async () => {
  const recommendationsData = await getRecommendationsFromAPI()
  const recommendationsTitles = recommendationsData
    .map((rec: any) => rec.title)
    .join(", ")

  return generateMetadata({
    title: "Latest Movie Recommendations",
    description:
      "Check out the latest movie recommendations from Dokmai Store. We recommend the best Netflix movies and series for you to enjoy!",
    url: "https://www.dokmaistore.com/movie-series-recommendations",
    image: recommendationsData[0]?.recommendationsimageUrl, // Use the first image for SEO
    keywords: `movie recommendations, netflix recommendations, top movies, recommendation by dokmai store, ${recommendationsTitles},`,
  })
}

// Page Component
const page = async () => {
  // Fetch recommendations from API
  const recommendationsData = await getRecommendationsFromAPI()

  return (
    <div className='flex flex-col justify-center w-full items-start px-5 xl:px-0 pt-20 xl:pt-40 __container'>
      <PageHeadline
        headline='Our Recommendations'
        description='Movies and Series Recommendations by Dokmai Store'
      />
      {/* Pass the fetched recommendations data to ShowRecommendations */}
      <ShowRecommendations
        recommendations={recommendationsData}
        paginations={true}
        itemsperPage={2}
      />
    </div>
  )
}

export default page
