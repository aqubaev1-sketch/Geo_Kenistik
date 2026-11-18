import { LandingHero } from '@/components/hero/LandingHero';
import FooterHome from '@/components/footer_home/Footerhome';

export default function Home() {
  return (
    <>
      <div className="container">
        <LandingHero />
      </div>
      <FooterHome />
    </>
  );
}
