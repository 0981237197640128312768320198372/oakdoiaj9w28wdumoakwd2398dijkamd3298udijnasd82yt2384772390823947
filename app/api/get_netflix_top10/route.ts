/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from 'next/server';

interface DataItem {
  id: string;
  showId: string;
  category?: string;
  rank?: string;
  showName?: string;
  seasonName?: string;
  horizontal?: string;
  vertical?: string;
}

function getMostRecentSunday(date: Date): Date {
  const day = date.getDay();
  if (day === 0) {
    return new Date(date);
  } else {
    const daysToSubtract = day;
    const previousSunday = new Date(date);
    previousSunday.setDate(date.getDate() - daysToSubtract);
    return previousSunday;
  }
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

export async function GET() {
  const maxAttempts = 5;
  let currentDate = getMostRecentSunday(new Date());

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const dateString = formatDate(currentDate);
    // console.log(`Attempt ${attempt + 1}: Trying date ${dateString}`);

    try {
      const [dataRes, namesRes, boxartRes] = await Promise.all([
        fetch(`https://www.netflix.com/tudum/top10/data/weeks/${dateString}-data.json`),
        fetch(`https://www.netflix.com/tudum/top10/data/weeks/${dateString}-en-names.json`),
        fetch(`https://www.netflix.com/tudum/top10/data/weeks/${dateString}-th-boxart.json`),
      ]);

      // Check if all responses are successful
      if (!dataRes.ok || !namesRes.ok || !boxartRes.ok) {
        throw new Error('One or more fetch requests failed');
      }

      const dataJson = await dataRes.json();
      const namesJson = await namesRes.json();
      const boxartJson = await boxartRes.json();

      // Extract Thailand data, default to empty array if not found
      const thailandData =
        dataJson.countries.find((countryEntry: any) => countryEntry[0] === 'TH')?.[1] || [];

      const dataItems = thailandData.map((item: any) => ({
        id: item.id,
        showId: item.showId,
        category: item.category,
        rank: item.rank,
      }));

      const namesMap = Object.fromEntries(namesJson.map((item: any) => [item.id, item]));
      const boxartMap = Object.fromEntries(boxartJson.map((item: any) => [item.id, item]));

      const mergedData: DataItem[] = dataItems.map((item: DataItem) => ({
        ...item,
        showName: namesMap[item.id]?.showName,
        seasonName:
          namesMap[item.id]?.seasonName &&
          namesMap[item.id]?.seasonName !== namesMap[item.id]?.showName
            ? namesMap[item.id]?.seasonName
            : undefined,
        horizontal: boxartMap[item.id]?.horizontal,
        vertical: boxartMap[item.id]?.vertical,
      }));

      // Return the merged data (could be empty if no Thailand data exists)
      return NextResponse.json(mergedData);
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed for date ${dateString}:`, error);
      // Move to the previous Sunday
      currentDate.setDate(currentDate.getDate() - 7);
    }
  }

  // Return error if all attempts fail
  return NextResponse.json(
    { error: 'Failed to fetch data after multiple attempts' },
    { status: 500 }
  );
}
