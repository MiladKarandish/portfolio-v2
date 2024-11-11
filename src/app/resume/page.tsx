import { FaGithub, FaLinkedinIn, FaPhoneAlt } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";

interface IContactLinks {
  title: string;
  href: string;
  icon: React.ReactNode;
}
const contactLinks: IContactLinks[] = [
  {
    title: "miladkaarandish@gmail.com",
    href: "mailto:miladkaarandish@gmail.com",
    icon: <MdEmail />,
  },
  {
    title: "+98 936 682 0123",
    href: "tel:+989366820123",
    icon: <FaPhoneAlt />,
  },
  {
    title: "Shiraz, Iran",
    href: "https://maps.app.goo.gl/dWDfQpdb9SjYH2QJ9",
    icon: <FaLocationDot />,
  },
  {
    title: "linkedin.com/in/milad-karandish",
    href: "https://www.linkedin.com/in/milad-karandish",
    icon: <FaLinkedinIn />,
  },
  {
    title: "github.com/MiladKarandish",
    href: "https://github.com/MiladKarandish",
    icon: <FaGithub />,
  },
];

const skills = [
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Vue.js",
  "Nuxt.js",
  "RESTful API",
  "Tailwind CSS",
  "Axios",
  "Sass",
  "Websocket",
  "Git",
  "UX/UI, SEO and best practices",
];

interface IExperiences {
  title: string;
  at: {
    name: string;
    type: string;
    title?: string;
    description: string;
    href: string;
  };
  date: string;
  hilights: {
    what: string;
    how: string;
    why: string;
  }[];
}
const experiences: IExperiences[] = [
  {
    title: "Front End Developer",
    at: {
      name: "Ragham",
      title: "Accounting Application",
      type: "Startup",
      description:
        "Ragham is a startup specializing in accounting software for Android and Web. The app helps small businesses manage debts, credits, and financial records efficiently, serving over 1000 active users.",
      href: "https://www.linkedin.com/company/ragham",
    },
    date: "Dec 2023, Present",
    hilights: [
      {
        what: "Maintained and fixed issues",
        how: "in a Vue.js/Nuxt.js legacy application",
        why: "to ensure functionality for 1000 active users, resolving critical issues impacting performance.",
      },
      {
        what: "Migrated to a new application version",
        how: "with Next.js, TypeScript, and Tailwind CSS,",
        why: "replacing an outdated Nuxt.js codebase to improve performance, scalability, and maintainability for over 1000 active users.",
      },
      {
        what: "Optimized data loading speeds",
        how: "by implementing pagination, leveraging React’s lazy loading and state management,",
        why: "reducing startup delays on large datasets.",
      },
      // {
      //   what: "Improved DOM rendering performance",
      //   how: "by integrating virtualization with React",
      //   why: "for handling long data lists, eliminating lag and enhancing smoothness.",
      // },
      // {
      //   what: "Optimized server requests",
      //   how: "with debouncing and aborting techniques via JavaScript and Axios,",
      //   why: "reducing unnecessary traffic and improving response times.",
      // },
      {
        what: "Enhanced app performance and reduced server load",
        how: "By implementing request optimization techniques like debouncing and aborting, and improving rendering efficiency using React virtualization",
        why: "To eliminate lag, reduce unnecessary traffic, and ensure smooth handling of large data sets.",
      },
    ],
  },
  {
    title: "Front End Developer",
    at: {
      name: "Pishgamanasia",
      title: "Integrated Software Solutions",
      type: "Established Enterprise",
      description:
        "Pishgamanasia is a prominent software development company specializing in logistics and fleet management solutions. The company offers a variety of web-based applications, including a public-facing transportation service similar to Uber, with features tailored to different user groups.",
      href: "http://www.pishgamanasia.com",
    },
    date: "Oct 2022, Nov 2023 . 1 yr 2 mos",
    hilights: [
      {
        what: "Built and maintained real-time, map-based logistics applications",
        how: "using React.js, TypeScript, React-Leaflet, and WebSocket integration",
        why: "to deliver accurate real-time data visualization and enhance user experience for diverse user groups.",
      },
      {
        what: "Improved application responsiveness",
        how: "by designing with SCSS and employing responsive design principles for compatibility across various devices, including specialized ticketing systems",
        why: "to ensure consistent performance and user-friendly experiences on different display sizes.",
      },
      {
        what: "Enhanced API interactions and minimized re-renders",
        how: "through collaboration with backend teams, optimizing REST API structures, and leveraging React.js optimization techniques",
        why: "to boost app efficiency and ensure seamless user interaction during heavy data processing.",
      },
      {
        what: "Modernized legacy applications",
        how: "by maintaining and upgrading older web apps built with HTML, CSS, and jQuery, incorporating React.js and SCSS for better maintainability and performance",
        why: "to keep the applications functional and up-to-date with modern web standards.",
      },
      {
        what: "Expanded a logistics service into a public-facing application",
        how: "by developing features such as trip reservations, vehicle type selection, and custom user options with React, TypeScript, and SCSS",
        why: "to extend service reach and provide specialized options for different user groups, similar to ride-sharing platforms.",
      },
    ],
  },
  {
    title: "Front End Developer",
    at: {
      name: "Fortune Web Works",
      type: "Freelance Partnership",
      description:
        "Fortune Web Works was a freelance partnership where I began my journey in web development. Working closely with a partner who handled project acquisition and management, I gained hands-on experience and foundational knowledge in various web technologies.",
      href: "https://fortune-new.vercel.app",
    },
    date: "May 2020, Oct 2022 . 2 yr 6 mos",
    hilights: [
      {
        what: "Built foundational web development skills",
        how: "by working with HTML, CSS, JavaScript, and basic frameworks",
        why: "to establish a strong base in front-end development.",
      },
      {
        what: "Collaborated on diverse projects",
        how: "in a freelance partnership focused on best practices",
        why: "to gain hands-on experience and adapt to varied client needs.",
      },
      {
        what: "Expanded knowledge and skills",
        how: "through continuous learning and practical application",
        why: "to become proficient in modern web technologies.",
      },
    ],
  },
];

interface IProjects {
  title: string;
  techs: string[];
  github: string;
  demo: string;
  hilights: string[];
}
const projects: IProjects[] = [
  {
    title: "Image Cutter",
    techs: ["JavaScript (OOP)", "HTML", "CSS", "HTML Canvas"],
    github: "",
    demo: "https://mil-image-cutter.vercel.app",
    hilights: [
      "Developed a lightweight image cropping tool, similar to cropper.js, using pure object-oriented JavaScript, HTML, and CSS, with a focus on the HTML Canvas API.",
      "Built the entire application from scratch, including the image manipulation logic and the cropping selector using HTML Canvas.",
      "This project served as an opportunity to explore new challenges outside of daily work, greatly enhancing technical and problem-solving skills.",
    ],
  },
];

const Resume = () => {
  return (
    <div
      className={`resume-container max-w-full max-h-full flex flex-col gap-8 p-8 bg-white text-black text-2xl overflow-auto`}
    >
      {/* Header */}
      <header className={`w-full flex flex-col justify-center items-start gap-2`}>
        <h1 className={`text-3xl font-bold`}>Milad Karandish</h1>
        <p className={`text-2xl font-medium text-gray-700`}>Front-End Developer</p>

        {/* Contact Information */}
        <ul className={`flex flex-wrap gap-x-4`}>
          {contactLinks.map((contact) => (
            <li key={contact.title}>
              <a href={contact.href} className={`flex justify-start items-center gap-2`}>
                {contact.icon} {contact.title}
              </a>
            </li>
          ))}
        </ul>
      </header>

      {/* Summary */}
      <section>
        <p>
          Front-End Developer with 3+ years of experience specializing in React, TypeScript, and performance
          optimization. Skilled in building scalable web applications and improving user experiences. Focused on
          delivering high-quality, user-centric solutions.
        </p>
      </section>

      {/* Skills */}
      <section>
        <h2>Skills</h2>
        <ul className={`flex flex-wrap justify-start items-center gap-2`}>
          {skills.map((skill, i) => (
            <li key={skill} className={`flex gap-2`}>
              <span>{skill}</span>
              {i !== skills.length - 1 && <span>|</span>}
            </li>
          ))}
        </ul>
      </section>

      {/* Experience */}
      <section>
        <h2>Work Experience</h2>

        <ul className={`space-y-4`}>
          {experiences.map((experience) => (
            <li key={experience.at.href}>
              <div className={`flex justify-between items-center`}>
                <h3>{experience.title}</h3>
                <p className={`text-xl`}>{experience.date}</p>
              </div>
              <p className={`mb-1 text-xl font-medium`}>
                <a href={experience.at.href} className={`font-bold underline underline-offset-4`}>
                  {experience.at.name}
                </a>
                ({experience.at.type}){experience.at.title ? ": " + experience.at.title : ""}
              </p>

              <ul className={`text-xl list-disc list-inside`}>
                {experience.hilights.map((hilight) => (
                  <li key={hilight.what} className={`mb-[2px] font-medium`}>
                    <span className={`font-bold`}>{hilight.what}</span> {hilight.how} {hilight.why}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      {/* Experience */}
      <section>
        <h2>Projects</h2>

        <ul className={`space-y-4`}>
          {projects.map((project) => (
            <li key={project.demo}>
              <div className={`flex justify-between items-center`}>
                <h3>{project.title}</h3>
                <a href={project.github} target="_blank" className={`ms-auto text-xl underline underline-offset-4`}>
                  Github
                </a>
                <a href={project.demo} target="_blank" className={`ms-4 text-xl underline underline-offset-4`}>
                  Demo
                </a>
              </div>

              <ul className={`flex flex-wrap justify-start items-center gap-2 text-xl font-medium`}>
                {project.techs.map((skill, i) => (
                  <li key={i * 2} className={`flex gap-2`}>
                    <span>{skill}</span>
                    {i !== project.techs.length - 1 && <span>|</span>}
                  </li>
                ))}
              </ul>

              <ul className={`text-xl list-disc list-inside`}>
                {project.hilights.map((hilight, i) => (
                  <li key={i} className={`mb-[2px] font-medium`}>
                    {hilight}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Resume;
