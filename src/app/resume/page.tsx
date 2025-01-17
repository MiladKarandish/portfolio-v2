import { contactLinks } from "@/data/contacts";
import { experiences } from "@/data/experiences";
import { projects } from "@/data/projects";
import { skills } from "@/data/skills";

const Resume = () => {
  return (
    <div
      className={`resume-container max-w-full max-h-full flex flex-col gap-7 p-2 bg-white text-black overflow-auto font-medium`}
    >
      {/* Header */}
      <header className={`w-full flex flex-col justify-center items-start gap-2`}>
        <h1 className={`text-4xl font-bold`}>Milad Karandish</h1>
        <p className={`text-2xl text-gray-700`}>Front-End Developer</p>

        {/* Contact Information */}
        <ul className={`flex flex-wrap gap-x-4 text-2xl`}>
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
      <section className={`summary`}>
        <p>
          Front-End Developer with over 3 years of experience in React, TypeScript, and performance optimization,
          focused on building high-performance, scalable web applications that improve user engagement and meet business
          objectives. Skilled in responsive design, real-time data visualization, and cross-functional collaboration,
          with a strong track record of enhancing application speed, accessibility, and user satisfaction through
          efficient, user-centered solutions.
        </p>
      </section>

      {/* Skills */}
      <section className={`skills`}>
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
      <section className={`experience`}>
        <h2>Work Experience</h2>

        <ul className={`space-y-4`}>
          {experiences.map((experience) => (
            <li key={experience.at.href}>
              <div className={`flex justify-between items-center`}>
                <h3 className={`mb-1`}>{experience.title}</h3>
                <p className={``}>{experience.date}</p>
              </div>
              <p className={`at-title mb-1`}>
                <a href={experience.at.href} className={`underline underline-offset-4`}>
                  {experience.at.name}
                </a>
                ({experience.at.type}){experience.at.title ? ": " + experience.at.title : ""}
              </p>
              <p className={`at-description`}>{experience.at?.description}</p>

              <ul className={` list-disc list-inside`}>
                {experience.hilights.map((hilight) => (
                  <li key={hilight.what} className={`mb-[2px]`}>
                    <span className={`font-bold`}>{hilight.what}</span> {hilight.how} {hilight.why}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      {/* Projects */}
      <section className={`projects`}>
        <h2>Projects</h2>

        <ul className={`space-y-4`}>
          {projects.map((project) => (
            <li key={project.demo}>
              <div className={`flex justify-between items-center`}>
                <h3 className={`mb-1`}>{project.title}</h3>
                <a href={project.github} target="_blank" className={`ms-auto underline underline-offset-4`}>
                  Github
                </a>
                <a href={project.demo} target="_blank" className={`ms-4  underline underline-offset-4`}>
                  Demo
                </a>
              </div>

              <ul className={`flex flex-wrap justify-start items-center gap-2 `}>
                {project.techs.map((skill, i) => (
                  <li key={i * 2} className={`flex gap-2`}>
                    <span className={`font-semibold`}>{skill}</span>
                    {i !== project.techs.length - 1 && <span>|</span>}
                  </li>
                ))}
              </ul>

              <ul className={` list-disc list-inside`}>
                {project.hilights.map((hilight, i) => (
                  <li key={i} className={`mb-[2px]`}>
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
