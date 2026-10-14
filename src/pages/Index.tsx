import '@/styles/lotus-uae-for-the-drivers.css'
import BrandHighlightSection from '@/components/Index/BrandHighlightSection'
import ContactCtaSection from '@/components/Index/ContactCtaSection'
import DriverExperienceSection from '@/components/Index/DriverExperienceSection'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/Index/HeroSection'
import MarqueeSection from '@/components/Index/MarqueeSection'
import ModelShowcase from '@/components/Index/ModelShowcase'
import Navbar from '@/components/Navbar'
import OffersCarouselSection from '@/components/Index/OffersCarouselSection'
import OurStorySection from '@/components/Index/OurStorySection'
import ServiceFeaturesSection from '@/components/Index/ServiceFeaturesSection'
import SiteHead from '@/components/common/SiteHead'
import SetupNotice from '@/components/common/SetupNotice'
import PageSkeleton from '@/components/common/PageSkeleton'
import { useContent } from '@/sanity/ContentProvider'
import { isSanityConfigured } from '@/sanity/client'

const Index = () => {
  const { content, loading, error } = useContent()
  const home = content?.home

  if (!isSanityConfigured) return <SetupNotice reason="unconfigured" />
  if (loading && !content) return <PageSkeleton />
  if (error && !content) return <SetupNotice reason="error" detail={error.message} />
  if (!home) return <SetupNotice reason="empty" />

  return (
    <div className="antialiased selection:bg-lotus-yellow selection:text-lotus-black">
      <SiteHead />
      <Navbar />
      <main>
        <HeroSection data={home.hero} />
        <MarqueeSection data={home.marquee} />
        <ModelShowcase data={home.rangeSection} />
        <BrandHighlightSection data={home.brandHighlight} />
        <OurStorySection data={home.story} />
        <OffersCarouselSection data={home.offersSection} />
        <ServiceFeaturesSection data={home.serviceSection} />
        <DriverExperienceSection data={home.showroomSection} />
        <ContactCtaSection data={home.contactCta} />
      </main>
      <Footer />
    </div>
  )
}

export default Index
