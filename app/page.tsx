import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { About } from "@/components/about"
import { Services } from "@/components/services"
import { Gallery } from "@/components/gallery"
import { Testimonials } from "@/components/testimonials"
import { Contact } from "@/components/contact"
import { SiteFooter } from "@/components/site-footer"
import { AdvertisingRails } from "@/components/advertising-rails"

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main className="relative">
        <Hero />
        <AdvertisingRails />
        <About />
        <Services />
        <Gallery />
        <Testimonials />
        <Contact />
      </main>
      <SiteFooter />
    </>
  )
}
