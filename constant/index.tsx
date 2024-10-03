import React from "react"
import { FaFacebookF, FaInstagram } from "react-icons/fa"
import { FaWhatsapp } from "react-icons/fa6"
import { MdGroups } from "react-icons/md"
import { RiVipCrownLine } from "react-icons/ri"
import { IoDiamondOutline } from "react-icons/io5"
import BadgePlan from "@/components/BadgePlan"

export const navButtons = [
  {
    title: "เครดิต",
    url: "/testimonials",
  },
  {
    title: "ราคา",
    url: "/prices",
  },
  {
    title: "วิธีการสั่งซื้อ",
    url: "/how-to-order",
  },
  {
    title: "Netflix News",
    url: "/netflix-news",
  },
  {
    title: "Recommendations",
    url: "/netflix-recommendation",
  },
]
export const footerButton = [
  {
    title: "วิธีการสั่งซื้อ",
    url: "/how-to-order",
  },
  {
    title: "เกี่ยวกับเรา",
    url: "/about-us",
  },
  {
    title: "ข้อตกลงและเงื่อนไข",
    url: "/terms-and-conditions",
  },
  {
    title: "FAQ",
    url: "/frequently-asked-questions",
  },
]
export const faqs = [
  {
    question: "วิธีการชำระเงินมีช่องทางใดบ้าง?",
    answer:
      "คุณสามารถชำระเงินผ่านช่องทางธนาคาร, PromptPay, หรือ TrueMoney Wallet ซึ่งทำให้สะดวกและรวดเร็วในการใช้งาน",
  },
  {
    question: "บริการนี้ถูกกฎหมายหรือไม่?",
    answer:
      "Dokmai Store ให้บริการตามกฎหมายที่เกี่ยวข้องทุกประการ เรามอบบัญชี Netflix Premium ให้ลูกค้าผ่านวิธีที่ถูกต้องและโปร่งใส โดยเรารักษามาตรฐานทางจริยธรรมในการทำธุรกิจ และการแชร์บัญชีก็เป็นหนึ่งในบริการที่เป็นที่นิยม แต่สำคัญคือต้องใช้งานตามนโยบายของ Netflix ทั้งนี้เราจะทำให้ลูกค้าเข้าใจในลักษณะบริการของเราอย่างชัดเจน",
  },
  {
    question: "ทำไมเราสามารถขายในราคาถูกได้?",
    answer:
      "บริการของเรามีการใช้งานในรูปแบบการแชร์บัญชี ซึ่งจะทำให้ผู้ใช้หลายคนสามารถแชร์ค่าใช้จ่ายกันได้ โดยมีการแบ่งโปรไฟล์ของบัญชีให้กับผู้ใช้แต่ละคน การชำระเงินรวมกันระหว่างผู้ใช้หลายคนทำให้เราสามารถตั้งราคาที่ถูกลงได้ และยังคงมีกำไรเล็กน้อยเพื่อสนับสนุนการดำเนินธุรกิจ",
  },
  {
    question: "ใช้บริการ Netflix Premium จาก Dokmai Store มีปัญหาหรือไม่?",
    answer:
      "บัญชีของเรารับประกันการใช้งานได้จริง และหากมีปัญหาใด ๆ เรามีทีมงานที่พร้อมช่วยเหลือภายใน 10 นาที ถึงไม่เกิน 24 ชั่วโมง",
  },
  {
    question: "ระยะเวลาการรับประกันใช้งานนานแค่ไหน?",
    answer:
      "Dokmai Store ให้การรับประกันตลอดอายุการใช้งาน หากมีปัญหาใด ๆ เราพร้อมดูแลและแก้ไขให้คุณทันที",
  },
  {
    question: "ใช้เวลาเท่าไรในการรับบัญชี Netflix Premium?",
    answer:
      "หลังจากทำการสั่งซื้อแล้ว คุณจะได้รับบัญชี Netflix Premium ภายในเวลาไม่เกิน 10 นาที พร้อมใช้งานทันที",
  },
  {
    question: "สามารถคืนเงินได้หรือไม่ถ้าพบปัญหา?",
    answer:
      "คุณสามารถติดต่อทีมงาน Dokmai Store ผ่านช่องทางไลน์ หรืออีเมล เราพร้อมตอบคำถามและช่วยเหลืออย่างรวดเร็ว",
  },
  {
    question: "มีช่องทางติดต่อทีมงานอย่างไร?",
    answer:
      "คุณสามารถติดต่อทีมงาน Dokmai Store ผ่านช่องทาง Line หรือ Facebook เราพร้อมตอบคำถามและช่วยเหลืออย่างทันที",
  },
  {
    question: "บัญชี Netflix Premium จาก Dokmai Store เป็นแบบแชร์หรือไม่?",
    answer:
      "เรามีบริการบัญชีทั้งแบบแชร์กับผู้ใช้คนอื่น และแบบ Family Access ที่คุณสามารถใช้งานได้เต็มที่ทุกอุปกรณ์",
  },
  {
    question: "หากต้องการเปลี่ยนแผนการใช้งาน Netflix ทำได้หรือไม่?",
    answer:
      "หากคุณต้องการเปลี่ยนแผนจากแชร์เป็น Family Access หรือปรับระยะเวลาการใช้งาน คุณสามารถติดต่อทีมงานได้ทันที",
  },
  {
    question: "มีโปรโมชั่นหรือส่วนลดบ้างหรือไม่?",
    answer:
      "Dokmai Store มีการจัดโปรโมชั่นเป็นระยะ คุณสามารถติดตามผ่านช่องทาง Social Media ของเรา หรือสอบถามทีมงานได้เลย",
  },
]
export const features = [
  {
    text: "บริการเร็ว",
  },
  {
    text: "รับประกันตลอดการใช้งาน",
  },
  {
    text: "ซัพพอร์ตด้วยคุณภาพ",
  },
  {
    text: "ชำระเงินอย่างปลอดภัย",
  },
  {
    text: "บัญชีคุณภาพดีที่สุด",
  },
  {
    text: "ผู้ขายเชื่อถือได้",
  },
  {
    text: "ผู้ให้บริการ Netflix อันดับ 1 ในไทย",
  },
  {
    text: "ราคาเข้าถึงง่าย",
  },
]
export const FiveStarsReview = [
  {
    title: "คุ้มค่ามาก",
    review:
      "เป็นครั้งแรกที่ซื้อ Netflix Premium ราคานี้ บริการดีมาก แนะนำเลยครับ!",
    name: "สมชาย วงษ์เจริญ",
    date: "15 September 2023",
  },
  {
    title: "ประทับใจมาก",
    review:
      "ได้รับบัญชีรวดเร็วและใช้งานได้ทันที ชอบตรงที่มีการรับประกันการใช้งานตลอด คุ้มสุดๆ",
    name: "อรนุช สุวรรณกุล",
    date: "10 August 2023",
  },
  {
    title: "บริการดีจริง",
    review:
      "ตอบกลับรวดเร็วมาก ช่วยแก้ปัญหาทันที ดูหนังได้ไม่มีสะดุดเลย แนะนำครับ",
    name: "ธนพล รัตนานนท์",
    date: "22 July 2023",
  },
  {
    title: "คุณภาพดี คุ้มราคา",
    review: "Netflix Premium ราคาดี ใช้ได้จริง ไม่มีปัญหาเรื่องการใช้งานเลยค่ะ",
    name: "กนกวรรณ เพ็งสม",
    date: "5 September 2023",
  },
  {
    title: "ไม่ผิดหวังเลย",
    review:
      "เคยลองซื้อหลายที่ ที่นี่ราคาถูกกว่า บริการก็ดี รวดเร็ว ใช้ดีตลอด คุ้มจริงๆ",
    name: "วิชัย นวลจันทร์",
    date: "30 June 2023",
  },
  {
    title: "ราคาถูกและดี",
    review:
      "Netflix Premium ราคานี้หาที่ไหนไม่ได้แล้ว ใช้งานได้ดีมาก บริการยอดเยี่ยม",
    name: "นันทนา คำแก้ว",
    date: "14 April 2024",
  },
  {
    title: "ซื้อง่าย ใช้งานได้จริง",
    review:
      "กังวลตอนแรกว่าจะใช้ได้จริงไหม แต่พอซื้อแล้วไม่ผิดหวังเลยค่ะ แนะนำค่ะ",
    name: "พรทิพย์ ศรีสว่าง",
    date: "1 May 2023",
  },
  {
    title: "ตอบกลับเร็ว",
    review:
      "ทีมงานตอบเร็วมาก ช่วยแก้ปัญหาได้ทันที ไม่ต้องรอนาน บริการดีเยี่ยมครับ",
    name: "ณัฐวุฒิ วัฒนาพงศ์",
    date: "20 June 2023",
  },
  {
    title: "ประทับใจ",
    review: "ใช้งานง่าย ไม่ยุ่งยาก มีปัญหาก็ติดต่อทีมงานได้สะดวก สุดยอดครับ",
    name: "สมบูรณ์ ขันแก้ว",
    date: "10 November 2023",
  },
  {
    title: "ราคาดี ใช้งานได้ดี",
    review: "เคยใช้บริการหลายที่ ที่นี่ราคาดีกว่าและใช้งานได้จริง ไม่มีปัญหา",
    name: "สิทธิศักดิ์ อรุณรัตน์",
    date: "22 December 2023",
  },
  {
    title: "คุณภาพดี บริการไว",
    review:
      "สั่งซื้อและได้รับบัญชีทันที ใช้งานได้เลย ไม่มีปัญหาอะไร คุ้มค่ามาก",
    name: "กฤษดา ศรีสมบัติ",
    date: "18 January 2024",
  },
]
export const FiveStarsReview2 = [
  {
    title: "คุ้มราคาและบริการดี",
    review: "ประทับใจกับความรวดเร็วและการบริการ ซื้อง่าย ใช้งานง่าย แนะนำครับ",
    name: "อำนวย น้อยจันทร์",
    date: "4 February 2024",
  },
  {
    title: "ซื้อง่าย ใช้งานได้จริง",
    review: "มีปัญหาแค่เล็กน้อยแต่ทีมงานช่วยแก้ไขทันที บริการดีมาก คุ้มราคา",
    name: "ดวงพร ทองดี",
    date: "28 July 2023",
  },
  {
    title: "ใช้ดีมาก",
    review:
      "Netflix Premium ที่นี่ราคาดี ใช้ได้จริงตลอด ไม่มีสะดุดเลยค่ะ แนะนำสุดๆ",
    name: "อรุณี เพชรประเสริฐ",
    date: "12 March 2024",
  },
  {
    title: "ได้รับไวมาก",
    review: "สั่งซื้อแล้วได้บัญชีไวมาก ไม่เกิน 10 นาที บริการรวดเร็วทันใจจริงๆ",
    name: "เจษฎา ชาวเมือง",
    date: "5 August 2023",
  },
  {
    title: "ไม่ผิดหวังจริงๆ",
    review:
      "เคยซื้อจากที่อื่นมาเยอะ ที่นี่ดีที่สุด ทั้งคุณภาพและบริการ ประทับใจมาก",
    name: "วสันต์ ทองสุข",
    date: "19 October 2023",
  },
  {
    title: "ประทับใจการบริการ",
    review: "ซื้อแล้วเจอปัญหาเล็กน้อย แต่ทางร้านแก้ไขเร็วมากค่ะ บริการประทับใจ",
    name: "มณีรัตน์ บุญมี",
    date: "15 May 2024",
  },
  {
    title: "สะดวกและง่าย",
    review: "ซื้อแล้วใช้ได้เลย ไม่ต้องรอนาน บริการดี คุ้มค่ากับราคามาก",
    name: "ปิยะวัฒน์ ชาติวงศ์",
    date: "22 June 2024",
  },
  {
    title: "แนะนำเลย",
    review:
      "บริการรวดเร็ว บัญชีใช้งานได้จริง ดูหนังได้ไม่สะดุด ประทับใจมากครับ",
    name: "สิริชัย สุวรรณ",
    date: "9 September 2023",
  },
  {
    title: "คุณภาพคุ้มราคา",
    review: "ซื้อแล้วใช้งานได้จริง ประทับใจกับบริการและคุณภาพของสินค้ามาก",
    name: "กิติพงศ์ ศรีสม",
    date: "7 July 2024",
  },
  {
    title: "บริการดี คุ้มมาก",
    review: "ทีมงานตอบกลับรวดเร็วและช่วยเหลือดีมาก ซื้อง่ายและใช้ดี แนะนำค่ะ",
    name: "ประภัสสร เจริญชัย",
    date: "30 March 2024",
  },
]
export const contactsButton = [
  {
    url: "https://chat.whatsapp.com/INXaIq12j2bLch9sVslcfJ",
    icon: (
      <MdGroups className='text-dark-800 dark:text-gray-300 text-2xl lg:text-xl m-1 group-hover:text-bg-primary' />
    ),
  },
  {
    url: "https://wa.me/6289684684684",
    icon: (
      <FaWhatsapp className='text-dark-800 dark:text-gray-300 text-2xl lg:text-xl m-1 group-hover:text-bg-primary' />
    ),
  },
  {
    url: "https://www.facebook.com/groups/2404456753194087",
    icon: (
      <FaFacebookF className='text-dark-800 dark:text-gray-300 text-2xl lg:text-xl m-1 group-hover:text-bg-primary' />
    ),
  },
  {
    url: "https://www.instagram.com/fpistore_net",
    icon: (
      <FaInstagram className='text-dark-800 dark:text-gray-300 text-2xl lg:text-xl m-1 group-hover:text-bg-primary' />
    ),
  },
]
export const pricingPlans = [
  {
    type: "Sharing Access (No TV)",
    description: "1 จอส่วนตัว ดูใน TV ไม่ได้",
    plans: [
      {
        badge: <BadgePlan text='Basic' />,
        prices: [
          { duration: "1 Day", price: 9 },
          { duration: "3 Days", price: 15 },
          { duration: "5 Days", price: 20 },
          { duration: "7 Days", price: 29 },
        ],
      },
      {
        badge: (
          <BadgePlan
            text='VIP'
            icon={<RiVipCrownLine className='text-goldVIP' />}
          />
        ),
        prices: [
          { duration: "14 Days", price: 55 },
          { duration: "30 Days", price: 99 },
        ],
      },
      {
        badge: (
          <BadgePlan
            text='VVIP'
            icon={<IoDiamondOutline className='text-purpleVVIP' />}
          />
        ),
        prices: [
          { duration: "60 Days", price: 189 },
          { duration: "90 Days", price: 279 },
          { duration: "1 Year", price: 999 },
        ],
      },
    ],
  },
  {
    type: "Sharing Access (With TV)",
    description: "1 จอส่วนตัว ดูใน TV ได้",
    plans: [
      {
        badge: <BadgePlan text='Basic' />,
        prices: [
          { duration: "1 Day", price: 19 },
          { duration: "3 Days", price: 29 },
          { duration: "5 Days", price: 39 },
          { duration: "7 Days", price: 49 },
        ],
      },
      {
        badge: (
          <BadgePlan
            text='VIP'
            icon={<RiVipCrownLine className='text-goldVIP' />}
          />
        ),
        prices: [
          { duration: "14 Days", price: 89 },
          { duration: "30 Days", price: 149 },
        ],
      },
      {
        badge: (
          <BadgePlan
            text='VVIP'
            icon={<IoDiamondOutline className='text-purpleVVIP' />}
          />
        ),
        prices: [
          { duration: "60 Days", price: 279 },
          { duration: "90 Days", price: 409 },
          { duration: "1 Year", price: 1499 },
        ],
      },
    ],
  },
  {
    type: "Family Access",
    description: "1 บัญชี (ได้ทั้ง 5 จอ) ดูได้ทุกอุปกรณ์",
    plans: [
      {
        badge: (
          <BadgePlan
            text='VIP'
            icon={<RiVipCrownLine className='text-goldVIP' />}
          />
        ),
        prices: [
          { duration: "7 Days", price: 149 },
          { duration: "30 Days", price: 599 },
          { duration: "14 Days", price: 299 },
          { duration: "30 Days", price: 599 },
        ],
      },
      {
        badge: (
          <BadgePlan
            text='VVIP'
            icon={<IoDiamondOutline className='text-purpleVVIP' />}
          />
        ),
        prices: [
          { duration: "60 Days", price: 1149 },
          { duration: "90 Days", price: 1599 },
          { duration: "1 Year", price: 6111 },
        ],
      },
    ],
  },
]
