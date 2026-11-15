"use client";

import Image from "next/image";
import ProjectImage from "./project-image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode, type KeyboardEvent } from "react";
import { motion, type Project, type VideoSlide, type ImageSlide } from "./content";
import type { SiteContent } from "@/sanity/lib/content";

const themes = ["Calm", "Mono", "Focus"] as const;
type Theme = (typeof themes)[number];
export default function Portfolio({ children, content }: { children: ReactNode; content: SiteContent }) {
  const pathname = usePathname();
  const showProjects = pathname.startsWith("/projects");
  const isProjectDetail = pathname.startsWith("/projects/");
  const [theme, setTheme] = useState<Theme>("Calm");
  const mainRef = useRef<HTMLElement>(null);
  const previousView = useRef(showProjects);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    // Use the same Figma color token as the page, including on route changes.
    const color = getComputedStyle(root).getPropertyValue("--background-primary").trim();
    const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (themeMeta && color) themeMeta.content = color;
  }, [theme, pathname]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (previousView.current !== showProjects) mainRef.current?.focus({ preventScroll: true });
    previousView.current = showProjects;
  }, [showProjects]);

  return (
    <div className="portfolio" data-theme={theme} data-view={showProjects ? "projects" : "home"}>
      <a className="skip-link" href="#main" onClick={(event) => {
        event.preventDefault();
        mainRef.current?.focus();
      }}>Skip to content</a>
      <header className={`dynamic-nav${showProjects ? " dynamic-nav--projects" : ""}`}>
        <nav className="navigation" aria-label="Main navigation">
          <Link className="nav-control home-link" href="/" aria-label="Alihoo home" onClick={() => {
            if (!showProjects) window.scrollTo({ top: 0, behavior: "instant" });
          }}><span className="pill">© 26 Alihoo</span></Link>
          <div className="theme-toggle" role="group" aria-label="Color theme">
            {themes.map((name) => (
              <button className="nav-control" key={name} type="button" aria-pressed={theme === name} onClick={() => setTheme(name)}>
                <span className="pill">{name}</span>
              </button>
            ))}
          </div>
        </nav>
        {!showProjects && <Bio content={content} />}
      </header>
      <main id="main" ref={mainRef} tabIndex={-1} className={showProjects ? "projects-view" : "home-view"}>
        {!isProjectDetail && <h1 className="sr-only">{showProjects ? "Alihoo projects" : "Alihoo — independent projects and experiments"}</h1>}
        {children}
      </main>
    </div>
  );
}

function Bio({ content: { bio, links } }: { content: SiteContent }) {
  return <div className="bio" data-figma-node="7194:56">
    {bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    {links.map((link) => <a key={link._key} className="bio-link" href={link.href}
      target={link.newTab ? "_blank" : undefined} rel={link.newTab ? "noopener noreferrer" : undefined}>
      <span>{link.label}</span>{link.caption && <span className="secondary-copy">{link.caption}</span>}
    </a>)}
  </div>;
}

export function ProjectsLoader({ slides: loaderSlides }: { slides: readonly ImageSlide[] }) {
  const [frame, setFrame] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const loadedImages = useRef(new Set<string>());
  useEffect(() => {
    if (!loaderSlides.length || loaded < loaderSlides.length) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setTimeout>;
    let index = 0;
    function advance() {
      if (preference.matches) {
        setFrame(loaderSlides.length - 1);
        return;
      }
      index = (index + 1) % loaderSlides.length;
      setFrame(index);
      const delay = index === loaderSlides.length - 1
        ? Math.max(motion.loaderFrameMs, motion.loaderRepeatMs - (loaderSlides.length - 1) * motion.loaderFrameMs)
        : motion.loaderFrameMs;
      timer = setTimeout(advance, delay);
    }
    function handleMotionChange() {
      clearTimeout(timer);
      index = loaderSlides.length - 1;
      timer = setTimeout(advance, 0);
    }
    preference.addEventListener("change", handleMotionChange);
    timer = setTimeout(advance, preference.matches ? 0 : motion.loaderFrameMs);
    return () => {
      clearTimeout(timer);
      preference.removeEventListener("change", handleMotionChange);
    };
  }, [loaded, loaderSlides.length]);
  return <Link href="/projects" className="projects-loader" aria-label="Explore projects" data-frame={frame}>
    {loaderSlides.map((slide, index) => <Image key={slide.src} src={slide.src} alt="" fill sizes="80px" loading="eager"
      className="project-image loader-image" data-active={index === frame} onLoad={() => {
        if (!loadedImages.current.has(slide.src)) {
          loadedImages.current.add(slide.src);
          setLoaded(loadedImages.current.size);
        }
      }} />)}
  </Link>;
}

export function Projects({ projects }: { projects: readonly Project[] }) {
  return <div className="projects">
    {projects.map((project, index) => <ProjectSection key={project.id} project={project} first={index === 0} />)}
  </div>;
}

export function ProjectSection({ project, first }: { project: Project; first: boolean }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const slide = project.slides[slideIndex];
  const paginationId = `${project.id}-pagination`;
  function move(direction: number) {
    setSlideIndex((current) => (current + direction + project.slides.length) % project.slides.length);
  }
  function handleKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      move(event.key === "ArrowLeft" ? -1 : 1);
    }
  }
  return <section className={`project-section${first ? " project-section--first" : ""}`} id={project.id} aria-label={project.name}>
    <div className="carousel" role="group" aria-roledescription="carousel" aria-label={`${project.name} images`} onKeyDown={handleKey}>
      {slide.type === "video" ? <ProjectVideo key={slide.src} slide={slide} /> :
        <ProjectImage key={slide.src} slide={slide} eager={first} />}
      <button type="button" className="carousel-half carousel-half--previous" aria-label={`Previous image for ${project.name}`} aria-describedby={paginationId} onClick={() => move(-1)} />
      <button type="button" className="carousel-half carousel-half--next" aria-label={`Next image for ${project.name}`} aria-describedby={paginationId} onClick={() => move(1)} />
    </div>
    <div className="project-details">
      <p className="pagination" id={paginationId} aria-live="polite" aria-atomic="true">
        <span aria-hidden="true">{String(slideIndex + 1).padStart(2, "0")}/{String(project.slides.length).padStart(2, "0")}</span>
        <span className="sr-only">Image {slideIndex + 1} of {project.slides.length}</span>
      </p>
      <div className="project-description">
        <Link className="project-page-link" href={`/projects/${encodeURIComponent(project.slug || project.id)}`}>{project.name}</Link>
        {project.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      </div>
    </div>
  </section>;
}

function ProjectVideo({ slide }: { slide: VideoSlide }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    }, { threshold: 0.25 });
    observer.observe(video);
    return () => { observer.disconnect(); video.pause(); };
  }, []);
  return <>
    <video ref={ref} className="project-image project-video" src={slide.src} poster={slide.poster}
      aria-label={slide.alt} muted loop playsInline preload="none"
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
    <button className="video-toggle" type="button" aria-label={playing ? "Pause video" : "Play video"}
      onClick={() => {
        const video = ref.current;
        if (!video) return;
        if (video.paused) void video.play().catch(() => {});
        else video.pause();
      }}>{playing ? "Pause" : "Play"}</button>
  </>;
}
