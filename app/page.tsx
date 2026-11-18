import { LandingHero } from '@/components/hero/LandingHero';
import FooterHome from '@/components/footer_home/Footerhome';
import { HomeSections } from '@/components/home/HomeSections';

export default function Home() {
  return (
    <>
      <div className="container">
        <LandingHero />
      </div>
      <HomeSections />
      <FooterHome />
    </>
  );
}
