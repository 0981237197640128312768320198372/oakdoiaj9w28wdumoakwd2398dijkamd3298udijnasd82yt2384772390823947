import { FC } from 'react';

interface CountdownQRProps {
  timer: number;
}

const CountdownQR: FC<CountdownQRProps> = ({ timer }) => {
  return (
    <div className="text-center mt-2">
      <p className="text-sm text-red-600">
        QR Code expires in: <span className="font-bold">{timer}</span> seconds
      </p>
    </div>
  );
};

export default CountdownQR;
