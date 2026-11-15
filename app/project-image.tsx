"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import localPreviews from "./image-previews.json";
import type { ImageSlide } from "./content";

const pixelSteps = [8, 16, 32, 48, 96];
const stepMs = 100;
// Survives slide unmounts and client-side navigation; resets on a full reload.
const revealedImages = new Set<string>();

export default function ProjectImage({ slide, eager }: { slide: ImageSlide; eager: boolean }) {
  const preview = slide.preview || localPreviews[slide.src as keyof typeof localPreviews];
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!loaded || !image || !canvas) return;
    const context = canvas.getContext("2d");
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setTimeout> | undefined;
    let started = false;
    const finish = () => {
      clearTimeout(timer);
      revealedImages.add(slide.src);
      image.style.opacity = "1";
      canvas.style.visibility = "hidden";
    };
    if (revealedImages.has(slide.src)) {
      finish();
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;
      observer.disconnect();
      if (revealedImages.has(slide.src)) { finish(); return; }
      if (!context || preference.matches) { finish(); return; }
      let step = 0;
      const draw = () => {
        if (step === pixelSteps.length) { finish(); return; }
        const columns = pixelSteps[step++];
        canvas.width = columns;
        canvas.height = Math.max(1, Math.round(columns * 4 / 5));
        // Crop identically to object-fit: cover in the fixed 5:4 frame.
        const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
        const width = image.naturalWidth * scale;
        const height = image.naturalHeight * scale;
        context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
        canvas.style.visibility = "visible";
        timer = setTimeout(draw, stepMs);
      };
      draw();
    }, { threshold: 0.01 });
    const onPreferenceChange = () => { if (preference.matches) finish(); };
    preference.addEventListener("change", onPreferenceChange);
    observer.observe(image);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      preference.removeEventListener("change", onPreferenceChange);
    };
  }, [loaded, slide.src]);

  return <>
    {preview && <Image src={preview} alt="" aria-hidden="true" fill unoptimized
      className="project-image pixel-preview" />}
    <Image ref={imageRef} src={slide.src} alt={slide.alt} fill
      sizes="(min-width: 1100px) 60vw, 100vw" loading={eager ? "eager" : "lazy"}
      className="project-image pixel-reveal-image" onLoad={(event) => {
        if (revealedImages.has(slide.src)) event.currentTarget.style.opacity = "1";
        setLoaded(true);
      }}
      onError={() => { if (imageRef.current) imageRef.current.style.opacity = "1"; }} />
    <canvas ref={canvasRef} className="project-image pixel-reveal-canvas" aria-hidden="true" />
  </>;
}
