export interface IProjects {
  title: string;
  techs: string[];
  github: string;
  demo: string;
  hilights: {
    what: string;
    how: string;
    why: string;
  }[];
}

export const projects: IProjects[] = [
  {
    title: "Image Cutter",
    techs: ["JavaScript (OOP)", "HTML", "CSS", "HTML Canvas"],
    github: "https://github.com/MiladKarandish/image-cutter",
    demo: "https://mil-image-cutter.vercel.app",
    hilights: [
      {
        what: "Created an image cropping tool",
        how: "with vanilla JavaScript and HTML Canvas,",
        why: "to enable precise image manipulation with draggable selectors and pixel-level adjustments.",
      },
      {
        what: "Implemented image processing logic",
        how: "by calculating pixel coordinates and scaling ratios,",
        why: "to maintain image integrity during cropping and resizing.",
      },
    ],
  },
];
