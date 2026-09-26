import { BRAND_NAME, SITE_DESCRIPTION, SITE_URL } from "@/config/brand";
import { PRICES, SIZES, SPECIES } from "@/config/pricing";
import { Page as Landing } from "@/components/v2/Page";

function productJsonLd() {
  const offers = SIZES.flatMap((size) =>
    SPECIES.map((sp) => ({
      "@type": "Offer",
      name: `${BRAND_NAME} ${size.label}, ${sp.name.toLowerCase()}`,
      price: PRICES[size.id][sp.id],
      priceCurrency: "RUB",
      availability: "https://schema.org/PreOrder",
      url: `${SITE_URL}/#preorder`,
    })),
  );
  const prices = offers.map((o) => o.price);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: BRAND_NAME,
    description: SITE_DESCRIPTION,
    image: `${SITE_URL}/og.jpg`,
    brand: { "@type": "Brand", name: BRAND_NAME },
    material: SPECIES.map((s) => s.name).join(", "),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "RUB",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: offers.length,
      availability: "https://schema.org/PreOrder",
      offers,
    },
  };
}

export default function Page() {
  return (
    <>
      <Landing />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd()) }} />
    </>
  );
}
