/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import DepositForm from '@/components/DepositForm';
import { generateMetadata, logActivity } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
import Loading from '../../loading';

import { redirect } from 'next/navigation';

interface UserInfo {
  balance: number;
  badge: string;
  personalKey: string;
}

const page = () => {
  const [inputPersonalKey, setInputPersonalKey] = useState<string>('');
  const [personalKey, setPersonalKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [checkingLocalStorage, setCheckingLocalStorage] = useState(true);
  const [validatingPersonalKey, setValidatingPersonalKey] = useState(false);
  useEffect(() => {
    const storedPersonalKey = localStorage.getItem('personalKey');
    if (storedPersonalKey) {
      setPersonalKey(storedPersonalKey);
      validatePersonalKey(storedPersonalKey);
    } else {
      setCheckingLocalStorage(false);
    }
  }, []);
  const validatePersonalKey = async (key: string) => {
    try {
      setError(null);
      const userInfoRes = await fetch('/api/get_info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personalKey: key }),
      });

      if (userInfoRes.ok) {
        await logActivity('Login', key, {
          description: 'Logged in successfully',
        });
        const userInfoData = await userInfoRes.json();
        setUserInfo(userInfoData.data);
        localStorage.setItem('personalKey', key);
      } else {
        const errorData = await userInfoRes.json();
        setError(errorData.error || 'Invalid Personal Key.');
        setUserInfo(null);
        localStorage.removeItem('personalKey');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setCheckingLocalStorage(false);
      setValidatingPersonalKey(false);
    }
  };

  if (!checkingLocalStorage && !personalKey) {
    redirect;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPersonalKey) return;
    setPersonalKey(inputPersonalKey);
    setValidatingPersonalKey(true);
    await validatePersonalKey(inputPersonalKey);
    setValidatingPersonalKey(false);
  };

  return (
    <div className="h-screen w-screen justify-center flex flex-col items-center __container">
      {checkingLocalStorage && <Loading />}
      {!checkingLocalStorage && !personalKey && (
        <div className="w-full flex flex-col min-h-96 justify-center items-start h-full gap-10">
          <div className="text-light-300">
            <h2 className="text-2xl font-bold mb-2">ทำความรู้จักกับ Personal Key</h2>
            <p>
              <strong>Personal Key</strong> คือรหัสเฉพาะที่ไม่ซ้ำกันและเป็นของคุณคนเดียว!
              คุณจะได้รับรหัสนี้เพียงหนึ่งชุดเท่านั้น
              ซึ่งช่วยให้คุณจัดการข้อมูลและการเข้าถึงบัญชีของคุณอย่างปลอดภัย
              รวมถึงการซื้อแอปพรีเมียมเพิ่มเติมได้สะดวกยิ่งขึ้น
            </p>
          </div>
          <form onSubmit={handleSubmit} className="mb-4 w-full flex flex-col md:flex-row">
            <input
              type="text"
              placeholder="Enter your Personal Key (#ABCD1234)"
              className="border-[1px] border-primary p-2 px-3 w-full focus:outline-none focus:ring-0 bg-transparent text-sm"
              value={inputPersonalKey.toUpperCase()}
              onChange={(e) => setInputPersonalKey(e.target.value)}
            />
            <button
              type="submit"
              className="bg-primary text-dark-800 px-4 py-2 w-full md:w-fit font-aktivGroteskBold">
              Submit
            </button>
          </form>
        </div>
      )}
      {!checkingLocalStorage && !validatingPersonalKey && personalKey && <DepositForm />}
    </div>
  );
};

export default page;
