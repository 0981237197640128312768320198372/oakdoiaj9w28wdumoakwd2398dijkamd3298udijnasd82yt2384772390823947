'use client';

import { useState, useEffect } from 'react';

interface SheetLengths {
  [key: string]: number;
}

const DataRemain = () => {
  const [sheetLengths, setSheetLengths] = useState<SheetLengths>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch sheet lengths when the component mounts
  useEffect(() => {
    const fetchSheetLengths = async () => {
      try {
        setLoading(true);
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

    fetchSheetLengths();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-5">
        <p className="text-gray-500">Loading Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-5">Data Remain</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(sheetLengths).map(([sheetName, length]) => (
          <div key={sheetName} className="p-4 border rounded-lg shadow-sm bg-gray-800 text-white">
            <h3 className="text-lg font-semibold">{sheetName}</h3>
            <p className="text-sm">Data Remaining: {length}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataRemain;
