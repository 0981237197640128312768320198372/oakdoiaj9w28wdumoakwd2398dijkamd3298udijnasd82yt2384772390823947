'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSellerAuth } from '@/context/SellerAuthContext';
import { useRouter } from 'next/navigation';
import { Store, ArrowLeft, ArrowRight, Send, Loader2, LogIn } from 'lucide-react';
import Image from 'next/image';
import dokmailogosquare from '@/assets/images/dokmailogosquare.png';
import Link from 'next/link';

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
}

// Constants
const FORM_STEPS = {
  STORE_INFO: 1,
  ACCOUNT_INFO: 2,
  CONTACT_INFO: 3,
} as const;

const VALIDATION_RULES = {
  STORE_NAME_MIN: 5,
  STORE_NAME_MAX: 25,
  STORE_DESC_MIN: 75,
  USERNAME_MIN: 10,
  PASSWORD_MIN: 6,
} as const;

const ERROR_MESSAGES = {
  STORE_REQUIRED: 'กรุณากรอกชื่อร้านและคำอธิบายร้านหน่อยครับ',
  STORE_NAME_LENGTH: `ชื่อร้านต้องมีความยาวระหว่าง ${VALIDATION_RULES.STORE_NAME_MIN}-${VALIDATION_RULES.STORE_NAME_MAX} ตัวอักษรครับ`,
  STORE_DESC_LENGTH: `คำอธิบายร้านต้องมีอย่างน้อย ${VALIDATION_RULES.STORE_DESC_MIN} ตัวอักษรครับ`,
  ACCOUNT_REQUIRED: 'กรุณากรอกข้อมูลบัญชีผู้ใช้ให้ครบทุกช่องครับ',
  USERNAME_LENGTH: `ชื่อผู้ใช้ต้องมีอย่างน้อย ${VALIDATION_RULES.USERNAME_MIN} ตัวอักษรครับ`,
  PASSWORD_LENGTH: `รหัสผ่านต้องมีอย่างน้อย ${VALIDATION_RULES.PASSWORD_MIN} ตัวอักษรครับ`,
  PASSWORD_MISMATCH: 'รหัสผ่านไม่ตรงกันครับ',
  EMAIL_INVALID: 'กรุณากรอกที่อยู่อีเมลที่ถูกต้องครับ',
  CONTACT_REQUIRED: 'กรุณาระบุข้อมูลติดต่อ Facebook และ Line หน่อยครับ',
  NETWORK_ERROR: 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองอีกครั้งครับ',
} as const;

const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'ลงทะเบียนสำเร็จแล้ว! กำลังพาคุณไปยังหน้าเข้าสู่ระบบ...',
} as const;

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

// Custom hooks
const useRegisterForm = () => {
  const [step, setStep] = useState<number>(FORM_STEPS.STORE_INFO);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    store: { name: '', description: '' },
    username: '',
    password: '',
    email: '',
    repeatPassword: '',
    contact: { facebook: '', line: '', instagram: '', whatsapp: '' },
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateField = useCallback(
    (name: string, value: string) => {
      setFormData((prev) => {
        if (name.startsWith('store.')) {
          const field = name.split('.')[1] as keyof StoreData;
          return { ...prev, store: { ...prev.store, [field]: value } };
        } else if (name.startsWith('contact.')) {
          const field = name.split('.')[1] as keyof ContactData;
          const processedValue = processContactValue(field, value);
          return { ...prev, contact: { ...prev.contact, [field]: processedValue } };
        } else {
          const processedValue =
            name === 'username' || name === 'email' ? value.toLowerCase().trim() : value;
          return { ...prev, [name]: processedValue };
        }
      });
      if (error) setError(null);
    },
    [error]
  );

  const validateStep = useCallback(
    (currentStep: number): string | null => {
      switch (currentStep) {
        case FORM_STEPS.STORE_INFO:
          if (!formData.store.name.trim() || !formData.store.description.trim()) {
            return ERROR_MESSAGES.STORE_REQUIRED;
          }
          if (
            formData.store.name.length < VALIDATION_RULES.STORE_NAME_MIN ||
            formData.store.name.length > VALIDATION_RULES.STORE_NAME_MAX
          ) {
            return ERROR_MESSAGES.STORE_NAME_LENGTH;
          }
          if (formData.store.description.length < VALIDATION_RULES.STORE_DESC_MIN) {
            return ERROR_MESSAGES.STORE_DESC_LENGTH;
          }
          break;

        case FORM_STEPS.ACCOUNT_INFO:
          if (
            !formData.username.trim() ||
            !formData.password ||
            !formData.repeatPassword ||
            !formData.email.trim()
          ) {
            return ERROR_MESSAGES.ACCOUNT_REQUIRED;
          }
          if (formData.username.length < VALIDATION_RULES.USERNAME_MIN) {
            return ERROR_MESSAGES.USERNAME_LENGTH;
          }
          if (formData.password.length < VALIDATION_RULES.PASSWORD_MIN) {
            return ERROR_MESSAGES.PASSWORD_LENGTH;
          }
          if (formData.password !== formData.repeatPassword) {
            return ERROR_MESSAGES.PASSWORD_MISMATCH;
          }
          if (!validateEmail(formData.email)) {
            return ERROR_MESSAGES.EMAIL_INVALID;
          }
          break;

        case FORM_STEPS.CONTACT_INFO:
          if (!formData.contact.facebook.trim() || !formData.contact.line.trim()) {
            return ERROR_MESSAGES.CONTACT_REQUIRED;
          }
          break;
      }
      return null;
    },
    [formData]
  );

  return {
    step,
    setStep,
    isLoading,
    setIsLoading,
    formData,
    error,
    setError,
    success,
    setSuccess,
    updateField,
    validateStep,
  };
};

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

// Components
const FormHeader = () => (
  <div className="flex flex-col items-center gap-3">
    <div className="relative w-16 h-16 overflow-hidden">
      <Image
        src={dokmailogosquare}
        alt="Dokmai Logo"
        fill
        className="rounded-xl object-cover"
        priority
      />
    </div>
    <h2 className="text-2xl font-bold text-light-100 flex items-center gap-2">
      <Store size={24} className="text-primary" />
      Create Seller Account
    </h2>
  </div>
);

const ProgressSteps = ({ currentStep }: { currentStep: number }) => (
  <div className="flex justify-center items-center gap-4 mb-8">
    {[1, 2, 3].map((s) => (
      <div key={s} className="flex items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            currentStep >= s
              ? 'bg-primary text-dark-800'
              : 'bg-dark-500 text-light-500 border border-dark-400'
          }`}>
          {s}
        </div>
        {s < 3 && (
          <div
            className={`w-16 h-0.5 mx-2 transition-all duration-300 ${
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

const StoreInfoStep = ({
  formData,
  updateField,
}: {
  formData: RegisterFormData;
  updateField: (name: string, value: string) => void;
}) => (
  <div className="space-y-4 animate-in fade-in duration-300">
    <h3 className="text-xl font-semibold text-light-100 mb-4">ข้อมูลร้านค้า</h3>
    <FormInput
      id="store.name"
      name="store.name"
      label="ชื่อร้าน"
      value={formData.store.name}
      onChange={updateField}
      placeholder="กรุณากรอกชื่อร้านของคุณ"
      minLength={VALIDATION_RULES.STORE_NAME_MIN}
      maxLength={VALIDATION_RULES.STORE_NAME_MAX}
      required
    />
    <FormInput
      id="store.description"
      name="store.description"
      label="Store Description"
      value={formData.store.description}
      onChange={updateField}
      placeholder="โปรดอธิบายร้านของคุณ"
      minLength={VALIDATION_RULES.STORE_DESC_MIN}
      rows={4}
      required
    />
  </div>
);

const AccountInfoStep = ({
  formData,
  updateField,
}: {
  formData: RegisterFormData;
  updateField: (name: string, value: string) => void;
}) => (
  <div className="space-y-4 animate-in fade-in duration-300">
    <h3 className="text-xl font-semibold text-light-100 mb-4">Account Information</h3>

    <div>
      <FormInput
        id="username"
        name="username"
        label="Username"
        value={formData.username}
        onChange={updateField}
        placeholder="กรุณากรอกชื่อผู้ใช้ที่คุณต้องการ"
        minLength={VALIDATION_RULES.USERNAME_MIN}
        required
      />
      <p className="text-xs text-light-400 mt-1 mb-2">
        Your username will be used to create your unique store URL
      </p>

      <div className="mt-3 p-3 bg-dark-700 border border-dark-500 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-light-400">Your store URL will be:</span>
        </div>
        <div className="font-mono text-sm bg-dark-800 px-3 py-2 rounded-lg border border-dark-600">
          <span className="text-primary font-semibold">{formData.username || 'username'}</span>
          <span className="text-light-300">.dokmai.store</span>
        </div>
        {formData.username && (
          <div className="mt-2 text-xs text-light-500">
            ✓ Customers can visit your store at this URL
          </div>
        )}
      </div>
    </div>

    <FormInput
      id="email"
      name="email"
      label="อีเมล"
      type="email"
      value={formData.email}
      onChange={updateField}
      placeholder="กรุณากรอกอีเมลของคุณ"
      required
    />

    <FormInput
      id="password"
      name="password"
      label="รหัสผ่าน"
      type="password"
      value={formData.password}
      onChange={updateField}
      placeholder="สร้างรหัสผ่านของคุณ"
      minLength={VALIDATION_RULES.PASSWORD_MIN}
      required
    />

    <FormInput
      id="repeatPassword"
      name="repeatPassword"
      label="ยืนยันรหัสผ่าน"
      type="password"
      value={formData.repeatPassword}
      onChange={updateField}
      placeholder="ยืนยันรหัสผ่านของคุณ"
      required
    />
  </div>
);

const ContactInfoStep = ({
  formData,
  updateField,
}: {
  formData: RegisterFormData;
  updateField: (name: string, value: string) => void;
}) => (
  <div className="space-y-4 animate-in fade-in duration-300">
    <h3 className="text-xl font-semibold text-light-100 mb-4">Contact Information</h3>

    <PrefixInput
      id="contact.facebook"
      name="contact.facebook"
      label="เฟซบุ๊ก"
      prefix="fb.com/"
      value={formData.contact.facebook}
      onChange={updateField}
      placeholder="โปรไฟล์เฟซบุ๊กของคุณ"
      required
    />

    <PrefixInput
      id="contact.line"
      name="contact.line"
      label="ไอดีไลน์"
      prefix="@"
      value={formData.contact.line}
      onChange={updateField}
      placeholder="your.line.id"
      required
    />

    <PrefixInput
      id="contact.instagram"
      name="contact.instagram"
      label="Instagram (Optional)"
      prefix="@"
      value={formData.contact.instagram}
      onChange={updateField}
      placeholder="your.instagram"
    />

    <FormInput
      id="contact.whatsapp"
      name="contact.whatsapp"
      label="WhatsApp (Optional)"
      value={formData.contact.whatsapp}
      onChange={updateField}
      placeholder="+1234567890"
    />
  </div>
);

const MessageDisplay = ({ message, type }: { message: string; type: 'error' | 'success' }) => (
  <div
    className={`mt-4 px-4 py-2 rounded-xl text-sm ${
      type === 'error'
        ? 'bg-rose-500/10 border border-rose-500/50 text-rose-500'
        : 'bg-green-500/10 border border-green-500/50 text-green-500'
    }`}>
    {message}
  </div>
);

const NavigationButtons = ({
  step,
  isLoading,
  onPrevious,
  onNext,
  onSubmit,
}: {
  step: number;
  isLoading: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) => (
  <div className="flex justify-between mt-8">
    {step > 1 && (
      <button
        onClick={onPrevious}
        className="flex items-center gap-2 px-6 py-2 bg-dark-500 text-light-100 rounded-xl hover:bg-dark-400 transition-all duration-300">
        <ArrowLeft size={18} />
        Previous
      </button>
    )}
    {step < 3 ? (
      <button
        onClick={onNext}
        className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-dark-800 rounded-xl transition-all duration-300 ml-auto">
        Next
        <ArrowRight size={18} />
      </button>
    ) : (
      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-dark-800 rounded-xl transition-all duration-300 ml-auto disabled:opacity-50 disabled:cursor-not-allowed">
        {isLoading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Registering...
          </>
        ) : (
          <>
            <Send size={18} />
            Register
          </>
        )}
      </button>
    )}
  </div>
);

const LoginLink = () => (
  <div className="mt-6 text-center">
    <Link
      href="/seller/auth/login"
      className="inline-flex items-center gap-2 text-light-500 hover:text-light-100 text-sm transition-colors duration-300">
      <LogIn size={16} />
      Already have an account? Login here
    </Link>
  </div>
);

// Main component
export default function RegisterSellerPage() {
  useSellerRedirect();
  const router = useRouter();
  const {
    step,
    setStep,
    isLoading,
    setIsLoading,
    formData,
    error,
    setError,
    success,
    setSuccess,
    updateField,
    validateStep,
  } = useRegisterForm();

  const handleNext = useCallback(() => {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep(step + 1);
  }, [step, validateStep, setError, setStep]);

  const handlePrevious = useCallback(() => {
    setError(null);
    setStep(step - 1);
  }, [setError, setStep, step]);

  const handleSubmit = useCallback(async () => {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await registerSeller(formData);
      setSuccess(SUCCESS_MESSAGES.REGISTRATION_SUCCESS);
      setTimeout(() => router.push('/seller/auth/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [step, validateStep, setError, setIsLoading, formData, setSuccess, router]);

  const renderCurrentStep = () => {
    switch (step) {
      case FORM_STEPS.STORE_INFO:
        return <StoreInfoStep formData={formData} updateField={updateField} />;
      case FORM_STEPS.ACCOUNT_INFO:
        return <AccountInfoStep formData={formData} updateField={updateField} />;
      case FORM_STEPS.CONTACT_INFO:
        return <ContactInfoStep formData={formData} updateField={updateField} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8 animate-in fade-in duration-500 ">
      <div className="w-full max-w-2xl space-y-8 bg-dark-600 p-8 rounded-2xl border border-dark-400">
        <FormHeader />
        <ProgressSteps currentStep={step} />

        <div className="transition-all duration-300">
          {renderCurrentStep()}

          {error && <MessageDisplay message={error} type="error" />}
          {success && <MessageDisplay message={success} type="success" />}

          <NavigationButtons
            step={step}
            isLoading={isLoading}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleSubmit}
          />

          <LoginLink />
        </div>
      </div>
    </div>
  );
}
