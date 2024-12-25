import { FaGithub, FaLinkedinIn, FaPhoneAlt } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";

export interface IContactLinks {
  title: string;
  href: string;
  icon: React.ReactNode;
}

export const contactLinks: IContactLinks[] = [
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
