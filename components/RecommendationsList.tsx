/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import Image from "next/image"
import React from "react"

const RecommendationsList = ({
  recommendations,
}: {
  recommendations: any[]
}) => {
  return (
    <div className='flex flex-col gap-6'>
      {recommendations.map((recommendation, index) => (
        <div key={index} className='border rounded-lg p-4'>
          <h2 className='font-bold text-xl mb-2'>{recommendation.title}</h2>
          <Image
            src={recommendation.recommendationsimageUrl}
            alt={`recommendation by Dokmai Store | ${recommendation.title}`}
            width={350}
            height={350}
            className='rounded-xl overflow-hidden select-non w-full h-full'
            loading='lazy'
          />
          <p>{recommendation.description}</p>
          <a
            href={recommendation.netflixUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary hover:underline'
          >
            Watch Now
          </a>
        </div>
      ))}
    </div>
  )
}

export default RecommendationsList
