/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { MdReportProblem } from 'react-icons/md';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import dokmaicoin3d from '@/assets/images/dokmaicoin3d.png';
import dokmaicoin3d2 from '@/assets/images/dokmaicoin3d2.png';
import { FaUserLock } from 'react-icons/fa6';
import { accountBadge } from '@/constant';
import netflixpremiumlogo from '@/assets/images/netflixpremiumuhd.png';
import primevideo from '@/assets/images/amazonprimevideo.png';
import { PiWallet } from 'react-icons/pi';
import Link from 'next/link';
import Loading from '@/components/Loading';
import EmailList from './EmailList';
import CopyToClipboard from './CopyToClipboard';
import { logActivity } from '@/lib/utils';
import { parse, isValid } from 'date-fns';
import ShowHideText from './ShowHideText';
import SearchableDropdown from './SearchableDropdown';
import dokmaicoin from '@/assets/images/dokmaicoin.gif';
import dokmaioutline from '@/assets/images/dokmaioutline.png';
import { TbUrgent } from 'react-icons/tb';

interface PremiumApp {
  accessType?: string;
  email?: string;
  appName?: string;
  orderDate?: string;
  expireDate?: string;
  password?: string;
  profile?: string;
  pin?: string;
}

interface UserInfo {
  balance: number;
  badge: string;
  personalKey: string;
}

export const ShowPremiumApps = () => {
  const [inputPersonalKey, setInputPersonalKey] = useState<string>('');
  const [personalKey, setPersonalKey] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [premiumData, setPremiumData] = useState<PremiumApp[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [checkingLocalStorage, setCheckingLocalStorage] = useState(true);
  const [validatingPersonalKey, setValidatingPersonalKey] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [emails, setEmails] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [lastSearchedEmail, setLastSearchedEmail] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState(60);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedApp, setSelectedApp] = useState<PremiumApp | null>(null);
  const [problemDescription, setProblemDescription] = useState('');

  const fetchEmails = async (email: string) => {
    setLoadingEmail(true);
    setIsRefreshing(true);
    try {
      const response = await fetch(
        `/api/emails_reset_password?search=${encodeURIComponent(email)}&t=${Date.now()}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }
      const data = await response.json();
      setEmails(data);
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoadingEmail(false);
      setIsRefreshing(false);
      setHasSearched(true);
    }
  };

  const emailAllowedReset = premiumData
    .filter((item: any) => item.accessType && item.accessType.includes('Family Access'))
    .map((item: any) => item.email)
    .filter((email: string | undefined) => email !== undefined) as string[];

  const handleSearch = () => {
    if (emailAllowedReset.includes(searchEmail.trim())) {
      setError(null);
      fetchEmails(searchEmail);
      setLastSearchedEmail(searchEmail);
      setRefreshCountdown(15);
    } else {
      setError('This email is not allowed for reset.');
    }
  };

  const onSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;
    if (hasSearched && searchEmail.trim() && searchEmail === lastSearchedEmail) {
      countdownInterval = setInterval(() => {
        setRefreshCountdown((prevCountdown) => {
          if (prevCountdown === 1) {
            fetchEmails(searchEmail);
            return 15;
          } else {
            return prevCountdown - 1;
          }
        });
      }, 1000);
    }
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [hasSearched, searchEmail, lastSearchedEmail]);

  useEffect(() => {
    const storedPersonalKey = localStorage.getItem('personalKey');
    if (storedPersonalKey) {
      setPersonalKey(storedPersonalKey);
      validatePersonalKey(storedPersonalKey);
    } else {
      setCheckingLocalStorage(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPersonalKey) return;
    setPersonalKey(inputPersonalKey);
    setValidatingPersonalKey(true);
    await validatePersonalKey(inputPersonalKey);
    setValidatingPersonalKey(false);
  };

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
        fetchPremiumData(key);
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
  const parseDate = (dateString: string | undefined | null): Date | null => {
    if (!dateString || typeof dateString !== 'string') {
      console.warn(`Invalid date string: ${dateString}`);
      return null;
    }

    const trimmedDateString = dateString.trim();

    const parsedDate = new Date(trimmedDateString);
    if (isValid(parsedDate)) {
      return parsedDate;
    }

    const patterns = ["dd MMMM yyyy 'at' HH:mm", 'dd MMMM yyyy HH:mm', 'dd MMMM yyyy'];

    for (const pattern of patterns) {
      try {
        const parsed = parse(trimmedDateString, pattern, new Date());
        if (isValid(parsed)) {
          return parsed;
        }
      } catch {
        // Ignore errors and try next pattern
      }
    }

    console.warn(`Unrecognized date format: ${dateString}`);
    return null;
  };

  const fetchPremiumData = async (key: string) => {
    setFetchingData(true);
    try {
      const premiumDataRes = await fetch('/api/your_premium_apps_data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personalKey: key }),
      });

      if (premiumDataRes.ok) {
        const premiumAppsData = await premiumDataRes.json();

        const sortedData = premiumAppsData.data.sort((a: any, b: any) => {
          const dateA = parseDate(a.orderDate)?.getTime() || 0;
          const dateB = parseDate(b.orderDate)?.getTime() || 0;
          return dateB - dateA;
        });

        setPremiumData(sortedData);
      } else {
        const errorData = await premiumDataRes.json();
        setError(errorData.error || 'No premium data found.');
        setPremiumData([]);
      }
    } catch (err) {
      console.log('ERROR', err);
      setError('Failed to fetch premium data. Please try again.');
    } finally {
      setFetchingData(false);
    }
  };

  const handleLogout = async () => {
    await logActivity('Logout', personalKey || 'Unknown', {
      description: 'Logged out successfully',
    });
    localStorage.removeItem('personalKey');
    setPersonalKey(null);
    setUserInfo(null);
    setPremiumData([]);
    setError(null);
    setInputPersonalKey('');
  };

  const getLabelDisplayName = (label: string) =>
    ({
      orderDate: 'Order Date',
      expireDate: 'Expire Date',
      email: 'Email',
      password: 'Password',
      profile: 'Profile',
      pin: 'PIN',
    }[label] || null);

  const filteredPremiumData = premiumData.filter((item: any) => {
    const searchQuery = searchTerm.toLowerCase();
    return (
      item.email?.toLowerCase().includes(searchQuery) ||
      item.appName?.toLowerCase().includes(searchQuery) ||
      item.orderDate?.toLowerCase().includes(searchQuery) ||
      item.expireDate?.toLowerCase().includes(searchQuery) ||
      item.password?.toLowerCase().includes(searchQuery) ||
      item.accessType?.toLowerCase().includes(searchQuery)
    );
  });
  const emailOptions = premiumData
    .filter((item: any) => item.accessType && item.accessType.includes('Family Access'))
    .map((item: any) => item.email)
    .filter((email: string | undefined) => email !== undefined) as string[];

  const handleOpenReportForm = (app: PremiumApp) => {
    setSelectedApp(app);
    setShowReportForm(true);
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCloseReportForm = () => {
    setShowReportForm(false);
    setSelectedApp(null);
    setProblemDescription('');
  };

  const handleReportProblem = async () => {
    if (!selectedApp) return;

    if (!textareaRef.current) {
      console.log('Textarea is not available. Please try again.');
      return;
    }

    const problemDescription = textareaRef.current.value;

    if (!problemDescription) {
      console.log('Please describe the problem before submitting.');
      return;
    }

    const now = new Date();

    const formattedDateTime = now
      .toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      .replace(/ at /, ', ');

    const problem = `${formattedDateTime} | ${problemDescription}`;

    try {
      const response = await fetch('/api/v2/report_problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalKey: userInfo?.personalKey,
          appName: selectedApp.appName,
          accessType: selectedApp.accessType,
          Email: selectedApp.email,
          Password: selectedApp.password,
          orderDate: selectedApp.orderDate,
          problem,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to report problem');
      }
      setPremiumData((prevData) =>
        prevData.map((app) =>
          app.email === selectedApp.email && app.appName === selectedApp.appName
            ? { ...app, problem }
            : app
        )
      );

      handleCloseReportForm();
      textareaRef.current.value = '';
    } catch (error) {
      console.error('Error reporting problem:', error);
    }
  };

  return (
    <div className="w-full justify-center items-center">
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
      {validatingPersonalKey && <Loading text="กำลังเช็คข้อมูลของคุณ..." />}
      {!checkingLocalStorage && !validatingPersonalKey && userInfo && (
        <div className="flex gap-5 lg:gap-10 flex-col lg:flex-row">
          <div
            className={`bg-white/10 relative rounded-lg overflow-hidden md:min-w-96 h-fit group md:w-fit w-full shadow-xl ${
              userInfo.badge === 'VIP' && 'shadow-goldVIP/20'
            } ${userInfo.badge === 'VVIP' && 'shadow-purpleVVIP/20'}`}>
            <div
              className={`bg-gradient-to-br from-black/20 to-black rounded-xl p-5 w-full border-[1px] ${
                userInfo.badge === 'VIP' && 'border-goldVIP'
              } ${userInfo.badge === 'VVIP' && 'border-purpleVVIP'} ${
                (userInfo.badge !== 'VIP' || 'VVIP') && 'border-dark-300/70'
              }`}>
              <div className="flex gap-2 items-start select-none w-full justify-between mb-10">
                <div className="flex gap-2 h-14 items-center">
                  <Image
                    src={dokmaicoin3d}
                    width={300}
                    height={300}
                    className="w-8 h-w-8"
                    alt="Dokmai Coin Icon"
                  />
                  <span className="gap-0 text-xs font-aktivGroteskMedium">
                    Dokmai Coin
                    <p className="text-xl font-aktivGroteskBold">{userInfo.balance}</p>
                  </span>
                </div>
                <Link
                  href="/deposit"
                  className="flex gap-2 items-center bg-primary text-xs hover:bg-primary/90 text-dark-800 rounded p-1 z-30 font-bold">
                  <PiWallet className="w-5 h-5 " />
                  เติมเงิน
                </Link>
              </div>
              <div className="flex flex-col items-start justify-center gap-2">
                {accountBadge(userInfo.badge)}
                <div className="flex gap-2 items-center mt-1">
                  <FaUserLock className="w-8 h-8 text-white p-2 bg-white/10 rounded-lg mr-1" />
                  <p className="text-lg select-none">
                    <ShowHideText text={userInfo.personalKey} />
                  </p>
                </div>
              </div>
              <div className="w-full flex justify-end">
                <button
                  onClick={handleLogout}
                  className=" bg-red-500/10 hover:bg-red-500/30 text-red-500 text-xs rounded px-2 py-1 font-aktivGroteskBold">
                  Logout
                </button>
              </div>
              <Image
                src={dokmaicoin3d2}
                alt="Dokmai Store Logo"
                width={300}
                height={300}
                className="absolute -bottom-20 -right-3 opacity-90 group-hover:opacity-100 select-none duration-1000 -z-40"
              />
            </div>
          </div>
          <div className="text-light-300 text-xs">
            <h3 className="text-xl font-semibold mt-4">ทำไมต้องเก็บ Personal Key ให้ปลอดภัย?</h3>
            <ul className="list-disc ml-6 text-light-500">
              <li>
                <strong>ง่ายและสะดวก:</strong> ไม่ต้องจำอีเมลหรือรหัสผ่านมากมาย แค่รหัส 8 หลัก
                (ประกอบด้วยตัวอักษร 4 ตัว และตัวเลข 4 ตัว) คุณก็สามารถใช้งานได้เลย
              </li>
              <li>
                <strong>ใช้ในการตรวจสอบตัวตน:</strong> ใช้รหัสนี้เพื่อเข้าถึงข้อมูลบัญชีแอปพรีเมียม
                และดูรายละเอียดการซื้อของคุณ
              </li>
              <li>
                <strong>เครื่องมือเข้าถึงพิเศษ:</strong>{' '}
                ใช้รหัสนี้เพื่อรีเซ็ตรหัสผ่านของบัญชีแอปพรีเมียม ซื้อแอปพรีเมียมเพิ่มเติม
                และเข้าถึงยอด <strong>Dokmai Coin</strong> ของคุณ
              </li>
            </ul>

            <h3 className="text-xl font-semibold mt-4">สิ่งที่ควรจำเกี่ยวกับ Personal Key</h3>
            <p>โปรดเก็บรักษารหัสนี้เป็นความลับ! หากมีใครได้รู้รหัสของคุณ พวกเขาจะสามารถ:</p>
            <ul className="list-disc ml-6 text-light-500">
              <li>ดูข้อมูลบัญชีแอปพรีเมียมที่คุณซื้อ</li>
              <li>เข้าถึงยอด Dokmai Coin และข้อมูลสำคัญอื่นๆ ในบัญชีของคุณ</li>
            </ul>

            <p className="mt-4">
              ด้วย Personal Key คุณสามารถจัดการและรักษาความปลอดภัยของบัญชีได้อย่างง่ายดาย
              มั่นใจในความปลอดภัย และสะดวกสบายกับการใช้งานทุกฟีเจอร์ของเรา!
            </p>
          </div>
        </div>
      )}

      {fetchingData && <Loading text="กำลังโหลดข้อมูลของคุณ..." />}

      {!checkingLocalStorage &&
        !validatingPersonalKey &&
        !fetchingData &&
        premiumData.length > 0 && (
          <div className="mt-32 w-full max-md:justify-center">
            <h2 className="font-aktivGroteskBold text-2xl text-light-100 mb-24">
              <span className="text-dark-800 bg-primary p-1">แอพพรีเมียม</span> ที่สั่งซื้อแล้ว
              <br />
              <span className="font-aktivGroteskMedium text-xs">
                แอพพรีเมียมทั้งหมด
                <strong className="font-aktivGroteskMedium text-sm">{premiumData.length}</strong>
                รายการ
              </span>
            </h2>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your premium apps..."
              className="mb-5  border-[1px] border-primary/40 p-2 px-3 w-full focus:outline-none focus:ring-0 bg-transparent text-sm"
            />
            <div className="grid flex-col grid-cols-1 lg:grid-cols-2 gap-5 w-full max-h-[650px] overflow-y-auto px-5 pb-5 border-t-0 border-[1px] border-dark-500 __dokmai_scrollbar">
              {(searchTerm ? filteredPremiumData : premiumData)
                .reverse()
                .map((item: any, index: any) => {
                  const hasProblem = item.hasOwnProperty('problem');
                  return (
                    <div
                      key={index}
                      className="shadow pt-5 relative pb-10 flex flex-col gap-2 border-b-[1px] border-white/20 bg-dark-700 px-5">
                      <div className="w-full flex flex-row-reverse items-start justify-between">
                        {Object.entries(item).map(([label, value], idx) => (
                          <>
                            {String(label) === 'accessType' ? (
                              <span
                                className="text-xs font-aktivGroteskThin text-white/70"
                                key={idx}>
                                {String(value)}
                              </span>
                            ) : null}
                            {String(value) === 'Netflix Premium' ? (
                              <Image
                                src={netflixpremiumlogo}
                                alt="Netflix Premium Ultra HD Icon"
                                width={50}
                                height={50}
                              />
                            ) : null}
                            {String(value) === 'Prime Video' ? (
                              <Image
                                src={primevideo}
                                alt="Prime Video Icon"
                                width={75}
                                height={75}
                              />
                            ) : null}
                          </>
                        ))}
                      </div>

                      {Object.entries(item).map(([label, value], idx) => (
                        <div className="flex flex-col" key={idx}>
                          <p className="font-aktivGroteskMedium text-white/60 text-[7px] md:text-xs ">
                            {getLabelDisplayName(String(label))}
                          </p>
                          <p className="font-aktivGroteskBold flex gap-2 text-[10px] md:text-sm items-center">
                            {String(label) !== 'accessType' &&
                            String(label) !== 'appName' &&
                            String(label) !== 'problem' &&
                            String(label) !== 'contact' &&
                            String(label) !== 'buyVia' ? (
                              <>
                                {String(value)}
                                {String(label) !== 'accessType' &&
                                String(label) !== 'orderDate' &&
                                String(label) !== 'problem' &&
                                String(label) !== 'contact' &&
                                String(label) !== 'buyVia' &&
                                String(label) !== 'appName' ? (
                                  <CopyToClipboard textToCopy={String(value)} />
                                ) : null}
                              </>
                            ) : null}
                          </p>
                        </div>
                      ))}
                      <div className="mt-3 w-full justify-end flex gap-2 z-20">
                        <p className="font-aktivGroteskBold flex gap-2 text-[10px] md:text-sm items-center">
                          Copy All
                        </p>
                        <CopyToClipboard
                          textToCopy={Object.entries(item)
                            .filter(
                              ([label]) => !['accessType', 'orderDate', 'appName'].includes(label)
                            )
                            .map(([label, value]) => `${getLabelDisplayName(label)}: ${value}`)
                            .join('\n')}
                        />
                      </div>
                      <div className="mt-2 w-full justify-end flex gap-2 z-20">
                        {hasProblem ? (
                          <div className="flex flex-col items-start w-full">
                            <p className="font-aktivGroteskBold text-[10px] md:text-sm text-red-500">
                              Problem Reported:
                            </p>
                            <p className="text-[10px] md:text-sm text-white">{item.problem}</p>
                          </div>
                        ) : (
                          <>
                            <p className="font-aktivGroteskBold flex gap-2 text-[10px] md:text-sm items-center">
                              Report Problem
                            </p>
                            <button
                              onClick={() => handleOpenReportForm(item)}
                              className="bg-red-500/20 text-red-500 px-2 py-1 rounded flex gap-1 items-center">
                              <MdReportProblem className="text-lg" />
                            </button>
                          </>
                        )}
                      </div>
                      <Image
                        draggable="false"
                        src={dokmaioutline}
                        width={400}
                        height={400}
                        className="opacity-5 absolute bottom-2 right-2 w-[50%] h-auto select-none"
                        alt="Dokmai Logo Outline"
                      />
                    </div>
                  );
                })}
            </div>
            {premiumData.filter(
              (item: any) => item.accessType && item.accessType.includes('Family Access')
            ).length > 0 && (
              <div className="w-full flex flex-col justify-center items-center pt-48 pb-40">
                <h2 className="font-aktivGroteskBold text-2xl text-light-100 mb-24">
                  Get Email <span className="text-dark-800 bg-primary p-1">Link Or Code</span> For
                  Your <span className="text-dark-800 bg-primary p-1">Premium Apps</span> Here
                </h2>
                <div className="flex w-full justify-start items-start gap-5 flex-col lg:flex-row ">
                  <div className="w-full h-full flex flex-col gap-5 ">
                    <form
                      onSubmit={onSubmitForm}
                      className="w-full flex border-[1px] border-primary/40 rounded-sm">
                      <SearchableDropdown
                        emails={emailOptions}
                        selectedEmail={searchEmail}
                        onSelect={(email) => setSearchEmail(email)}
                      />
                      <button
                        type="submit"
                        className="ml-4 bg-primary hover:bg-primary/70 active:bg-primary/50 text-sm text-dark-800 px-4 py-2 font-aktivGroteskBold">
                        Submit
                      </button>
                    </form>
                    <div className="flex w-full h-full">
                      {loadingEmail ? (
                        <div className="relative flex flex-col mt-20 w-full items-center justify-center gap-3">
                          <Image
                            src={dokmaicoin}
                            alt="Dokmai Coin Logo | Dokmai Store"
                            width={100}
                            height={100}
                            loading="lazy"
                            className="w-32 h-auto"
                          />
                        </div>
                      ) : (
                        <>
                          {hasSearched ? (
                            <div className="w-full">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-gray-500">
                                  Refreshing ({lastSearchedEmail})
                                  <br className="md:hidden" /> in {refreshCountdown} seconds...
                                </p>
                                {isRefreshing && (
                                  <p className="text-blue-500 animate-pulse">
                                    Refreshing emails...
                                  </p>
                                )}
                              </div>

                              <EmailList emails={emails} />
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {showReportForm && selectedApp && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50">
                <div className="bg-dark-700 p-5 rounded-lg shadow-lg text-white w-full max-w-md">
                  <p className="mb-3 text-sm">อธิบาย/ชี้แจงปัญหาที่พบ :</p>
                  <textarea
                    ref={textareaRef}
                    defaultValue=""
                    className="w-full p-2 border border-white/20 rounded mb-3 bg-dark-800 text-white text-sm focus:border-primary/50 focus:outline-none focus:ring-0 "
                    rows={4}
                    placeholder="Describe the problem here..."
                  />
                  <div className="flex justify-between w-full">
                    <button
                      onClick={handleCloseReportForm}
                      className="bg-dark-500  text-white/50 px-3 py-1 items-center flex rounded text-sm">
                      Cancel
                    </button>
                    <button
                      onClick={handleReportProblem}
                      className="bg-red-500/30 border-[1px] border-red-500/50 text-red-500 px-3 py-1 gap-2 items-center flex rounded text-sm">
                      <TbUrgent className="text-lg" /> ส่ง
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      {!checkingLocalStorage && !validatingPersonalKey && !fetchingData && error && (
        <div className="w-full p-5 justify-center">
          <p className="px-2 py-1 bg-red-600/20 rounded border-[1px] border-red-500/70 text-red-500 w-fit">
            {error}
          </p>
        </div>
      )}
    </div>
  );
};
