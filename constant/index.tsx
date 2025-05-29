import React from 'react';
import { RiVipCrownLine } from 'react-icons/ri';
import { IoDiamondOutline } from 'react-icons/io5';
import BadgePlan from '@/components/home/general/BadgePlan';

export const navButtons = [
  {
    title: 'เครดิต',
    url: '/testimonials',
  },
  {
    title: 'สินค้า',
    url: '/products',
  },
  {
    title: 'ช่วยเหลือ',
    url: '/help',
  },
  {
    title: 'เกี่ยวกับเรา',
    url: '/about-us',
  },
  {
    title: 'รายการหนังแนะนำ',
    url: '/movie-series-recommendations',
  },
  {
    title: 'App Dokmai Store',
    url: '/your-premium-apps',
  },
];
export const footerButton = [
  {
    title: 'ช่วยเหลือ',
    url: '/help',
  },
  {
    title: 'เกี่ยวกับเรา',
    url: '/about-us',
  },
  {
    title: 'ข้อตกลงและเงื่อนไข',
    url: '/terms-and-conditions',
  },
  {
    title: 'FAQ',
    url: '/frequently-asked-questions',
  },
];
export const faqs = [
  {
    question: 'วิธีการชำระเงินมีช่องทางใดบ้าง?',
    answer:
      'คุณสามารถชำระเงินผ่านช่องทางธนาคาร, PromptPay, หรือ TrueMoney Wallet ซึ่งทำให้สะดวกและรวดเร็วในการใช้งาน',
  },
  {
    question: 'บริการนี้ถูกกฎหมายหรือไม่?',
    answer:
      'Dokmai Store ให้บริการตามกฎหมายที่เกี่ยวข้องทุกประการ เรามอบบัญชี Netflix Premium ให้ลูกค้าผ่านวิธีที่ถูกต้องและโปร่งใส โดยเรารักษามาตรฐานทางจริยธรรมในการทำธุรกิจ และการแชร์บัญชีก็เป็นหนึ่งในบริการที่เป็นที่นิยม แต่สำคัญคือต้องใช้งานตามนโยบายของ Netflix ทั้งนี้เราจะทำให้ลูกค้าเข้าใจในลักษณะบริการของเราอย่างชัดเจน',
  },
  {
    question: 'ทำไมเราสามารถขายในราคาถูกได้?',
    answer:
      'บริการของเรามีการใช้งานในรูปแบบการแชร์บัญชี ซึ่งจะทำให้ผู้ใช้หลายคนสามารถแชร์ค่าใช้จ่ายกันได้ โดยมีการแบ่งโปรไฟล์ของบัญชีให้กับผู้ใช้แต่ละคน การชำระเงินรวมกันระหว่างผู้ใช้หลายคนทำให้เราสามารถตั้งราคาที่ถูกลงได้ และยังคงมีกำไรเล็กน้อยเพื่อสนับสนุนการดำเนินธุรกิจ',
  },
  {
    question: 'ใช้บริการ Netflix Premium จาก Dokmai Store มีปัญหาหรือไม่?',
    answer:
      'บัญชีของเรารับประกันการใช้งานได้จริง และหากมีปัญหาใด ๆ เรามีทีมงานที่พร้อมช่วยเหลือภายใน 10 นาที ถึงไม่เกิน 24 ชั่วโมง',
  },
  {
    question: 'ระยะเวลาการรับประกันใช้งานนานแค่ไหน?',
    answer:
      'Dokmai Store ให้การรับประกันตลอดอายุการใช้งาน หากมีปัญหาใด ๆ เราพร้อมดูแลและแก้ไขให้คุณทันที',
  },
  {
    question: 'ใช้เวลาเท่าไรในการรับบัญชี Netflix Premium?',
    answer:
      'หลังจากทำการสั่งซื้อแล้ว คุณจะได้รับบัญชี Netflix Premium ภายในเวลาไม่เกิน 10 นาที พร้อมใช้งานทันที',
  },
  {
    question: 'สามารถคืนเงินได้หรือไม่ถ้าพบปัญหา?',
    answer:
      'คุณสามารถติดต่อทีมงาน Dokmai Store ผ่านช่องทางไลน์ หรืออีเมล เราพร้อมตอบคำถามและช่วยเหลืออย่างรวดเร็ว',
  },
  {
    question: 'มีช่องทางติดต่อทีมงานอย่างไร?',
    answer:
      'คุณสามารถติดต่อทีมงาน Dokmai Store ผ่านช่องทาง Line หรือ Facebook เราพร้อมตอบคำถามและช่วยเหลืออย่างทันที',
  },
  {
    question: 'บัญชี Netflix Premium จาก Dokmai Store เป็นแบบแชร์หรือไม่?',
    answer:
      'เรามีบริการบัญชีทั้งแบบแชร์กับผู้ใช้คนอื่น และแบบ Family Access ที่คุณสามารถใช้งานได้เต็มที่ทุกอุปกรณ์',
  },
  {
    question: 'หากต้องการเปลี่ยนแผนการใช้งาน Netflix ทำได้หรือไม่?',
    answer:
      'หากคุณต้องการเปลี่ยนแผนจากแชร์เป็น Family Access หรือปรับระยะเวลาการใช้งาน คุณสามารถติดต่อทีมงานได้ทันที',
  },
  {
    question: 'มีโปรโมชั่นหรือส่วนลดบ้างหรือไม่?',
    answer:
      'Dokmai Store มีการจัดโปรโมชั่นเป็นระยะ คุณสามารถติดตามผ่านช่องทาง Social Media ของเรา หรือสอบถามทีมงานได้เลย',
  },
];
export const features = [
  {
    text: 'บริการเร็ว',
  },
  {
    text: 'รับประกันตลอดการใช้งาน',
  },
  {
    text: 'ซัพพอร์ตด้วยคุณภาพ',
  },
  {
    text: 'ชำระเงินอย่างปลอดภัย',
  },
  {
    text: 'บัญชีคุณภาพดีที่สุด',
  },
  {
    text: 'ผู้ขายเชื่อถือได้',
  },
  {
    text: 'ผู้ให้บริการแอพพรีเมียม อันดับ 1 ในไทย',
  },
  {
    text: 'ราคาเข้าถึงง่าย',
  },
];
export const FiveStarsReview = [
  {
    title: 'คุ้มค่ามาก',
    review: 'เป็นครั้งแรกที่ซื้อ Netflix Premium ราคานี้ บริการดีมาก แนะนำเลยครับ!',
    name: 'สมชาย วงษ์เจริญ',
    date: '15 September 2023',
  },
  {
    title: 'ประทับใจมาก',
    review: 'ได้รับบัญชีรวดเร็วและใช้งานได้ทันที ชอบตรงที่มีการรับประกันการใช้งานตลอด คุ้มสุดๆ',
    name: 'อรนุช สุวรรณกุล',
    date: '10 August 2023',
  },
  {
    title: 'บริการดีจริง',
    review: 'ตอบกลับรวดเร็วมาก ช่วยแก้ปัญหาทันที ดูหนังได้ไม่มีสะดุดเลย แนะนำครับ',
    name: 'ธนพล รัตนานนท์',
    date: '22 July 2023',
  },
  {
    title: 'คุณภาพดี คุ้มราคา',
    review: 'Netflix Premium ราคาดี ใช้ได้จริง ไม่มีปัญหาเรื่องการใช้งานเลยค่ะ',
    name: 'กนกวรรณ เพ็งสม',
    date: '5 September 2023',
  },
  {
    title: 'ไม่ผิดหวังเลย',
    review: 'เคยลองซื้อหลายที่ ที่นี่ราคาถูกกว่า บริการก็ดี รวดเร็ว ใช้ดีตลอด คุ้มจริงๆ',
    name: 'วิชัย นวลจันทร์',
    date: '30 June 2023',
  },
  {
    title: 'ราคาถูกและดี',
    review: 'Netflix Premium ราคานี้หาที่ไหนไม่ได้แล้ว ใช้งานได้ดีมาก บริการยอดเยี่ยม',
    name: 'นันทนา คำแก้ว',
    date: '14 April 2024',
  },
  {
    title: 'ซื้อง่าย ใช้งานได้จริง',
    review: 'กังวลตอนแรกว่าจะใช้ได้จริงไหม แต่พอซื้อแล้วไม่ผิดหวังเลยค่ะ แนะนำค่ะ',
    name: 'พรทิพย์ ศรีสว่าง',
    date: '1 May 2023',
  },
  {
    title: 'ตอบกลับเร็ว',
    review: 'ทีมงานตอบเร็วมาก ช่วยแก้ปัญหาได้ทันที ไม่ต้องรอนาน บริการดีเยี่ยมครับ',
    name: 'ณัฐวุฒิ วัฒนาพงศ์',
    date: '20 June 2023',
  },
  {
    title: 'ประทับใจ',
    review: 'ใช้งานง่าย ไม่ยุ่งยาก มีปัญหาก็ติดต่อทีมงานได้สะดวก สุดยอดครับ',
    name: 'สมบูรณ์ ขันแก้ว',
    date: '10 November 2023',
  },
  {
    title: 'ราคาดี ใช้งานได้ดี',
    review: 'เคยใช้บริการหลายที่ ที่นี่ราคาดีกว่าและใช้งานได้จริง ไม่มีปัญหา',
    name: 'สิทธิศักดิ์ อรุณรัตน์',
    date: '22 December 2023',
  },
  {
    title: 'คุณภาพดี บริการไว',
    review: 'สั่งซื้อและได้รับบัญชีทันที ใช้งานได้เลย ไม่มีปัญหาอะไร คุ้มค่ามาก',
    name: 'กฤษดา ศรีสมบัติ',
    date: '18 January 2024',
  },
];
export const FiveStarsReview2 = [
  {
    title: 'คุ้มราคาและบริการดี',
    review: 'ประทับใจกับความรวดเร็วและการบริการ ซื้อง่าย ใช้งานง่าย แนะนำครับ',
    name: 'อำนวย น้อยจันทร์',
    date: '4 February 2024',
  },
  {
    title: 'ซื้อง่าย ใช้งานได้จริง',
    review: 'มีปัญหาแค่เล็กน้อยแต่ทีมงานช่วยแก้ไขทันที บริการดีมาก คุ้มราคา',
    name: 'ดวงพร ทองดี',
    date: '28 July 2023',
  },
  {
    title: 'ใช้ดีมาก',
    review: 'Netflix Premium ที่นี่ราคาดี ใช้ได้จริงตลอด ไม่มีสะดุดเลยค่ะ แนะนำสุดๆ',
    name: 'อรุณี เพชรประเสริฐ',
    date: '12 March 2024',
  },
  {
    title: 'ได้รับไวมาก',
    review: 'สั่งซื้อแล้วได้บัญชีไวมาก ไม่เกิน 10 นาที บริการรวดเร็วทันใจจริงๆ',
    name: 'เจษฎา ชาวเมือง',
    date: '5 August 2023',
  },
  {
    title: 'ไม่ผิดหวังจริงๆ',
    review: 'เคยซื้อจากที่อื่นมาเยอะ ที่นี่ดีที่สุด ทั้งคุณภาพและบริการ ประทับใจมาก',
    name: 'วสันต์ ทองสุข',
    date: '19 October 2023',
  },
  {
    title: 'ประทับใจการบริการ',
    review: 'ซื้อแล้วเจอปัญหาเล็กน้อย แต่ทางร้านแก้ไขเร็วมากค่ะ บริการประทับใจ',
    name: 'มณีรัตน์ บุญมี',
    date: '15 May 2024',
  },
  {
    title: 'สะดวกและง่าย',
    review: 'ซื้อแล้วใช้ได้เลย ไม่ต้องรอนาน บริการดี คุ้มค่ากับราคามาก',
    name: 'ปิยะวัฒน์ ชาติวงศ์',
    date: '22 June 2024',
  },
  {
    title: 'แนะนำเลย',
    review: 'บริการรวดเร็ว บัญชีใช้งานได้จริง ดูหนังได้ไม่สะดุด ประทับใจมากครับ',
    name: 'สิริชัย สุวรรณ',
    date: '9 September 2023',
  },
  {
    title: 'คุณภาพคุ้มราคา',
    review: 'ซื้อแล้วใช้งานได้จริง ประทับใจกับบริการและคุณภาพของสินค้ามาก',
    name: 'กิติพงศ์ ศรีสม',
    date: '7 July 2024',
  },
  {
    title: 'บริการดี คุ้มมาก',
    review: 'ทีมงานตอบกลับรวดเร็วและช่วยเหลือดีมาก ซื้อง่ายและใช้ดี แนะนำค่ะ',
    name: 'ประภัสสร เจริญชัย',
    date: '30 March 2024',
  },
];
export const Terms = [
  {
    title: '1. บทนำ',
    description:
      'ข้อตกลงและเงื่อนไขนี้กำหนดกฎการใช้เว็บไซต์ Dokmai Store หากคุณเข้าถึงเว็บไซต์นี้ หมายความว่าคุณยอมรับข้อกำหนดเหล่านี้ หากคุณไม่ยอมรับ กรุณาหยุดใช้บริการทันที',
  },
  {
    title: '2. บริการ',
    description:
      'Dokmai Store จำหน่ายผลิตภัณฑ์ดิจิทัล เช่น บัญชีแอพพรีเมียม (เช่น Netflix Premium, Amazon Prime Video) ผลิตภัณฑ์ทั้งหมดใช้สำหรับการใช้งานส่วนตัว การขายต่อโดยไม่ได้รับอนุญาตเป็นสิ่งต้องห้าม',
  },
  {
    title: '3. นโยบายการชำระเงิน',
    description:
      'การชำระเงินต้องทำผ่านช่องทางที่กำหนด เมื่อซื้อแล้ว ไม่มีการคืนเงิน แต่เรารับประกันจะแก้ไขปัญหาทั้งหมดที่คุณพบ',
  },
  {
    title: '4. การใช้งานบัญชีและการเปลี่ยนแปลง',
    description:
      'ลูกค้าสามารถเปลี่ยนชื่อโปรไฟล์ พิน หรือรหัสผ่านได้ แต่ต้องแจ้งก่อน การเปลี่ยนอีเมล เป็นสิ่งต้องห้าม การแชร์บัญชีโดยไม่ได้รับอนุญาตอาจส่งผลให้การเข้าถึงถูกระงับ',
  },
  {
    title: '5. ข้อจำกัดความรับผิดชอบ',
    description: 'Dokmai Store ไม่รับผิดชอบต่อความเสียหายที่เกิดจากการใช้บริการอย่างผิดวิธี',
  },
  {
    title: '6. การเปลี่ยนแปลงข้อกำหนด',
    description: 'เราขอสงวนสิทธิ์ในการแก้ไขข้อกำหนดได้ทุกเมื่อ',
  },
  {
    title: '7. ข้อมูลติดต่อ',
    description: 'หากมีคำถามเกี่ยวกับข้อกำหนด ติดต่อเราที่ support@dokmaistore.com',
  },
];
export const accountBadge = (badge: string) => {
  if (badge === 'VIP') {
    return <BadgePlan text="VIP" icon={<RiVipCrownLine />} />;
  } else if (badge === 'VVIP') {
    return <BadgePlan text="VVIP" icon={<IoDiamondOutline />} />;
  }
  return null;
};

export const productsConfig = {
  PrimeVideoSharingAccess: {
    availableDataRange: 'PrimeVideoSharing!A12:G',
    expireDateColumnIndex: 5,
    totalColumns: 9,
  },
  PrimeVideoFamilyAccess: {
    availableDataRange: 'PrimeVideoFamily!A12:E',
    expireDateColumnIndex: 3,
    totalColumns: 7,
  },
  NetflixPremiumSharingNoTV: {
    availableDataRange: 'SharingNoTV!A12:G',
    expireDateColumnIndex: 5,
    totalColumns: 9,
  },
  NetflixPremiumSharingWithTV: {
    availableDataRange: 'SharingWithTV!A12:G',
    expireDateColumnIndex: 5,
    totalColumns: 9,
  },
  NetflixPremiumFamilyAccess: {
    availableDataRange: 'FamilyAccess!A12:E',
    expireDateColumnIndex: 3,
    totalColumns: 7,
  },
  NetflixPremiumSharingNoTVResellerPrice: {
    availableDataRange: 'RESELLERSharingNoTV!A12:G',
    expireDateColumnIndex: 5,
    totalColumns: 9,
  },
  NetflixPremiumSharingWithTVResellerPrice: {
    availableDataRange: 'RESELLERSharingWithTV!A12:G',
    expireDateColumnIndex: 5,
    totalColumns: 9,
  },
  NetflixPremiumFamilyAccessResellerPrice: {
    availableDataRange: 'RESELLERFamilyAccess!A12:E',
    expireDateColumnIndex: 3,
    totalColumns: 7,
  },
};

export const sheetConfig = [
  {
    range: 'RESELLERFamilyAccess!A12:H',
    appName: 'Netflix Premium',
    accessType: 'Family Access (Seller Price)',
    columns: ['email', 'password', 'expireDate', 'orderDate', 'contact', 'buyVia', 'problem'],
  },
  {
    range: 'RESELLERSharingWithTV!A12:J',
    appName: 'Netflix Premium',
    accessType: 'Sharing Access With TV (Seller Price)',
    columns: [
      'email',
      'password',
      'profile',
      'pin',
      'expireDate',
      'orderDate',
      'contact',
      'buyVia',
      'problem',
    ],
  },
  {
    range: 'RESELLERSharingNoTV!A12:J',
    appName: 'Netflix Premium',
    accessType: 'Sharing Access No TV (Seller Price)',
    columns: [
      'email',
      'password',
      'profile',
      'pin',
      'expireDate',
      'orderDate',
      'contact',
      'buyVia',
      'problem',
    ],
  },
  {
    range: 'FamilyAccess!A12:H',
    appName: 'Netflix Premium',
    accessType: 'Family Access',
    columns: ['email', 'password', 'expireDate', 'orderDate', 'contact', 'buyVia', 'problem'],
  },
  {
    range: 'SharingWithTV!A12:J',
    appName: 'Netflix Premium',
    accessType: 'Sharing Access With TV',
    columns: [
      'email',
      'password',
      'profile',
      'pin',
      'expireDate',
      'orderDate',
      'contact',
      'buyVia',
      'problem',
    ],
  },
  {
    range: 'SharingNoTV!A12:J',
    appName: 'Netflix Premium',
    accessType: 'Sharing Access No TV',
    columns: [
      'email',
      'password',
      'profile',
      'pin',
      'expireDate',
      'orderDate',
      'contact',
      'buyVia',
      'problem',
    ],
  },
  {
    range: 'PrimeVideoSharing!A12:J',
    appName: 'Prime Video',
    accessType: 'Sharing Access',
    columns: [
      'email',
      'password',
      'profile',
      'pin',
      'expireDate',
      'orderDate',
      'contact',
      'buyVia',
      'problem',
    ],
  },
  {
    range: 'PrimeVideoFamily!A12:H',
    appName: 'Prime Video',
    accessType: 'Family Access',
    columns: ['email', 'password', 'expireDate', 'orderDate', 'contact', 'buyVia', 'problem'],
  },
];
