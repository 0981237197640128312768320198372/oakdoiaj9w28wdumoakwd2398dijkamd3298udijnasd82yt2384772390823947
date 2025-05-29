/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-async-client-component */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect, useRef } from 'react';
import SubTitle from '@/components/home/general/SubTitle';
import { convertGoogleDriveUrl } from '@/lib/utils';
import Image from 'next/image';
import dokmailogosquare from '@/assets/images/dokmailogosquare.png';
import Link from 'next/link';
import { GoChevronRight } from 'react-icons/go';

const fetchRecommendations = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  const res = await fetch(
    `/api/get_paginated_data?sheet=MovieAndSeriesRecommendation&range=A2:E&limit=${limit}&offset=${offset}`,
    {
      headers: {
        'x-api-key': '1092461893164193047348723920781631',
      },
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }

  const rawRecommendationsData = await res.json();

  const recommendations = rawRecommendationsData.data.map((recommendationsRow: string[]) => ({
    title: recommendationsRow[0],
    description: recommendationsRow[1],
    recommendationsimageUrl: convertGoogleDriveUrl(recommendationsRow[2]),
    netflixUrl: recommendationsRow[3],
    date: recommendationsRow[4],
  }));

  return recommendations;
};

const SkeletonLoader = () => (
  <div className="relative flex flex-col items-center w-full h-full justify-center select-none p-3 border-[1px] border-dark-500 rounded-lg animate-pulse">
    <div className="w-full h-full min-h-[500px] bg-dark-400 rounded-md">
      <div className="relative flex items-center justify-center h-full">
        <div className="w-10 h-10 border-2 border-b-transparent border-primary rounded-full animate-spin"></div>
        <Image
          src={dokmailogosquare}
          alt="Loading Logo | Dokmai Store"
          width={25}
          height={25}
          loading="lazy"
          className="absolute"
        />
      </div>
    </div>
    <span className="flex flex-col w-full justify-start gap-0 mt-3">
      <div className="h-6 bg-dark-400 rounded w-3/4 mt-2"></div>
      <div className="h-4 bg-dark-400 rounded w-1/2 mt-1"></div>
    </span>
    <div className="flex w-full justify-end mt-3">
      <div className="h-8 w-24 bg-dark-400 rounded-sm"></div>
    </div>
  </div>
);

const RecomendationsSection = () => {
  const [recommendationsData, setRecommendationsData] = useState<any[]>([]);
  const [limit] = useState(4);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const recommendations = await fetchRecommendations(1, limit);
        setRecommendationsData(recommendations);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [limit]);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const closeModal = (event: MouseEvent) => {
    if (
      modalRef.current &&
      event.target instanceof Node &&
      !modalRef.current.contains(event.target)
    ) {
      setSelectedImage(null);
    }
  };

  useEffect(() => {
    if (selectedImage) {
      document.addEventListener('mousedown', closeModal);
    }
    return () => {
      document.removeEventListener('mousedown', closeModal);
    };
  }, [selectedImage]);

  return (
    <section
      id="Recommendations"
      className="w-full __container mt-24 justify-center h-full items-center">
      <SubTitle
        title="รายการหนังแนะนำ"
        buttonMore="ดูรายการแนะนำเพิ่มเติม"
        urlButtonMore={'/movie-series-recommendations'}
        className="mb-16"
      />
      <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-5 px-5 lg:px-0 pb-10 justify-center">
        {loading
          ? Array.from({ length: limit }).map((_, index) => <SkeletonLoader key={index} />)
          : recommendationsData.map((recommendation, index: number) => (
              <div
                key={index}
                className="relative flex flex-col items-center h-full w-full justify-center select-none p-3 border-[1px] border-dark-500 rounded-lg">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative flex flex-col items-center justify-center gap-3">
                      <div className="w-10 h-10 border-y-[1px] border-y-primary/30 border-x-2 border-x-primary rounded-full animate-spin"></div>
                      <Image
                        src={dokmailogosquare}
                        alt="Loading Logo | Dokmai Store"
                        width={200}
                        height={200}
                        loading="lazy"
                        className="absolute p-1 animate-pulse"
                      />
                    </div>
                  </div>
                  <Image
                    src={recommendation.recommendationsimageUrl}
                    alt={`Movies and Series Recommendation by Dokmai Store | ${recommendation.title}`}
                    placeholder="blur"
                    blurDataURL="@/assets/images/blurCredits.jpg"
                    width={500}
                    height={500}
                    className="relative rounded-md overflow-hidden select-none w-auto h-auto cursor-pointer z-40"
                    loading="lazy"
                    onClick={() => handleImageClick(recommendation.recommendationsimageUrl)}
                  />
                </div>
                <span className="flex flex-col w-full justify-start gap-0 mt-3">
                  <p className="flex justify-start font-aktivGroteskBold px-2 py-1 text-light-100 text-xl">
                    {recommendation.title}
                  </p>
                  <p className="flex justify-start font-aktivGroteskLight px-2 py-1 text-light-100 text-xs -mt-1 ">
                    {recommendation.description}
                  </p>
                </span>
                <div className="flex w-full justify-end mt-3">
                  <Link
                    href={recommendation.netflixUrl}
                    className="bg-primary py-1 px-2 text-dark-800 font-aktivGroteskBold rounded-sm flex items-center justify-center gap-1"
                    target="_blank">
                    ดูตอนนี้
                    <GoChevronRight className="text-2xl" />
                  </Link>
                </div>
              </div>
            ))}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center">
          <div
            ref={modalRef}
            className="relative p-5 rounded-md"
            onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-0 flex items-center justify-center w-full h-[75%]">
              <div className="relative flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-y-[1px] border-y-primary/30 border-x-2 border-x-primary rounded-full animate-spin"></div>
                <Image
                  src={dokmailogosquare}
                  alt="Loading Logo | Dokmai Store"
                  width={200}
                  height={200}
                  loading="lazy"
                  className="absolute p-1 animate-pulse"
                />
              </div>
            </div>
            <Image
              src={selectedImage}
              alt="Selected Recommendation"
              width={800}
              height={800}
              className="relative rounded-md z-40"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default RecomendationsSection;
