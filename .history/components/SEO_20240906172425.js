// components/SEO.js
import { NextSeo } from "next-seo"

const SEO = ({ title, description, canonical, ogImage = null }) => (
  <NextSeo
    title='Payment Page | WatchSeriesNow'
    description={description}
    canonical={canonical}
    openGraph={{
      type: "website",
      locale: "en_IE",
      url: canonical,
      title,
      description,
      images: [
        {
          url: ogImage || "path-to-your-default-image.jpg",
          alt: title,
        },
      ],
    }}
  />
)

export default SEO
