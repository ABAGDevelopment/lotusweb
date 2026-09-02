/**
 * All content is fetched in a single round trip. Localised fields are returned
 * whole (`{en, ar}`) rather than resolved server-side, so switching language in
 * the UI is instant and needs no extra request.
 *
 * Reference arrays are filtered with `[defined(@->_id)]` BEFORE dereferencing.
 * A plain `[]->` keeps a null slot for any reference that does not resolve —
 * a document that was deleted, or that exists only as a draft while the page
 * referencing it is published. Those nulls reach the components and crash on
 * the first property read. Filtering first drops them server-side.
 */

const FIGURE_FIELDS = /* groq */ `
  alt,
  hotspot,
  crop,
  asset->{ _id, url, metadata { lqip, dimensions } }
`

const FIGURE = /* groq */ `{${FIGURE_FIELDS}}`

const LINK = /* groq */ `{ label, href, external }`

const VEHICLE = /* groq */ `{
  _id,
  "slug": slug.current,
  name,
  tagline,
  image ${FIGURE},
  specs[]{ _key, value, label },
  discoverLink ${LINK},
  testDriveLink ${LINK}
}`

const OFFER = /* groq */ `{
  _id,
  title,
  subtitle,
  image ${FIGURE},
  link ${LINK}
}`

const SERVICE_FEATURE = /* groq */ `{ _id, icon, title, description }`

const SHOWROOM = /* groq */ `{
  _id,
  name,
  locationLabel,
  address,
  hoursLabel,
  hours,
  contactLabel,
  contactText,
  contactHref,
  directionsLabel,
  directionsLinkText,
  directionsHref,
  liveStatusLabel,
  openLabel,
  closedLabel,
  isOpen
}`

export const SITE_QUERY = /* groq */ `{
  "settings": *[_type == "siteSettings"][0]{
    siteTitle,
    siteDescription,
    defaultLocale,
    enabledLocales,
    favicon ${FIGURE},
    ogImage ${FIGURE}
  },

  "navigation": *[_type == "navigation"][0]{
    logoText,
    statusBadge{ enabled, label },
    links[]{ _key, label, href, external },
    cta ${LINK},
    languageToggle{ enLabel, arLabel }
  },

  "home": *[_type == "homePage"][0]{
    seo{ title, description, ogImage ${FIGURE} },

    hero{
      eyebrow,
      headingTop,
      headingOutlined,
      image ${FIGURE},
      primaryCta ${LINK},
      secondaryCta ${LINK}
    },

    marquee{ enabled, speedSeconds, items[]{ _key, en, ar } },

    rangeSection{
      heading,
      subheading,
      viewAll ${LINK},
      "vehicles": vehicles[defined(@->_id)]-> ${VEHICLE}
    },

    brandHighlight{
      eyebrow,
      heading,
      body,
      image ${FIGURE},
      stats[]{ _key, value, unit, label },
      primaryCta ${LINK},
      secondaryCta ${LINK}
    },

    story{
      eyebrow,
      heading,
      image ${FIGURE},
      leadParagraph,
      body,
      link ${LINK},
      quoteBefore,
      quoteHighlight,
      quoteAfter
    },

    offersSection{
      heading,
      "offers": offers[defined(@->_id)]-> ${OFFER}
    },

    serviceSection{
      eyebrow,
      heading,
      "features": features[defined(@->_id)]-> ${SERVICE_FEATURE}
    },

    showroomSection{
      eyebrow,
      heading,
      description,
      image ${FIGURE},
      "showroom": showroom-> ${SHOWROOM}
    },

    contactCta{
      heading,
      subheading,
      cta ${LINK},
      backgroundImage ${FIGURE},
      backgroundWord
    },

    stickyBar{ enabled, primaryCta ${LINK}, secondaryCta ${LINK}, whatsappHref }
  },

  "footer": *[_type == "footer"][0]{
    wordmark,
    columns[]{ _key, title, links[]{ _key, label, href, external } },
    socialTitle,
    socialLinks[]{ _key, platform, url },
    languageToggleLabel,
    copyright,
    legalLinks[]{ _key, label, href, external }
  }
}`

/**
 * The listener filter. Any published mutation to one of these types triggers a
 * refetch of SITE_QUERY. Drafts are excluded so in-progress edits in the Studio
 * do not churn the live site — only "Publish" moves the needle.
 */
export const LISTEN_QUERY = /* groq */ `*[
  _type in [
    "siteSettings",
    "navigation",
    "homePage",
    "vehicle",
    "offer",
    "serviceFeature",
    "showroom",
    "footer",
    "testDrivePage"
  ] && !(_id in path("drafts.**"))
]`

/** A single vehicle detail page, looked up by slug. */
export const VEHICLE_QUERY = /* groq */ `*[_type == "vehicle" && slug.current == $slug][0]{
  _id,
  "slug": slug.current,
  name,
  tagline,
  overview,
  image ${FIGURE},
  heroImage ${FIGURE},
  specs[]{ _key, value, label },
  gallery[]{ _key, category, ${FIGURE_FIELDS} },
  spin360{
    enabled,
    frames[]{ _key, ${FIGURE_FIELDS} }
  },
  specGroups[]{
    _key,
    title,
    rows[]{ _key, label, value }
  },
  seo{ title, description, ogImage ${FIGURE} },
  testDriveLink ${LINK}
}`

/** Slugs of every published vehicle — used for the "other models" strip. */
export const VEHICLE_LINKS_QUERY = /* groq */ `*[_type == "vehicle" && defined(slug.current)]{
  _id,
  "slug": slug.current,
  name,
  image ${FIGURE}
}`

/** Copy and field labels for the test-drive form and its thank-you page. */
export const TEST_DRIVE_QUERY = /* groq */ `*[_type == "testDrivePage"][0]{
  eyebrow,
  heading,
  intro,
  image ${FIGURE},
  labels{
    fullName, email, phone, model, preferredDate, message,
    consent, submit, submitting, required, invalidEmail, errorTitle, errorBody
  },
  modelPlaceholder,
  thankYou{
    eyebrow,
    heading,
    body,
    primaryCta ${LINK},
    secondaryCta ${LINK},
    image ${FIGURE}
  },
  seo{ title, description, ogImage ${FIGURE} }
}`
