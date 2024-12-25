export interface IExperiences {
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

export const experiences: IExperiences[] = [
  {
    title: "Front End Developer",
    at: {
      name: "Ragham",
      title: "Accounting Application",
      type: "Startup",
      description:
        "Ragham is a startup specializing in accounting software for Android and Web. The app helps small businesses manage debts, credits, and financial records efficiently, serving over 10000 active users.",
      href: "https://www.linkedin.com/company/ragham",
    },
    date: "Dec 2023, Present",
    hilights: [
      {
        what: "Maintained and fixed issues",
        how: "in a Vue.js/Nuxt.js legacy application",
        why: "to ensure functionality for 10000 active users, resolving critical issues impacting performance.",
      },
      {
        what: "Migrated to a new application version",
        how: "with Next.js, TypeScript, and Tailwind CSS,",
        why: "replacing an outdated Nuxt.js codebase to improve performance, scalability, and maintainability for over 10000 active users.",
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
        what: "Developed and maintained real-time, map-based logistics applications",
        how: "using React.js, TypeScript, React-Leaflet, and WebSocket integration",
        why: "to deliver accurate real-time data visualization and enhance user experience for diverse user groups.",
      },
      {
        what: "Refined application responsiveness",
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
        what: "Broadened a logistics service into a public-facing application",
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
        what: "Established foundational web development skills",
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
