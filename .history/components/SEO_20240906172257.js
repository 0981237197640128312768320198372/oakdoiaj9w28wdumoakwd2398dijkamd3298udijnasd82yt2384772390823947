// components/SEO.js
import { NextSeo } from "next-seo"
import wsnoutline from "@/assets/images/wsnoutline.png"

const SEO = ({ title, description, canonical, ogImage = null }) => (
  <NextSeo
    title='Payment Page | WatchSeriesNow'
    description='Allows customers to select their desired plan and proceed directly to the Stripe payment page. Simple and efficient payment processing for your chosen plan'
    canonical={canonical}
    openGraph={{
      type: "website",
      locale: "en_IE",
      url: canonical,
      title,
      description,
      images: [
        {
          url: ogImage || { wsnoutline },
          alt: title,
        },
      ],
    }}
  />
)

export default SEO
