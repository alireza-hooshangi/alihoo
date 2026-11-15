// Replace placeholder copy and slide lists here without changing the layout.
export type ImageSlide = { type?: "image"; src: string; alt: string };
export type VideoSlide = { type: "video"; src: string; alt: string; poster?: string };
export type Slide = ImageSlide | VideoSlide;
export type Project = {
  id: string;
  name: string;
  cover?: ImageSlide;
  slides: readonly [Slide, ...Slide[]];
  paragraphs: readonly string[];
};

export const bio = [
  "Independent projects, experiments, and product concepts explored outside client work, created as an ongoing place to explore, test, and refine ideas.",
  "Creative Director at Hooman Studio, working across brand, interface, and systems.",
] as const;

export const contact = {
  studio: "https://hooman.com",
  email: "hello@alihoo.me",
};

const images: readonly [ImageSlide, ...ImageSlide[]] = [
  { src: "/images/oratio.png", alt: "ORATIO packaging concept, a monochrome sculptural box" },
  { src: "/images/phone.png", alt: "Keep Updated interface displayed on a phone" },
  { src: "/images/floral.png", alt: "A floral relief on a circular cream-colored disc" },
  { src: "/images/red-mark.png", alt: "A white three-pointed brand mark on a red background" },
  { src: "/images/blocks.png", alt: "Colorful geometric blocks arranged into a square" },
];

// Figma's loader order differs from the order of sections on the Projects page.
export const loaderSlides = [images[0], images[2], images[4], images[3], images[1]];
export const motion = { loaderFrameMs: 100, loaderRepeatMs: 5000 };

export const projects: Project[] = images.map((image, index) => ({
  id: `project-${index + 1}`,
  name: `Project ${String(index + 1).padStart(2, "0")}`,
  cover: image,
  // Temporary shared images, beginning with each section's actual Figma image.
  slides: [image, ...images.slice(index + 1), ...images.slice(0, index)],
  paragraphs: bio,
}));

export type BioLink = { _key: string; label: string; caption?: string; href: string; newTab?: boolean };
export const bioLinks: BioLink[] = [
  { _key: "studio", label: "Hooman Studio", caption: "Real Work", href: contact.studio, newTab: true },
  { _key: "email", label: "Email", caption: "Say hello", href: `mailto:${contact.email}`, newTab: false },
];
