export const projectImages = [
  "/assets/finished/01.jpg",
  "/assets/finished/02.jpg",
  "/assets/finished/03.jpg",
  "/assets/finished/04.jpg",
  "/assets/finished/05.jpg",
  "/assets/finished/06.jpg",
];

export const projectGalleryExtras = [
  ["/assets/project1.jpg", "/assets/project2.jpg"],
  ["/assets/project2.jpg", "/assets/project4.jpg"],
  ["/assets/project3.jpg", "/assets/project5.jpg"],
  ["/assets/project4.jpg", "/assets/project16.jpg"],
  ["/assets/project5.jpg", "/assets/project1.jpg"],
  ["/assets/project16.jpg", "/assets/project3.jpg"],
];

export function mapProjects(meta = []) {
  return projectImages.map((src, idx) => ({
    id: idx + 1,
    src,
    title: meta[idx]?.title || "Project",
    location: meta[idx]?.location || "Tbilisi, Georgia",
    type: meta[idx]?.type || "Interior",
    gallery: [src, ...(projectGalleryExtras[idx] || [])],
  }));
}
