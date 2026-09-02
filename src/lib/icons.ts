import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faBolt,
  faCarSide,
  faGears,
  faHeadset,
  faPlugCircleBolt,
  faShieldHalved,
  faStar,
  faWrench,
} from '@fortawesome/free-solid-svg-icons'
import {
  faFacebookF,
  faInstagram,
  faLinkedinIn,
  faTiktok,
  faXTwitter,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons'
import type { ServiceIcon, SocialPlatform } from '@/sanity/types'

/** Keys here must match the `icon` option list in the Studio schema. */
export const SERVICE_ICONS: Record<ServiceIcon, IconDefinition> = {
  shield: faShieldHalved,
  gears: faGears,
  plug: faPlugCircleBolt,
  bolt: faBolt,
  wrench: faWrench,
  star: faStar,
  car: faCarSide,
  headset: faHeadset,
}

export const SOCIAL_ICONS: Record<SocialPlatform, IconDefinition> = {
  instagram: faInstagram,
  facebook: faFacebookF,
  twitter: faXTwitter,
  youtube: faYoutube,
  linkedin: faLinkedinIn,
  tiktok: faTiktok,
}

export const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  twitter: 'X',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
}

export function serviceIcon(icon?: ServiceIcon | null): IconDefinition {
  return (icon && SERVICE_ICONS[icon]) || faShieldHalved
}

export function socialIcon(platform?: SocialPlatform | null): IconDefinition | null {
  return (platform && SOCIAL_ICONS[platform]) || null
}
