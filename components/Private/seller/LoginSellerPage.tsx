'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSellerAuth } from '@/context/SellerAuthContext';
import Link from 'next/link';
import { Store, LogIn, UserPlus, Loader2 } from 'lucide-react';
import Image from 'next/image';
import dokmailogosquare from '@/assets/images/dokmailogosquare.png';
import ButtonWithLoader from '../../ui/ButtonWithLoader';

// Types
interface LoginFormData {
  username: string;
  password: string;
}

interface LoginResponse {
  token?: string;
  error?: string;
}

// Constants
const FORM_VALIDATION = {
  USERNAME_MIN_LENGTH: 3,
  PASSWORD_MIN_LENGTH: 6,
} as const;

const ERROR_MESSAGES = {
  REQUIRED_FIELDS: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่านครับ',
  INVALID_CREDENTIALS: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้องครับ',
  NETWORK_ERROR: 'เกิดข้อผิดพลาด กรุณาลองอีกครั้งครับ',
  USERNAME_TOO_SHORT: `ชื่อผู้ใช้ต้องมีอย่างน้อย ${FORM_VALIDATION.USERNAME_MIN_LENGTH} ตัวอักษรครับ`,
  PASSWORD_TOO_SHORT: `รหัสผ่านต้องมีอย่างน้อย ${FORM_VALIDATION.PASSWORD_MIN_LENGTH} ตัวอักษรครับ`,
} as const;

// Custom hooks
const useLoginForm = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateField = useCallback(
    (field: keyof LoginFormData, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: field === 'username' ? value.toLowerCase().trim() : value,
      }));
      if (error) setError(null);
    },
    [error]
  );

  const validateForm = useCallback((): string | null => {
    const { username, password } = formData;

    if (!username.trim() || !password.trim()) {
      return ERROR_MESSAGES.REQUIRED_FIELDS;
    }

    if (username.length < FORM_VALIDATION.USERNAME_MIN_LENGTH) {
      return ERROR_MESSAGES.USERNAME_TOO_SHORT;
    }

    if (password.length < FORM_VALIDATION.PASSWORD_MIN_LENGTH) {
      return ERROR_MESSAGES.PASSWORD_TOO_SHORT;
    }

    return null;
  }, [formData]);

  return {
    formData,
    error,
    isLoading,
    setError,
    setIsLoading,
    updateField,
    validateForm,
  };
};

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

// API functions
const loginSeller = async (credentials: LoginFormData): Promise<LoginResponse> => {
  const response = await fetch('/api/v3/seller/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  return data;
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
      เข้าสู่ระบบผู้ขาย
    </h2>
    <p className="text-light-500 text-sm text-center">
      ยินดีต้อนรับกลับ! กรุณาเข้าสู่ระบบบัญชีผู้ขายของคุณครับ.
    </p>
  </div>
);

const FormInput = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = true,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-light-100 mb-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-xl text-light-100 placeholder-light-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all duration-300"
      placeholder={placeholder}
      required={required}
      autoComplete={type === 'password' ? 'current-password' : 'username'}
    />
  </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 px-4 py-2 rounded-xl text-sm">
    {message}
  </div>
);

const RegisterLink = () => (
  <div className="text-center">
    <Link
      href="/auth/register"
      className="inline-flex items-center gap-2 text-light-500 hover:text-light-100 text-sm transition-colors duration-300">
      <UserPlus size={16} />
      ยังไม่มีบัญชี? ลงทะเบียนที่นี่
    </Link>
  </div>
);

// Main component
export default function LoginSellerPage() {
  const { login } = useSellerAuth();
  const router = useRouter();
  const { formData, error, isLoading, setError, setIsLoading, updateField, validateForm } =
    useLoginForm();

  useSellerRedirect();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await loginSeller(formData);

        if (data.token) {
          login(data.token);
          router.push('/');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : ERROR_MESSAGES.NETWORK_ERROR);
      } finally {
        setIsLoading(false);
      }
    },
    [formData, validateForm, setError, setIsLoading, login, router]
  );

  return (
    <div className="flex items-center justify-center px-4 animate-in fade-in duration-500">
      <div className="w-full max-w-md space-y-8 bg-dark-700 p-8 rounded-2xl border border-dark-400">
        <FormHeader />

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <FormInput
              id="username"
              label="ชื่อผู้ใช้"
              value={formData.username}
              onChange={(value) => updateField('username', value)}
              placeholder="กรุณากรอกชื่อผู้ใช้ของคุณ"
            />

            <FormInput
              id="password"
              label="รหัสผ่าน"
              type="password"
              value={formData.password}
              onChange={(value) => updateField('password', value)}
              placeholder="กรุณากรอกรหัสผ่านของคุณ"
            />
          </div>

          {error && <ErrorMessage message={error} />}

          <div className="space-y-4">
            <ButtonWithLoader
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-dark-800 py-2 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  เข้าสู่ระบบ
                </>
              )}
            </ButtonWithLoader>

            <RegisterLink />
          </div>
        </form>
      </div>
    </div>
  );
}
