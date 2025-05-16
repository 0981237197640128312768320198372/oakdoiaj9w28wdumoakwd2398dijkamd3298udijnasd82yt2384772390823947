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

export async function GET() {
  try {
    const currentDate = new Date();
    const recentSunday = getMostRecentSunday(currentDate);
    const year = recentSunday.getFullYear();
    const month = String(recentSunday.getMonth() + 1).padStart(2, '0');
    const day = String(recentSunday.getDate()).padStart(2, '0');
    const dateString = `${year}${month}${day}`;
    console.log(dateString);
    const [dataRes, namesRes, boxartRes] = await Promise.all([
      fetch(`https://www.netflix.com/tudum/top10/data/weeks/${dateString}-data.json`),
      fetch(`https://www.netflix.com/tudum/top10/data/weeks/${dateString}-en-names.json`),
      fetch(`https://www.netflix.com/tudum/top10/data/weeks/${dateString}-th-boxart.json`),
    ]);

    const dataJson = await dataRes.json();
    const namesJson = await namesRes.json();
    const boxartJson = await boxartRes.json();

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

    return NextResponse.json(mergedData);
  } catch (error) {
    console.error('Failed to fetch or process data:', error);
    return NextResponse.json({ error: 'Failed to fetch or process data' }, { status: 500 });
  }
}
