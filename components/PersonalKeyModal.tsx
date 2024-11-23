import Link from "next/link"
import React, { useState } from "react"

type PersonalKeyModalProps = {
  onClose: () => void
  handleCheckout: (personalKey: string) => void
}

const PersonalKeyModal: React.FC<PersonalKeyModalProps> = ({
  onClose,
  handleCheckout,
}) => {
  const [inputPersonalKey, setInputPersonalKey] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputPersonalKey) return
    setLoading(true)
    try {
      const userInfoRes = await fetch("/api/get_info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personalKey: inputPersonalKey }),
      })

      if (!userInfoRes.ok) throw new Error("Invalid Personal Key")

      localStorage.setItem("personalKey", inputPersonalKey)
      onClose()
      handleCheckout(inputPersonalKey)
      setLoading(true)
    } catch (error) {
      setLoading(false)
      setError("มีข้อผิดพลาดเกิดขึ้น โปรดตรวจสอบ Personal Key อีกครั้ง")
    }
  }

  return (
    <div className='fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center'>
      <div className='w-11/12 md:w-1/2 bg-dark-800 border-[1px] border-dark-500 p-5 rounded flex flex-col gap-5 shadow-black shadow-2xl'>
        <div className='text-light-300'>
          <h2 className='text-2xl font-bold mb-3'>ป้อน Personal Key ของคุณ</h2>
          <h3 className='text-sm font-bold'>ทำความรู้จักกับ Personal Key</h3>
          <p className='text-light-700 text-xs'>
            <strong>Personal Key</strong>{" "}
            คือรหัสเฉพาะที่ไม่ซ้ำกันและเป็นของคุณคนเดียว!
            คุณจะได้รับรหัสนี้เพียงหนึ่งชุดเท่านั้น
            ซึ่งช่วยให้คุณจัดการข้อมูลและการเข้าถึงบัญชีของคุณอย่างปลอดภัย
            รวมถึงการซื้อแอปพรีเมียมเพิ่มเติมได้สะดวกยิ่งขึ้น
          </p>
        </div>
        <div className='w-full flex flex-col justify-center items-start h-full gap-10'>
          <form
            onSubmit={handleSubmit}
            className='mb-4 w-full flex flex-col md:flex-row'
          >
            <input
              type='text'
              placeholder='Enter your Personal Key (#ABCD1234)'
              className='border-[1px] border-primary/70 focus:border-primary p-2 px-3 w-full focus:outline-none focus:ring-0 bg-transparent text-sm'
              value={inputPersonalKey}
              onChange={(e) => setInputPersonalKey(e.target.value)}
            />
            <button
              type='submit'
              className='bg-primary text-dark-800 px-4 py-2 w-full md:w-fit font-aktivGroteskBold'
            >
              {loading ? "Processing..." : "Continue"}
            </button>
          </form>
          {error && (
            <p className='px-2 pt-1 bg-red-600/20 rounded border-[1px] border-red-500/70 text-red-500'>
              {error}
            </p>
          )}
        </div>
        <Link href='/register' className='text-primary text-xs font-mono'>
          New? Register here.
        </Link>
      </div>
    </div>
  )
}

export default React.memo(PersonalKeyModal)
