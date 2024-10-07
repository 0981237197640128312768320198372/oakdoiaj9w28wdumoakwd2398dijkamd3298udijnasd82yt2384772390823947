import PageHeadline from "@/components/PageHeadline"
import { generateMetadata } from "@/lib/utils"

export const metadata = generateMetadata({
  title: "เกี่ยวกับเรา",
  description:
    "Dokmai Store แพลตฟอร์มสำหรับขายบัญชีแอพพรีเมียมเช่น Netflix Premium และ Amazon Prime Video ในราคาประหยัดพร้อมบริการลูกค้าชั้นยอดที่ตอบสนองเร็วใน 10 นาที.",
  url: "https://www.dokmaistore.com/about-us",
  keywords:
    "Dokmai Store, Netflix Premium, Amazon Prime Video, บัญชีแอพพรีเมียม, บริการลูกค้าไว, ราคาประหยัด, แอพพรีเมียม, ดูซีรีส์, ดูหนัง",
})
export default function AboutUsPage() {
  return (
    <main className='flex flex-col justify-center w-full items-start px-5 xl:px-0 pt-20 xl:pt-40 __container'>
      <PageHeadline
        headline='About Us'
        description='Welcome to Dokmai Store, your trusted platform for premium app accounts, offering services like Netflix Premium, Amazon Prime Video, and more. We are dedicated to providing high-quality accounts with unbeatable customer service and affordable prices.'
      />
      <section className='mb-6'>
        <h2 className='font-aktivGroteskBold text-3xl mb-4'>
          What Sets Us Apart?
        </h2>
        <p className='text-light-300'>
          At Dokmai Store, we pride ourselves on delivering the best premium app
          accounts. Our top features include:
        </p>
        <ul className='list-disc ml-5 text-light-300'>
          <li>
            High-quality accounts for streaming services like Netflix Premium
            and Amazon Prime Video
          </li>
          <li>
            Unmatched customer service with issue resolution within 10 minutes,
            never longer than 24 hours
          </li>
          <li>Flexible payment options, including cryptocurrency</li>
          <li>Affordable prices without compromising on quality</li>
        </ul>
      </section>

      <section className='mb-6'>
        <h2 className='font-aktivGroteskBold text-3xl mb-4'>
          Special Opportunities for Resellers
        </h2>
        <p className='text-light-300'>
          Dokmai Store welcomes resellers who wish to offer premium app
          accounts. We offer <strong>special pricing</strong> and{" "}
          <strong>exclusive deals</strong> for those who meet our reseller
          requirements, allowing you to expand your business with competitive
          pricing.
        </p>
      </section>

      <section className='mb-6'>
        <h2 className='font-aktivGroteskBold text-3xl mb-4'>
          Why Choose Dokmai Store?
        </h2>
        <p className='text-light-300'>
          We offer more than just accounts. With fast response times, reliable
          support, and flexible payments, we are the trusted choice for premium
          app accounts. Whether you&apos;re a Netflix binger, a Prime Video
          lover, or a reseller, we’ve got something for everyone.
        </p>
      </section>

      <section className='mb-6'>
        <h2 className='font-aktivGroteskBold text-3xl mb-4'>Join Us!</h2>
        <p className='text-light-300'>
          Explore our wide range of premium app accounts and experience the best
          service at <strong>Dokmai Store</strong>. We promise to keep
          delivering excellence and ensuring you always get the best.
        </p>
      </section>
    </main>
  )
}
