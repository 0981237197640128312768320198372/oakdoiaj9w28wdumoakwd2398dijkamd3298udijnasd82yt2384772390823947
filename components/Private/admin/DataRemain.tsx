'use client';

import { useState, useEffect } from 'react';
import { TbDatabase, TbRefresh } from 'react-icons/tb';

interface SheetLengths {
  [key: string]: number;
}

const DataRemain = () => {
  const [sheetLengths, setSheetLengths] = useState<SheetLengths>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSheetLengths = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/v2/data_remain', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch sheet lengths');
      }

      const data = await response.json();
      setSheetLengths(data.sheetLengths);
    } catch (err) {
      setError('Failed to load sheet lengths. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheetLengths();
  }, []);

  const renderSkeleton = (count: number) =>
    Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="p-5 bg-dark-600 border border-dark-500 rounded shadow animate-pulse">
        <div className="h-4 bg-dark-500 rounded mb-2 w-3/4"></div>
        <div className="h-6 bg-dark-500 rounded w-1/2"></div>
      </div>
    ));

  return (
    <div className="flex flex-col w-full max-w-4xl gap-5 bg-dark-700 p-5 border-[1px] border-dark-500 rounded-md">
      <div className="flex justify-between items-start w-full border-b-[1px] border-dark-500 pb-3">
        <h3 className="flex items-center gap-2 font-bold mb-5">
          <TbDatabase />
          Data Remain
        </h3>
        <button
          onClick={fetchSheetLengths}
          disabled={loading}
          className={`p-1 text-sm rounded-sm h-fit font-aktivGroteskBold w-fit bg-primary text-dark-800 ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/70 hover:text-dark-800'
          }`}
          title="Refresh data">
          <TbRefresh className="text-xl" />
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">{renderSkeleton(4)}</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      ) : Object.keys(sheetLengths).length === 0 ? (
        <div className="flex items-center justify-center">
          <p>No data available</p>
        </div>
      ) : (
        <div className=" rounded-sm">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
            {Object.entries(sheetLengths).map(([sheetName, length]) => (
              <div
                key={sheetName}
                className="flex flex-col p-2 bg-dark-500 border border-dark-300 rounded ">
                <h3>{sheetName.replace('READY_TO_USE_', 'DATA ')}</h3>
                <div className="flex gap-2 items-center text-primary">
                  <p className=" text-primary">{length}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataRemain;
