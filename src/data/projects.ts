export interface IProjects {
  title: string;
  techs: string[];
  github: string;
  demo: string;
  hilights: string[];
}

export const projects: IProjects[] = [
  {
    title: "Image Cutter",
    techs: ["JavaScript (OOP)", "HTML", "CSS", "HTML Canvas"],
    github: "https://github.com/MiladKarandish/image-cutter",
    demo: "https://mil-image-cutter.vercel.app",
    hilights: [
      "Created a lightweight image cropping tool, similar to cropper.js, using pure object-oriented JavaScript, HTML, and CSS, with a focus on the HTML Canvas API.",
      "Engineered the entire application from scratch, including the image manipulation logic and the cropping selector using HTML Canvas.",
      "This project served as an opportunity to explore new challenges outside of daily work, greatly enhancing technical and problem-solving skills.",
    ],
  },
];
