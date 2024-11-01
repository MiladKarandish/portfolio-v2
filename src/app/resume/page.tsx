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
  "Sass",
  "Websocket",
  "Git",
  "UX/UI, SEO and best practices",
];

interface IExperiences {
  title: string;
  at: {
    name: string;
    title: string;
    type: string;
    description: string;
    href: string;
  };
  date: string;
  hilights: {
    title: string;
    description?: string;
    hilights?: { title: string; description: string }[];
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
        "Ragham is a startup specializing in accounting software for Android and Web. The app helps small businesses manage debts, credits, and financial records efficiently, serving over 10,000 active users.",
      href: "https://www.linkedin.com/company/ragham",
    },
    date: "Dec 2023, Present",
    hilights: [
      {
        title: "Legacy Application Maintenance and Issue Resolution",
        description:
          "Provided ongoing maintenance and addressed critical issues in the legacy application built with Vue.js and Nuxt.js, ensuring continuous functionality.",
      },
      {
        title: "Developed New Application Version with Enhanced Performance Using Next.js and TypeScript",
        description:
          "Initiated and structured a new version of the application using Next.js and TypeScript, significantly improving efficiency and performance.",
      },
      {
        title: "Introduced and Applied Modern Web Development Practices",
        description:
          "Introduced modern web development practices and collaborated closely with the backend team to ensure API suitability for web applications.",
      },
      {
        title: "Comprehensive Performance Optimization and Issue Resolution",
        description:
          "Identified and addressed key issues in the old application, leading to a more robust and efficient new version.",
        hilights: [
          {
            title: "Pagination Implementation",
            description: "Solved slow startup issues by implementing pagination, leading to faster load times.",
          },
          {
            title: "Virtualization Technique",
            description:
              "Addressed laggy DOM rendering caused by long data lists by using virtualization, resulting in smoother performance.",
          },
          {
            title: "Backend Processing",
            description:
              "Moved search, filter, and sort functionalities to the backend to enhance performance and compatibility with pagination.",
          },
          {
            title: "Request Optimization",
            description:
              "Employed debouncing and aborting techniques to optimize server requests, reducing load and improving response times.",
          },
        ],
      },
      {
        title: "Enhanced Web Usability and Aesthetics Through Design Improvements",
        description:
          "Redesigned several aspects of the application to be more suitable for web use, enhancing overall usability and aesthetics.",
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
        title: "Collaborative Development in a Cross-Functional Team",
        description:
          "Worked closely with a team of 4 front-end developers, as well as backend developers, DevOps, and QA testers, using React, TypeScript, and SCSS (Sass) to deliver a robust logistics and fleet management application. Provided guidance to junior developers while learning from senior team members to improve overall code quality and project efficiency.",
      },
      {
        title: "Front-End Development for a Real-Time Map-Based Application",
        description:
          "Developed and maintained a web application similar to Uber, primarily using React.js, TypeScript, and React-Leaflet for map integration. Implemented WebSocket communication for live vehicle location updates, ensuring seamless and accurate real-time data display for users.",
      },
      {
        title: "Responsive Design for Uncommon Display Sizes",
        description:
          "Ensured the application was fully responsive across a wide range of devices, including specialized ticketing systems with uncommon display sizes. Utilized SCSS for efficient and scalable styling, providing a consistent and user-friendly experience across all devices.",
      },
      {
        title: "Optimization and Performance Improvements",
        description:
          "Worked closely with backend developers to optimize API structures and data handling, enhancing overall application performance and responsiveness. Implemented performance improvements in React.js and TypeScript, focusing on minimizing re-renders and improving user experience during heavy data operations.",
      },
      {
        title: "Maintenance of Legacy Applications",
        description:
          "Contributed to the maintenance and enhancement of legacy web applications built with HTML, CSS, and jQuery, ensuring continued functionality and user satisfaction. Applied modern web development techniques using React and SCSS to improve the performance and maintainability of these older applications.",
      },
      {
        title: "Expansion of Service",
        description:
          "Played a key role in evolving the application from an airport-specific service to a public-facing platform, similar to Uber, with features like trip reservations, dedicated vehicle types, and specialized options for different user groups, leveraging React, TypeScript, and SCSS for front-end development.",
      },
    ],
  },
  {
    title: "Front End Developer",
    at: {
      name: "Fortune Web Works",
      title: "Freelance Partnership",
      type: "Freelance Partnership",
      description:
        "Fortune Web Works was a freelance partnership where I began my journey in web development. Working closely with a partner who handled project acquisition and management, I gained hands-on experience and foundational knowledge in various web technologies.",
      href: "https://fortune-new.vercel.app",
    },
    date: "May 2020, Oct 2022 . 2 yr 6 mos",
    hilights: [
      {
        title: "Foundational Web Development Experience",
        description:
          "Gained initial experience in web development, learning and applying core technologies such as HTML, CSS, JavaScript, and basic front-end frameworks. Developed a strong understanding of web design principles and responsive design.",
      },
      {
        title: "Collaborative Project Work",
        description:
          "Worked closely with a partner who managed project acquisition and client interactions. Collaborated on various freelance projects, focusing on front-end development and applying best practices in code quality and project management.",
      },
      {
        title: "Skill Development and Learning",
        description:
          "Acquired a broad range of skills in web development through practical, hands-on work. Gained proficiency in essential front-end technologies and learned to adapt to different project requirements and client needs.",
      },
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
          With over 3 years of front-end development experience, I specialize in turning complex problems into
          intuitive, user-friendly web applications. My toolkit includes React, TypeScript, and SCSS, but what really
          drives me is the challenge of optimizing performance and enhancing user experience. Whether I’m breathing new
          life into legacy systems or creating dynamic, real-time features, I’m all about delivering solutions that are
          both innovative and practical. I thrive on collaboration and continuous learning, always looking for ways to
          push the boundaries of what’s possible in web development.
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
            <li key={experience.at.title}>
              <div className={`flex justify-between items-center`}>
                <h3>{experience.title}</h3>
                <p className={`text-xl`}>{experience.date}</p>
              </div>
              <p className={`text-xl font-medium`}>{experience.at.name}</p>

              <ul className={`text-xl list-disc list-inside`}>
                {experience.hilights.map((hilight) => (
                  <li key={hilight.title} className={`mb-[2px] font-medium`}>
                    {hilight.title}
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
