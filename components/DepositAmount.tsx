import React from 'react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import dokmaicoin3d from '@/assets/images/dokmaicoin3d.png';

interface DepositAmountProps {
  amount: number;
  loading: boolean;
  handleAmountChange: (value: number) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const DepositAmount: React.FC<DepositAmountProps> = ({
  amount,
  loading,
  handleAmountChange,
  handleSubmit,
}) => {
  return (
    <div className="w-full max-w-md mx-auto bg-dark-700 border border-dark-600 rounded-lg p-6 transition-all duration-300 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-primary">เติมเงิน Dokmai Coin</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <label htmlFor="amount" className="block text-sm font-medium mb-2 text-gray-300">
            จำนวนเงินที่ต้องการเติม
          </label>
          <div className="flex items-center rounded-lg overflow-hidden border border-primary focus-within:ring-2 focus-within:ring-primary focus-within:ring-opacity-50 transition-all duration-200">
            <div className="bg-primary/10 p-3 flex items-center justify-center">
              <Image
                src={dokmaicoin3d}
                alt="Dokmai Coin Logo"
                className="w-auto h-6"
                draggable={false}
              />
            </div>
            <Input
              id="amount"
              type="number"
              value={amount || ''}
              onChange={(e) => handleAmountChange(Number(e.target.value))}
              placeholder="ขั้นต่ำ 10 Dokmai Coin"
              min={10}
              className="flex-1 h-12 border-0 focus:ring-0 bg-transparent text-base"
            />
            <div className="bg-primary/10 px-3 font-medium text-primary whitespace-nowrap">
              Coins
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-400">ยอดเงินขั้นต่ำคือ 10 Dokmai Coin</p>
        </div>

        {amount >= 10 && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm animate-fadeIn">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-300">ยอดเติมเงิน:</span>
              <span className="font-medium text-primary">{amount} Dokmai Coins</span>
            </div>
            {/* Add bonus calculation if needed */}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || amount < 10}
          className="w-full h-12 bg-primary text-dark-800 font-bold rounded-lg transition-all duration-200 hover:bg-primary/90 active:bg-primary/80 disabled:bg-primary/50 disabled:cursor-not-allowed flex items-center justify-center">
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-dark-800"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              กำลังดำเนินการ...
            </>
          ) : (
            'ดำเนินการเติมเงิน'
          )}
        </button>
      </form>
    </div>
  );
};

export default DepositAmount;
