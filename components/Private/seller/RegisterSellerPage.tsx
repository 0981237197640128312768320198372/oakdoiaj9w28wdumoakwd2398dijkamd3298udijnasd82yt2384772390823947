'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSellerAuth } from '@/context/SellerAuthContext';
import { useRouter } from 'next/navigation';
import {
  Store,
  ArrowLeft,
  ArrowRight,
  Send,
  Loader2,
  LogIn,
  MessageCircle,
  Clock,
  CheckCircle,
  Copy,
  RefreshCw,
  PartyPopper,
} from 'lucide-react';
import Image from 'next/image';
import dokmailogosquare from '@/assets/images/dokmailogosquare.png';
import Link from 'next/link';

// Types
interface StoreData {
  name: string;
  description: string;
}

interface ContactData {
  facebook: string;
  line: string;
  instagram: string;
  whatsapp: string;
}

interface RegisterFormData {
  store: StoreData;
  username: string;
  password: string;
  email: string;
  repeatPassword: string;
  contact: ContactData;
}

interface RegisterResponse {
  success?: boolean;
  error?: string;
  message?: string;
  verificationCode?: string;
  expiresAt?: string;
  requiresLineVerification?: boolean;
  pendingId?: string;
  warning?: string;
}

interface VerificationData {
  code: string;
  expiresAt: string;
  pendingId: string;
}

interface VerificationStatus {
  status: 'pending' | 'verified' | 'expired';
  storeName?: string;
  message?: string;
  expiresAt?: string;
}

// Constants
const FORM_STEPS = {
  STORE_INFO: 1,
  ACCOUNT_INFO: 2,
  CONTACT_INFO: 3,
  LINE_VERIFICATION: 4,
} as const;

const VALIDATION_RULES = {
  STORE_NAME_MIN: 5,
  STORE_NAME_MAX: 25,
  STORE_DESC_MIN: 75,
  USERNAME_MIN: 7,
  PASSWORD_MIN: 6,
} as const;

// Custom hooks
const useSellerRedirect = () => {
  const router = useRouter();
  const { seller } = useSellerAuth();

  const redirectPath = useMemo(() => {
    return process.env.NODE_ENV === 'development' ? '/seller' : '/';
  }, []);

  useEffect(() => {
    if (seller) {
      router.push(redirectPath);
    }
  }, [seller, router, redirectPath]);
};

// Utility functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const processContactValue = (field: string, value: string): string => {
  switch (field) {
    case 'facebook':
      return value.startsWith('fb.com/') ? value.replace('fb.com/', '') : value;
    case 'line':
    case 'instagram':
      return value.startsWith('@') ? value.replace('@', '') : value;
    default:
      return value;
  }
};

const formatContactForSubmission = (contact: ContactData) => ({
  facebook: contact.facebook ? `fb.com/${contact.facebook}` : '',
  line: contact.line ? `@${contact.line}` : '',
  instagram: contact.instagram ? `@${contact.instagram}` : '',
  whatsapp: contact.whatsapp,
});

// API functions
const registerSeller = async (data: RegisterFormData): Promise<RegisterResponse> => {
  const payload = {
    username: data.username,
    password: data.password,
    email: data.email,
    contact: formatContactForSubmission(data.contact),
    store: data.store,
  };

  const response = await fetch('/api/v3/seller/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Registration failed. Please try again.');
  }

  return result;
};

const checkVerificationStatus = async (pendingId: string): Promise<VerificationStatus> => {
  const response = await fetch(`/api/v3/seller/check-verification/${pendingId}`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to check verification status');
  }

  return result;
};

// Components
const FormHeader = () => (
  <div className="flex flex-col items-center gap-3">
    <div className="relative w-12 h-12 sm:w-16 sm:h-16 overflow-hidden">
      <Image
        src={dokmailogosquare}
        alt="Dokmai Logo"
        fill
        className="rounded-xl object-cover"
        priority
      />
    </div>
    <h2 className="text-xl sm:text-2xl font-bold text-light-100 flex items-center gap-2 text-center">
      <Store size={20} className="text-primary sm:w-6 sm:h-6" />
      สร้างบัญชีผู้ขาย
    </h2>
  </div>
);

const ProgressSteps = ({ currentStep }: { currentStep: number }) => (
  <div className="flex justify-center items-center gap-2 sm:gap-4 my-5 px-2">
    {[1, 2, 3, 4].map((s) => (
      <div key={s} className="flex items-center">
        <div
          className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 text-xs sm:text-sm ${
            currentStep >= s
              ? 'bg-primary text-dark-800'
              : 'bg-dark-500 text-light-500 border border-dark-400'
          }`}>
          {s}
        </div>
        {s < 4 && (
          <div
            className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 transition-all duration-300 ${
              currentStep > s ? 'bg-primary' : 'bg-dark-400'
            }`}
          />
        )}
      </div>
    ))}
  </div>
);

const FormInput = ({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  minLength,
  maxLength,
  rows,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  rows?: number;
}) => {
  const Component = rows ? 'textarea' : 'input';

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-light-100 mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <Component
        id={id}
        name={name}
        type={rows ? undefined : type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-xl text-light-100 placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
        placeholder={placeholder}
        minLength={minLength}
        maxLength={maxLength}
        rows={rows}
        autoComplete={type === 'email' ? 'email' : type === 'password' ? 'new-password' : 'off'}
      />
    </div>
  );
};

const PrefixInput = ({
  id,
  name,
  label,
  prefix,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  id: string;
  name: string;
  label: string;
  prefix: string;
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder: string;
  required?: boolean;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-light-100 mb-1">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-light-500">{prefix}</span>
      <input
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className={`w-full pr-4 py-2 bg-dark-500 border border-dark-400 rounded-xl text-light-100 placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300 ${
          prefix.length > 2 ? 'pl-[4.5rem]' : 'pl-8'
        }`}
        placeholder={placeholder}
      />
    </div>
  </div>
);

const LineVerificationStep = ({
  verificationData,
  onVerificationComplete,
}: {
  verificationData: VerificationData;
  onVerificationComplete: (storeName: string) => void;
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'expired'>(
    'pending'
  );
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Timer for countdown
  useEffect(() => {
    const expiresAt = new Date(verificationData.expiresAt);
    const updateTimer = () => {
      const now = new Date();
      const diff = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
      setTimeLeft(diff);

      if (diff === 0 && verificationStatus === 'pending') {
        setVerificationStatus('expired');
        setStatusMessage('Verification code has expired');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [verificationData.expiresAt, verificationStatus]);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      const status = await checkVerificationStatus(verificationData.pendingId);

      setVerificationStatus(status.status);
      setStatusMessage(status.message || '');

      if (status.status === 'verified' && status.storeName) {
        onVerificationComplete(status.storeName);
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
      setStatusMessage('Failed to check status. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(verificationData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      <div className="text-center">
        <h3 className="text-lg sm:text-xl font-semibold text-light-100 mb-2">ต้องยืนยัน LINE</h3>
        <p className="text-light-400 text-sm mb-3">
          กรุณายืนยันบัญชี LINE ของคุณเพื่อทำการสมัครสมาชิกให้เสร็จสิ้น
        </p>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          <p className="text-yellow-400 text-sm font-medium">
            ⚠️ การยืนยันเป็นสิ่งจำเป็น - บัญชีของคุณจะถูกสร้างหลังจากยืนยันสำเร็จเท่านั้น
          </p>
        </div>
      </div>

      <div className="bg-dark-700 border border-dark-500 rounded-xl p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-center gap-3">
          {verificationStatus === 'pending' && <Clock className="text-yellow-500" size={24} />}
          {verificationStatus === 'verified' && (
            <CheckCircle className="text-green-500" size={24} />
          )}
          {verificationStatus === 'expired' && <Clock className="text-red-500" size={24} />}
          <span
            className={`font-semibold ${
              verificationStatus === 'pending'
                ? 'text-yellow-500'
                : verificationStatus === 'verified'
                ? 'text-green-500'
                : 'text-red-500'
            }`}>
            {verificationStatus === 'pending' && 'รอการยืนยัน...'}
            {verificationStatus === 'verified' && 'ยืนยันสำเร็จ!'}
            {verificationStatus === 'expired' && 'รหัสยืนยันหมดอายุ'}
          </span>
        </div>

        {verificationStatus === 'pending' && (
          <>
            <div className="text-center">
              <div className="bg-dark-800 border border-dark-600 rounded-lg p-4 mb-4">
                <p className="text-light-300 text-lg font-mono tracking-wider">
                  {verificationData.code}
                </p>
                <button
                  onClick={copyToClipboard}
                  className="mt-2 flex items-center gap-2 mx-auto px-3 py-1 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors">
                  <Copy size={16} />
                  {copied ? 'คัดลอกแล้ว!' : 'คัดลอกรหัส'}
                </button>
              </div>
              <div className="text-light-400 text-sm space-y-2">
                <p>
                  เวลาที่เหลือ:{' '}
                  <span className="text-yellow-500 font-mono">{formatTime(timeLeft)}</span>
                </p>
              </div>
            </div>
            <div className="border-t border-dark-600 pt-4">
              <h4 className="font-semibold text-light-100 mb-3 flex items-center gap-2">
                <MessageCircle size={18} className="text-green-500" />
                วิธีการ:
              </h4>
              <ol className="text-light-300 text-sm space-y-2 list-decimal list-inside">
                <li>เพิ่ม LINE Bot ของเราเป็นเพื่อน</li>
                <li>ส่งรหัสยืนยันข้างต้นไปยังบอทของเรา</li>
                <li>รอข้อความยืนยันจากบอท</li>
                <li>กดปุ่ม "ตรวจสอบสถานะการยืนยัน" ด้านล่าง</li>
              </ol>
              <div className="mt-4 text-center">
                <button
                  onClick={handleCheckStatus}
                  disabled={isChecking}
                  className="flex items-center gap-2 mx-auto px-4 py-2 bg-primary hover:bg-primary/90 text-dark-800 font-semibold rounded-xl transition-all duration-300 disabled:opacity-50">
                  {isChecking ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <RefreshCw size={16} />
                  )}
                  {isChecking ? 'กำลังตรวจสอบ...' : 'ตรวจสอบสถานะการยืนยัน'}
                </button>
                {statusMessage && <p className="mt-2 text-sm text-light-400">{statusMessage}</p>}
              </div>
            </div>
          </>
        )}

        {verificationStatus === 'verified' && (
          <div className="text-center text-green-400">
            <p>บัญชี LINE ของคุณได้รับการยืนยันเรียบร้อยแล้ว!</p>
            <p className="text-sm text-light-400 mt-2">
              ตอนนี้คุณสามารถเข้าถึงฟีเจอร์ผู้ขายทั้งหมดได้แล้ว
            </p>
          </div>
        )}

        {verificationStatus === 'expired' && (
          <div className="text-center text-red-400">
            <p>รหัสยืนยันหมดอายุแล้ว</p>
            <p className="text-sm text-light-400 mt-2">กรุณารีเฟรชหน้าเพื่อรับรหัสใหม่</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* eslint-disable no-unused-vars */
const SuccessModal = ({
  isOpen,
  storeName,
  countdown,
  onContinue,
}: {
  isOpen: boolean;
  storeName: string;
  countdown: number;
  onContinue: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-500 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle className="text-green-500 w-12 h-12" />
            </div>
            <div className="absolute -top-2 -right-2">
              <PartyPopper className="text-primary w-8 h-8 animate-bounce" />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-green-400">ยืนยันตัวตนสำเร็จ!! 🎉</h2>
            <p className="text-light-300">
              ยินดีด้วยค่ะ! ร้านของคุณ{' '}
              <span className="font-semibold text-primary">{storeName}</span> ได้รับการยืนยันแล้ว
            </p>
            <p className="text-light-400 text-sm">บัญชีผู้ขายของคุณแอคทีฟ และพร้อมใช้งาน</p>
          </div>
          <div className="bg-dark-700 border border-dark-600 rounded-xl p-4">
            <p className="text-light-300 text-sm mb-2">กำลังพาคุณไปยังหน้าเข้าสู่ระบบใน:</p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary font-bold text-xl">{countdown}</span>
              </div>
              <span className="text-light-400">วินาที</span>
            </div>
          </div>
          <button
            onClick={onContinue}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-dark-800 font-semibold rounded-xl transition-all duration-300">
            <LogIn size={18} />
            กดเพื่อเช้าสู่ระบบ
          </button>
          <p className="text-light-500 text-xs">
            คุณสามารถเริ่มการขาย และจัดการสินค้าของคุณได้ที่หน้าแดชบอร์ดของผู้ขาย
          </p>
        </div>
      </div>
    </div>
  );
};

// Main component
export default function RegisterSellerPage() {
  useSellerRedirect();
  const router = useRouter();

  const [step, setStep] = useState<number>(FORM_STEPS.STORE_INFO);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(10);

  const [formData, setFormData] = useState<RegisterFormData>({
    store: { name: '', description: '' },
    username: '',
    password: '',
    email: '',
    repeatPassword: '',
    contact: { facebook: '', line: '', instagram: '', whatsapp: '' },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form validation
  const validateCurrentStep = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case FORM_STEPS.STORE_INFO:
        if (!formData.store.name.trim()) {
          newErrors.storeName = 'กรุณาใส่ชื่อร้านค้า';
        } else if (formData.store.name.length < VALIDATION_RULES.STORE_NAME_MIN) {
          newErrors.storeName = `ชื่อร้านต้องมีอย่างน้อย ${VALIDATION_RULES.STORE_NAME_MIN} ตัวอักษร`;
        } else if (formData.store.name.length > VALIDATION_RULES.STORE_NAME_MAX) {
          newErrors.storeName = `ชื่อร้านต้องไม่เกิน ${VALIDATION_RULES.STORE_NAME_MAX} ตัวอักษร`;
        }
        if (!formData.store.description.trim()) {
          newErrors.storeDescription = 'กรุณาใส่คำอธิบายร้านค้า';
        } else if (formData.store.description.length < VALIDATION_RULES.STORE_DESC_MIN) {
          newErrors.storeDescription = `คำอธิบายต้องมีอย่างน้อย ${VALIDATION_RULES.STORE_DESC_MIN} ตัวอักษร`;
        }
        break;
      case FORM_STEPS.ACCOUNT_INFO:
        if (!formData.username.trim()) {
          newErrors.username = 'กรุณาใส่ชื่อผู้ใช้';
        } else if (formData.username.length < VALIDATION_RULES.USERNAME_MIN) {
          newErrors.username = `ชื่อผู้ใช้ต้องมีอย่างน้อย ${VALIDATION_RULES.USERNAME_MIN} ตัวอักษร`;
        }
        if (!formData.email.trim()) {
          newErrors.email = 'กรุณาใส่อีเมล';
        } else if (!validateEmail(formData.email)) {
          newErrors.email = 'กรุณาใส่อีเมลที่ถูกต้อง';
        }
        if (!formData.password.trim()) {
          newErrors.password = 'กรุณาใส่รหัสผ่าน';
        } else if (formData.password.length < VALIDATION_RULES.PASSWORD_MIN) {
          newErrors.password = `รหัสผ่านต้องมีอย่างน้อย ${VALIDATION_RULES.PASSWORD_MIN} ตัวอักษร`;
        }
        if (!formData.repeatPassword.trim()) {
          newErrors.repeatPassword = 'กรุณายืนยันรหัสผ่าน';
        } else if (formData.password !== formData.repeatPassword) {
          newErrors.repeatPassword = 'รหัสผ่านไม่ตรงกัน';
        }
        break;
      case FORM_STEPS.CONTACT_INFO:
        if (!formData.contact.line.trim()) {
          newErrors.line = 'กรุณาใส่ LINE ID';
        }
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [step, formData]);

  // Handle input changes
  const handleInputChange = useCallback(
    (name: string, value: string) => {
      const keys = name.split('.');
      setFormData((prev) => {
        if (keys.length === 1) {
          return { ...prev, [name]: value };
        } else if (keys.length === 2) {
          const [parent, child] = keys;
          if (parent === 'store') {
            return { ...prev, store: { ...prev.store, [child]: value } };
          } else if (parent === 'contact') {
            return { ...prev, contact: { ...prev.contact, [child]: value } };
          }
        }
        return prev;
      });
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
    },
    [errors]
  );

  // Handle contact input changes with processing
  const handleContactChange = useCallback(
    (field: string, value: string) => {
      const processedValue = processContactValue(field, value);
      handleInputChange(`contact.${field}`, processedValue);
    },
    [handleInputChange]
  );

  // Navigation handlers
  const handleNext = useCallback(async () => {
    if (!validateCurrentStep()) return;
    if (step === FORM_STEPS.CONTACT_INFO) {
      setIsLoading(true);
      setError('');
      try {
        const result = await registerSeller(formData);
        if (
          result.requiresLineVerification &&
          result.verificationCode &&
          result.expiresAt &&
          result.pendingId
        ) {
          setVerificationData({
            code: result.verificationCode,
            expiresAt: result.expiresAt,
            pendingId: result.pendingId,
          });
          setStep(FORM_STEPS.LINE_VERIFICATION);
        } else if (result.success) {
          router.push('/auth/login?registered=true');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed');
      } finally {
        setIsLoading(false);
      }
    } else {
      setStep((prev) => prev + 1);
    }
  }, [step, validateCurrentStep, formData, router]);

  const handlePrevious = useCallback(() => {
    setStep((prev) => Math.max(1, prev - 1));
    setError('');
  }, []);

  // Handle verification completion
  const handleVerificationComplete = useCallback(() => {
    setShowSuccessModal(true);
    setRedirectCountdown(5);
  }, []);

  // Countdown effect for success modal
  useEffect(() => {
    if (showSuccessModal && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showSuccessModal && redirectCountdown === 0) {
      router.push('/auth/login?verified=true');
    }
  }, [showSuccessModal, redirectCountdown, router]);

  // Handle manual continue from success modal
  const handleContinueToLogin = useCallback(() => {
    router.push('/auth/login?verified=true');
  }, [router]);

  // Render form steps
  const renderStepContent = () => {
    switch (step) {
      case FORM_STEPS.STORE_INFO:
        return (
          <div className="space-y-4">
            <FormInput
              id="storeName"
              name="store.name"
              label="ชื่อร้านค้า"
              value={formData.store.name}
              onChange={handleInputChange}
              placeholder="ใส่ชื่อร้านค้าของคุณ"
              required
              minLength={VALIDATION_RULES.STORE_NAME_MIN}
              maxLength={VALIDATION_RULES.STORE_NAME_MAX}
            />
            {errors.storeName && <p className="text-rose-500 text-sm">{errors.storeName}</p>}
            <FormInput
              id="storeDescription"
              name="store.description"
              label="คำอธิบายร้านค้า"
              value={formData.store.description}
              onChange={handleInputChange}
              placeholder="อธิบายร้านค้าและสินค้าที่คุณขาย"
              required
              minLength={VALIDATION_RULES.STORE_DESC_MIN}
              rows={4}
            />
            {errors.storeDescription && (
              <p className="text-rose-500 text-sm">{errors.storeDescription}</p>
            )}
          </div>
        );
      case FORM_STEPS.ACCOUNT_INFO:
        return (
          <div className="space-y-4">
            <div>
              <FormInput
                id="username"
                name="username"
                label="ชื่อผู้ใช้"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="เลือกชื่อผู้ใช้ที่ไม่ซ้ำกัน"
                required
                minLength={VALIDATION_RULES.USERNAME_MIN}
              />
              <div className="mt-2 p-3 bg-primary/10 border border-primary/20 rounded-lg max-w-full overflow-x-hidden">
                <p className="text-primary text-sm flex gap-2 items-center justify-center">
                  <Store size={14} />
                  <span className="font-mono font-semibold">
                    {formData.username || 'username'}.dokmai.store
                  </span>
                </p>
              </div>
              {errors.username && <p className="text-rose-500 text-sm mt-1">{errors.username}</p>}
            </div>
            <FormInput
              id="email"
              name="email"
              label="ที่อยู่อีเมล"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="ใส่ที่อยู่อีเมลของคุณ"
              required
            />
            {errors.email && <p className="text-rose-500 text-sm">{errors.email}</p>}
            <FormInput
              id="password"
              name="password"
              label="รหัสผ่าน"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="สร้างรหัสผ่านที่ปลอดภัย"
              required
              minLength={VALIDATION_RULES.PASSWORD_MIN}
            />
            {errors.password && <p className="text-rose-500 text-sm">{errors.password}</p>}
            <FormInput
              id="repeatPassword"
              name="repeatPassword"
              label="ยืนยันรหัสผ่าน"
              type="password"
              value={formData.repeatPassword}
              onChange={handleInputChange}
              placeholder="ยืนยันรหัสผ่านของคุณ"
              required
            />
            {errors.repeatPassword && (
              <p className="text-rose-500 text-sm">{errors.repeatPassword}</p>
            )}
          </div>
        );
      case FORM_STEPS.CONTACT_INFO:
        return (
          <div className="space-y-4">
            <PrefixInput
              id="line"
              name="line"
              label="LINE ID"
              prefix="@"
              value={formData.contact.line}
              onChange={handleContactChange}
              placeholder="ใส่ LINE ID ของคุณ"
              required
            />
            {errors.line && <p className="text-rose-500 text-sm">{errors.line}</p>}
            <PrefixInput
              id="facebook"
              name="facebook"
              label="Facebook (ไม่บังคับ)"
              prefix="fb.com/"
              value={formData.contact.facebook}
              onChange={handleContactChange}
              placeholder="ชื่อผู้ใช้ Facebook ของคุณ"
            />
            <PrefixInput
              id="instagram"
              name="instagram"
              label="Instagram (ไม่บังคับ)"
              prefix="@"
              value={formData.contact.instagram}
              onChange={handleContactChange}
              placeholder="ชื่อผู้ใช้ Instagram ของคุณ"
            />
            <FormInput
              id="whatsapp"
              name="contact.whatsapp"
              label="WhatsApp (ไม่บังคับ)"
              value={formData.contact.whatsapp}
              onChange={handleInputChange}
              placeholder="ใส่หมายเลข WhatsApp ของคุณ"
            />
          </div>
        );
      case FORM_STEPS.LINE_VERIFICATION:
        return verificationData ? (
          <LineVerificationStep
            verificationData={verificationData}
            onVerificationComplete={handleVerificationComplete}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <>
      <SuccessModal
        isOpen={showSuccessModal}
        storeName={formData.store.name}
        countdown={redirectCountdown}
        onContinue={handleContinueToLogin}
      />
      <div className="flex items-center justify-center p-4 ">
        <div className="w-full max-w-md sm:max-w-2xl mx-auto">
          <div className="bg-dark-700 border border-dark-500 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <FormHeader />
            <ProgressSteps currentStep={step} />
            {error && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <p className="text-rose-400 text-sm">{error}</p>
              </div>
            )}
            <div className="space-y-6">{renderStepContent()}</div>
            {step < FORM_STEPS.LINE_VERIFICATION && (
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                {step > 1 && (
                  <button
                    onClick={handlePrevious}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-dark-600 hover:bg-dark-500 text-light-100 rounded-xl transition-all duration-300 disabled:opacity-50">
                    <ArrowLeft size={18} />
                    ย้อนกลับ
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-dark-800 font-semibold rounded-xl transition-all duration-300 disabled:opacity-50">
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : step === FORM_STEPS.CONTACT_INFO ? (
                    <>
                      <Send size={18} />
                      สมัครสมาชิก
                    </>
                  ) : (
                    <>
                      ถัดไป
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            )}
            <div className="mt-8 text-center">
              <p className="text-light-400 text-sm">
                มีบัญชีอยู่แล้ว?{' '}
                <Link
                  href="/auth/login"
                  className="text-primary hover:text-primary/80 transition-colors">
                  <LogIn size={16} className="inline mr-1" />
                  เข้าสู่ระบบ
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
