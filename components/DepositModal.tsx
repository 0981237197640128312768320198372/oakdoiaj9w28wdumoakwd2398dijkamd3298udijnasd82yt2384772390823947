import React from 'react';

const DepositModal = () => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center">
      <div className="w-11/12 md:w-1/2 bg-dark-800 border-[1px] border-dark-500 p-5 rounded flex flex-col gap-5 shadow-black shadow-2xl">
        <div className="text-light-300">
          <h2 className="text-2xl font-bold mb-3">ป้อน Personal Key ของคุณ</h2>
          <h3 className="text-sm font-bold">ทำความรู้จักกับ Personal Key</h3>
          <p className="text-light-700 text-xs">
            <strong>Personal Key</strong> คือรหัสเฉพาะที่ไม่ซ้ำกันและเป็นของคุณคนเดียว!
            คุณจะได้รับรหัสนี้เพียงหนึ่งชุดเท่านั้น
            ซึ่งช่วยให้คุณจัดการข้อมูลและการเข้าถึงบัญชีของคุณอย่างปลอดภัย
            รวมถึงการซื้อแอปพรีเมียมเพิ่มเติมได้สะดวกยิ่งขึ้น
          </p>
          {/* className='bg-primary text-dark-800 px-4 py-2 w-full md:w-fit font-aktivGroteskBold' */}
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
