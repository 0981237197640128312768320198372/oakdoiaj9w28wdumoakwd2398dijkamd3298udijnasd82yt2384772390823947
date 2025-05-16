import React from 'react';
import PromptPayQR from '@/components/PromptPayQR';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import DepositTimer from './DepositTimer';

interface DepositQRCodeProps {
  qrCodeData: string;
  amount: number;
  timer: number;
  status: string;
  onExpire: () => void;
}

const DepositQRCode: React.FC<DepositQRCodeProps> = ({
  qrCodeData,
  amount,
  timer,
  status,
  onExpire,
}) => {
  return (
    <div className="w-full max-w-md mx-auto bg-dark-700 border border-dark-600 rounded-lg p-6 transition-all duration-300 shadow-lg">
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-bold mb-2 text-primary">สแกนเพื่อชำระเงิน</h2>
        <p className="text-sm text-gray-400 mb-4 text-center">
          สแกน QR Code ด้านล่างด้วยแอพธนาคารของคุณเพื่อชำระเงิน
        </p>

        <div className="p-4 bg-dark-800 rounded-lg mb-4 w-full flex justify-center">
          <PromptPayQR qrCodeData={qrCodeData} amount={amount} />
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 w-full mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-300">จำนวนเงิน:</span>
            <span className="font-medium text-primary">{amount} Coins</span>
          </div>
        </div>

        <DepositTimer seconds={timer} onExpire={onExpire} />

        {status === 'processing' && (
          <div className="w-full mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center">
            <Loader2 className="animate-spin text-blue-500 w-5 h-5 mr-2" />
            <span className="text-blue-400 text-sm">กำลังตรวจสอบการชำระเงิน โปรดรอสักครู่...</span>
          </div>
        )}

        {status === 'succeeded' && (
          <div className="w-full mt-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center">
            <CheckCircle className="text-green-500 w-5 h-5 mr-2" />
            <span className="text-green-400 text-sm">
              การชำระเงินสำเร็จ! กำลังเติมเงินเข้าบัญชีของคุณ...
            </span>
          </div>
        )}

        {status === 'failed' && (
          <div className="w-full mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center">
            <AlertCircle className="text-red-500 w-5 h-5 mr-2" />
            <span className="text-red-400 text-sm">
              การชำระเงินล้มเหลวหรือหมดเวลา โปรดลองอีกครั้ง
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositQRCode;
