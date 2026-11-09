import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google";
import Script from "next/script";

import { GA_MEASUREMENT_ID, GOOGLE_ADS_ID, GTM_ID } from "@/core";

/**
 * GA4, Google Ads and Tag Manager. Production builds only, so local testing
 * stays out of the data; each tag loads only when its ID is set. Page views on
 * in-app navigation come from GA's enhanced measurement.
 */
export function GoogleTags() {
  if (process.env.NODE_ENV !== "production") return null;
  return (
    <>
      {GA_MEASUREMENT_ID ? <GoogleAnalytics gaId={GA_MEASUREMENT_ID} /> : null}
      {GOOGLE_ADS_ID ? <GoogleAds id={GOOGLE_ADS_ID} /> : null}
      {GTM_ID ? <GoogleTagManager gtmId={GTM_ID} /> : null}
    </>
  );
}

/**
 * One gtag.js serves every Google tag, so Ads only adds its `config` to the
 * one GA loaded, and loads gtag.js itself only when GA is off.
 */
function GoogleAds({ id }: { id: string }) {
  const ownLoader = !GA_MEASUREMENT_ID;
  return (
    <>
      <Script id="google-ads-init">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
${ownLoader ? "gtag('js', new Date());\n" : ""}gtag('config', '${id}');`}
      </Script>
      {ownLoader ? (
        <Script
          id="google-ads"
          src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        />
      ) : null}
    </>
  );
}
