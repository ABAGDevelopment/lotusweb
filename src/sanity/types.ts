/**
 * Shape of everything the website reads out of Sanity.
 * These mirror the schema types in `apps/studio/schemaTypes`.
 */

export type Locale = 'en' | 'ar'

/** Field-level i18n: every translatable field is an object keyed by locale. */
export interface LocaleString {
  en?: string | null
  ar?: string | null
}

export type LocaleText = LocaleString

export interface ImageDimensions {
  width: number
  height: number
  aspectRatio: number
}

export interface SanityImageAsset {
  _id: string
  url: string
  metadata?: {
    lqip?: string
    dimensions?: ImageDimensions
  } | null
}

export interface Figure {
  asset?: SanityImageAsset | null
  hotspot?: { x: number; y: number; height: number; width: number } | null
  crop?: { top: number; bottom: number; left: number; right: number } | null
  alt?: LocaleString | null
}

export interface Link {
  label?: LocaleString | null
  href?: string | null
  external?: boolean | null
}

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/* ------------------------------------------------------------------ */

export interface SiteSettings {
  siteTitle?: LocaleString | null
  siteDescription?: LocaleText | null
  defaultLocale?: Locale | null
  enabledLocales?: Locale[] | null
  favicon?: Figure | null
  ogImage?: Figure | null
}

export interface NavigationDoc {
  logoText?: string | null
  statusBadge?: {
    enabled?: boolean | null
    label?: LocaleString | null
  } | null
  links?: (Link & { _key: string })[] | null
  cta?: Link | null
  /** Floating button in the bottom corner of every page. */
  updatesButton?: Link | null
  languageToggle?: {
    enLabel?: string | null
    arLabel?: string | null
  } | null
}

export interface VehicleSpec {
  _key: string
  value?: LocaleString | null
  label?: LocaleString | null
}

export type GalleryCategory = 'exterior' | 'interior' | 'detail'

export interface GalleryImage extends Figure {
  _key: string
  category?: GalleryCategory | null
}

export interface SpecRow {
  _key: string
  label?: LocaleString | null
  value?: LocaleString | null
}

export interface SpecGroup {
  _key: string
  title?: LocaleString | null
  rows?: SpecRow[] | null
}

export interface VehicleDetail extends Vehicle {
  overview?: LocaleText | null
  heroImage?: Figure | null
  gallery?: GalleryImage[] | null
  spin360?: {
    enabled?: boolean | null
    frames?: (Figure & { _key: string })[] | null
  } | null
  specGroups?: SpecGroup[] | null
  seo?: Seo | null
}

export interface TestDriveLabels {
  country?: LocaleString | null
  countryValue?: LocaleString | null
  firstName?: LocaleString | null
  firstNamePlaceholder?: LocaleString | null
  lastName?: LocaleString | null
  lastNamePlaceholder?: LocaleString | null
  email?: LocaleString | null
  emailPlaceholder?: LocaleString | null
  phone?: LocaleString | null
  phonePlaceholder?: LocaleString | null
  phonePrefix?: string | null
  /** Contains {privacy} and {terms}, replaced by the links in privacyStep. */
  privacyConsent?: LocaleString | null
  consentRequired?: LocaleString | null
  marketingConsent?: LocaleString | null
  submit?: LocaleString | null
  submitting?: LocaleString | null
  required?: LocaleString | null
  invalidEmail?: LocaleString | null
  errorTitle?: LocaleString | null
  errorBody?: LocaleString | null
}

/** A car on the test-drive page. Empty name/image fall back to the vehicle. */
export interface TestDriveModel {
  _key: string
  name?: LocaleString | null
  powertrain?: LocaleString | null
  image?: Figure | null
  vehicle?: Pick<Vehicle, '_id' | 'slug' | 'name' | 'image'> | null
}

export interface TestDrivePage {
  eyebrow?: LocaleString | null
  heading?: LocaleString | null
  intro?: LocaleText | null
  /** Title band background. */
  image?: Figure | null
  modelStep?: {
    heading?: LocaleString | null
    intro?: LocaleString | null
    models?: TestDriveModel[] | null
  } | null
  detailsStep?: { heading?: LocaleString | null } | null
  centreStep?: { heading?: LocaleString | null; intro?: LocaleString | null } | null
  privacyStep?: {
    heading?: LocaleString | null
    privacyLink?: Link | null
    termsLink?: Link | null
  } | null
  nextSteps?: {
    heading?: LocaleString | null
    items?: { _key: string; title?: LocaleString | null; body?: LocaleText | null }[] | null
  } | null
  disclaimers?: LocaleText[] | null
  labels?: TestDriveLabels | null
  thankYou?: {
    eyebrow?: LocaleString | null
    heading?: LocaleString | null
    body?: LocaleText | null
    primaryCta?: Link | null
    secondaryCta?: Link | null
    image?: Figure | null
  } | null
  seo?: Seo | null
}

export interface Vehicle {
  _id: string
  slug?: string | null
  name?: LocaleString | null
  tagline?: LocaleString | null
  /** URL of the wordmark image (SVG/PNG). */
  logo?: string | null
  image?: Figure | null
  specs?: VehicleSpec[] | null
  discoverLink?: Link | null
  testDriveLink?: Link | null
}

export interface Offer {
  _id: string
  title?: LocaleString | null
  subtitle?: LocaleString | null
  image?: Figure | null
  link?: Link | null
}

export type ServiceIcon =
  | 'shield'
  | 'gears'
  | 'plug'
  | 'bolt'
  | 'wrench'
  | 'star'
  | 'car'
  | 'headset'

export interface ServiceFeature {
  _id: string
  icon?: ServiceIcon | null
  title?: LocaleString | null
  description?: LocaleText | null
}

export interface Showroom {
  _id: string
  image?: Figure | null
  name?: LocaleString | null
  locationLabel?: LocaleString | null
  address?: LocaleText | null
  hoursLabel?: LocaleString | null
  hours?: LocaleText | null
  contactLabel?: LocaleString | null
  contactText?: LocaleString | null
  contactHref?: string | null
  directionsLabel?: LocaleString | null
  directionsLinkText?: LocaleString | null
  directionsHref?: string | null
  liveStatusLabel?: LocaleString | null
  openLabel?: LocaleString | null
  closedLabel?: LocaleString | null
  isOpen?: boolean | null
}

/* ------------------------------------------------------------------ */
/* Home page sections                                                  */
/* ------------------------------------------------------------------ */

export interface HeroSectionData {
  eyebrow?: LocaleString | null
  headingTop?: LocaleString | null
  headingOutlined?: LocaleString | null
  image?: Figure | null
  primaryCta?: Link | null
  secondaryCta?: Link | null
  slides?: HeroSlideData[] | null
}

export interface HeroSlideData {
  _key?: string
  headingTop?: LocaleString | null
  headingOutlined?: LocaleString | null
  subheading?: LocaleText | null
  image?: Figure | null
  primaryCta?: Link | null
  secondaryCta?: Link | null
  textLink?: Link | null
}

export interface MarqueeSectionData {
  enabled?: boolean | null
  speedSeconds?: number | null
  items?: (LocaleString & { _key: string })[] | null
}

export interface ModelCardSpec {
  _key?: string
  /** The number as written ("1,200", "2.78"); its digits roll up. */
  value?: string | null
  unit?: LocaleString | null
  secondaryUnit?: LocaleString | null
  label?: LocaleString | null
  disclaimerRef?: string | null
}

/** A homepage "Our Models" card. Empty overrides fall back to the vehicle. */
export interface ModelCard {
  _key: string
  visible?: boolean | null
  vehicle?: Pick<Vehicle, '_id' | 'slug' | 'name' | 'logo' | 'image'> | null
  image?: Figure | null
  displayName?: LocaleString | null
  powertrainLabel?: LocaleString | null
  introLine?: LocaleString | null
  startingPrice?: {
    prefix?: LocaleString | null
    currency?: string | null
    amount?: number | null
  } | null
  specs?: ModelCardSpec[] | null
  cta?: Link | null
}

export interface RangeSectionData {
  heading?: LocaleString | null
  subheading?: LocaleText | null
  viewAll?: Link | null
  cards?: ModelCard[] | null
  /** The models in the site menu. */
  vehicles?: Vehicle[] | null
}

export interface HighlightStat {
  _key: string
  value?: string | null
  unit?: string | null
  label?: LocaleString | null
}

export interface BrandHighlightData {
  eyebrow?: LocaleString | null
  heading?: LocaleString | null
  body?: LocaleText | null
  image?: Figure | null
  stats?: HighlightStat[] | null
  primaryCta?: Link | null
  secondaryCta?: Link | null
}

export interface VideoFile {
  asset?: { url: string; mimeType?: string | null; size?: number | null } | null
}

export interface StorySectionData {
  eyebrow?: LocaleString | null
  heading?: LocaleString | null
  image?: Figure | null
  backgroundVideo?: VideoFile | null
  backgroundVideoMobile?: VideoFile | null
  videoPoster?: Figure | null
  leadParagraph?: LocaleText | null
  body?: LocaleText | null
  link?: Link | null
  quoteBefore?: LocaleString | null
  quoteHighlight?: LocaleString | null
  quoteAfter?: LocaleString | null
}

export interface OffersSectionData {
  heading?: LocaleString | null
  offers?: Offer[] | null
}

export interface ServiceSectionData {
  eyebrow?: LocaleString | null
  heading?: LocaleString | null
  features?: ServiceFeature[] | null
}

export interface ShowroomSectionData {
  eyebrow?: LocaleString | null
  heading?: LocaleString | null
  description?: LocaleText | null
  image?: Figure | null
  cta?: Link | null
  showroom?: Showroom | null
}

export interface ContactCtaData {
  heading?: LocaleString | null
  subheading?: LocaleText | null
  cta?: Link | null
  backgroundImage?: Figure | null
  backgroundWord?: string | null
}

export interface StickyBarData {
  enabled?: boolean | null
  primaryCta?: Link | null
  secondaryCta?: Link | null
  whatsappHref?: string | null
}

export interface Seo {
  title?: LocaleString | null
  description?: LocaleText | null
  ogImage?: Figure | null
}

export interface HomePage {
  seo?: Seo | null
  hero?: HeroSectionData | null
  marquee?: MarqueeSectionData | null
  rangeSection?: RangeSectionData | null
  brandHighlight?: BrandHighlightData | null
  story?: StorySectionData | null
  offersSection?: OffersSectionData | null
  serviceSection?: ServiceSectionData | null
  showroomSection?: ShowroomSectionData | null
  contactCta?: ContactCtaData | null
  stickyBar?: StickyBarData | null
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

export interface FooterColumn {
  _key: string
  title?: LocaleString | null
  links?: (Link & { _key: string })[] | null
}

export type SocialPlatform =
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'youtube'
  | 'linkedin'
  | 'tiktok'

export interface SocialLink {
  _key: string
  platform?: SocialPlatform | null
  url?: string | null
}

export interface FooterDoc {
  wordmark?: string | null
  columns?: FooterColumn[] | null
  socialTitle?: LocaleString | null
  socialLinks?: SocialLink[] | null
  languageToggleLabel?: string | null
  copyright?: LocaleString | null
  legalLinks?: (Link & { _key: string })[] | null
}

/* ------------------------------------------------------------------ */
/* The single payload the site fetches                                 */
/* ------------------------------------------------------------------ */

export interface SitePayload {
  settings: SiteSettings | null
  navigation: NavigationDoc | null
  home: HomePage | null
  footer: FooterDoc | null
}
