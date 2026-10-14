import type { Locale } from '@/sanity/types'

/**
 * Interface chrome: aria-labels, the 404 page, the error boundary.
 *
 * Deliberately NOT in Sanity. These are accessibility and failure-state
 * strings that must exist even when the CMS is unreachable — which is exactly
 * when the error boundary renders. Putting them in the CMS would make the
 * fallback depend on the thing that failed. Editors get every string that
 * appears on the page itself; this is the rest.
 */
const UI = {
  en: {
    previousOffers: 'Previous offers',
    nextOffers: 'Next offers',
    whatsapp: 'Chat on WhatsApp',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    menu: 'Menu',
    explore: 'Explore',
    navOffers: 'Offers',
    navService: 'Service & ownership',
    navStory: 'Our story',
    navShowrooms: 'Showrooms in UAE',
    navContact: 'Contact us',
    location: 'Location: United Arab Emirates',
    switchToArabic: 'Switch to Arabic',
    switchToEnglish: 'Switch to English',
    notFoundTitle: "Sorry, we couldn't find that page.",
    goHome: 'Go Home',
    runtimeError: 'Runtime error',
    renderFailed: 'This page failed to render',
    reload: 'Reload',
    loading: 'Loading content…',
    backToRange: 'Back to the range',
    bookTestDrive: 'Book a Test Drive',
    view360: '360° View',
    gallery: 'Gallery',
    specifications: 'Specifications',
    all: 'All',
    zoomHint: 'Hover to zoom — tap on mobile',
    back: 'Back',
    previous: 'Previous',
    next: 'Next',
    slide: 'Slide',
  },
  ar: {
    previousOffers: 'العروض السابقة',
    nextOffers: 'العروض التالية',
    whatsapp: 'تواصل عبر واتساب',
    openMenu: 'فتح القائمة',
    closeMenu: 'إغلاق القائمة',
    menu: 'القائمة',
    explore: 'اكتشف',
    navOffers: 'العروض',
    navService: 'الخدمة والملكية',
    navStory: 'قصتنا',
    navShowrooms: 'صالات العرض في الإمارات',
    navContact: 'اتصل بنا',
    location: 'الموقع: الإمارات العربية المتحدة',
    switchToArabic: 'التبديل إلى العربية',
    switchToEnglish: 'التبديل إلى الإنجليزية',
    notFoundTitle: 'عذرًا، لم نتمكن من العثور على هذه الصفحة.',
    goHome: 'العودة إلى الرئيسية',
    runtimeError: 'خطأ في التشغيل',
    renderFailed: 'تعذّر عرض هذه الصفحة',
    reload: 'إعادة التحميل',
    loading: 'جارٍ تحميل المحتوى…',
    backToRange: 'العودة إلى الطرازات',
    bookTestDrive: 'احجز قيادة تجريبية',
    view360: 'عرض 360°',
    gallery: 'معرض الصور',
    specifications: 'المواصفات',
    all: 'الكل',
    zoomHint: 'مرّر المؤشر للتكبير — انقر على الجوال',
    back: 'رجوع',
    previous: 'السابق',
    next: 'التالي',
    slide: 'الشريحة',
  },
} as const

export type UiKey = keyof (typeof UI)['en']

export function ui(locale: Locale, key: UiKey): string {
  return UI[locale]?.[key] ?? UI.en[key]
}

/**
 * For components rendered outside LocaleProvider (the 404 page and the error
 * boundary), read the locale straight off the URL.
 */
export function localeFromPath(pathname = window.location.pathname): Locale {
  return pathname.startsWith('/ar') ? 'ar' : 'en'
}
