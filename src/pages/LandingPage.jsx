import Seo from '../components/Seo';
import Home from './Home';
import About from './About';
import Services from './Services';
import Projects from './Projects';
import Contact from './Contact';

/**
 * Single-page public site. All sections render on one continuously-scrolling
 * page; the navbar scrolls to each section by its anchor id
 * (#home, #about, #services, #projects, #contact).
 *
 * Each section component sets `showSeo={false}` so only the one canonical <Seo>
 * below manages the document <title>/meta (otherwise five titles would compete).
 */
export default function LandingPage() {
  return (
    <>
      <Seo
        title="Construction & Interior Design Company"
        description="Swastik Buildcons delivers construction, interior design, renovation, and civil works across PAN India with quality craftsmanship and transparent pricing."
        path="/"
      />
      <Home showSeo={false} />
      <About showSeo={false} />
      <Services showSeo={false} />
      <Projects showSeo={false} />
      <Contact showSeo={false} />
    </>
  );
}
