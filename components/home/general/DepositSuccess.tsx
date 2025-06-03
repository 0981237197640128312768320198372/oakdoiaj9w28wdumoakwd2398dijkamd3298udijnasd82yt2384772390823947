import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import Image from 'next/image';
import dokmaicoin3d from '@/assets/images/dokmaicoin3d.png';
import { SuccessData } from '@/types';

interface DepositSuccessProps {
  data: SuccessData;
  onClose: () => void;
}

const DepositSuccess: React.FC<DepositSuccessProps> = ({ data, onClose }) => {
  useEffect(() => {
    const createConfetti = () => {
      const confettiCount = 100;
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '50';
      document.body.appendChild(container);

      for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        const size = Math.random() * 10 + 5;

        confetti.style.position = 'absolute';
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confetti.style.borderRadius = '50%';
        confetti.style.top = '0';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.transform = 'translateY(-100%)';
        confetti.style.animation = `confettiFall ${Math.random() * 3 + 2}s linear forwards`;

        container.appendChild(confetti);

        // Create CSS animation
        const style = document.createElement('style');
        style.innerHTML = `
          @keyframes confettiFall {
            to {
              transform: translateY(100vh) rotate(${Math.random() * 360}deg);
            }
          }
        `;
        document.head.appendChild(style);
      }

      setTimeout(() => {
        document.body.removeChild(container);
      }, 10000);
    };

    createConfetti();
  }, []);

  return (
    <div className="fixed inset-0 h-screen w-screen bg-dark-800/80 backdrop-blur z-40 flex flex-col justify-center items-center">
      <div className="relative max-w-md w-full mx-4 bg-dark-700  border-[1px] border-primary/70 rounded-lg p-6 shadow-lg animate-fadeInUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-primary">เติมเงินสำเร็จ!</h2>
        </div>

        <div className="bg-dark-600 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-300">ข้อมูลส่วนตัว:</span>
            <span className="font-medium text-primary">{data.personalKey}</span>
          </div>

          <div className="border-t border-dark-500 my-3" />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">ยอดเติมเงิน:</span>
              <div className="flex items-center">
                <Image src={dokmaicoin3d} alt="Coin" className="w-4 h-4 mr-1" />
                <span>{data.depositAmount}</span>
              </div>
            </div>

            {data.bonusAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">โบนัส:</span>
                <div className="flex items-center text-green-400">
                  <Image src={dokmaicoin3d} alt="Coin" className="w-4 h-4 mr-1" />
                  <span>+{data.bonusAmount}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between font-medium">
              <span className="text-gray-300">ยอดรวม:</span>
              <div className="flex items-center text-primary">
                <Image src={dokmaicoin3d} alt="Coin" className="w-4 h-4 mr-1" />
                <span>{data.totalDepositAmount}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-dark-500 my-3" />

          <div className="flex justify-between font-bold">
            <span className="text-gray-300">ยอดเงินคงเหลือ:</span>
            <div className="flex items-center text-primary">
              <Image src={dokmaicoin3d} alt="Coin" className="w-4 h-4 mr-1" />
              <span>{data.newBalance}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-primary text-dark-800 font-bold rounded-lg hover:bg-primary/90 transition-colors">
          ปิด
        </button>
      </div>
    </div>
  );
};

export default DepositSuccess;
