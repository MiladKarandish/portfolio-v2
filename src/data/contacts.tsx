import { FaGithub, FaLinkedinIn, FaPhoneAlt, FaTelegramPlane } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";

export interface IContactLinks {
  name: string;
  title: string;
  href: string;
  icon: React.ReactNode;
  aria: string;
}

export const contactLinks: IContactLinks[] = [
  {
    name: "Email",
    title: "miladkaarandish@gmail.com",
    href: "mailto:miladkaarandish@gmail.com",
    aria: "Send an email",
    icon: <MdEmail />,
  },
  {
    name: "Phone",
    title: "+98 936 682 0123",
    href: "tel:+989366820123",
    aria: "Call phone number",
    icon: <FaPhoneAlt />,
  },
  {
    name: "Location",
    title: "Shiraz, Iran",
    href: "https://maps.app.goo.gl/dWDfQpdb9SjYH2QJ9",
    aria: "See My Location",
    icon: <FaLocationDot />,
  },
  {
    name: "LinkedIn",
    title: "linkedin.com/in/milad-karandish",
    href: "https://www.linkedin.com/in/milad-karandish",
    aria: "Open LinkedIn profile",
    icon: <FaLinkedinIn />,
  },
  {
    name: "Github",
    title: "github.com/MiladKarandish",
    href: "https://github.com/MiladKarandish",
    aria: "Open GitHub profile",
    icon: <FaGithub />,
  },
  {
    name: "Telegram",
    title: "Telegram",
    href: "https://t.me/miladkarandish",
    aria: "Open Telegram",
    icon: <FaTelegramPlane />,
  },
];
