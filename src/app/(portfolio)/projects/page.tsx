import { projects } from "@/data/projects";

const ProjectsPage = () => {
  return (
    <main>
      <h1 className={`mb-4 text-4xl`}>Projects</h1>

      <ul className={`space-y-4`}>
        {projects.map((project) => (
          <li key={project.demo} className={`bg-800 rounded-lg p-4`}>
            <div className={`flex justify-between items-center`}>
              <h3>{project.title}</h3>
              <a href={project.github} target="_blank" className={`ms-auto underline underline-offset-4`}>
                Github
              </a>
              <a href={project.demo} target="_blank" className={`ms-4 underline underline-offset-4`}>
                Demo
              </a>
            </div>

            <ul className={`flex flex-wrap justify-start items-center gap-2 text-base font-medium`}>
              {project.techs.map((skill, i) => (
                <li key={i * 2} className={`flex gap-2`}>
                  <span>{skill}</span>
                  {i !== project.techs.length - 1 && <span>|</span>}
                </li>
              ))}
            </ul>

            <ul className={`text-base list-disc list-inside`}>
              {project.hilights.map((hilight) => (
                <li key={hilight.what} className={`mb-1 font-medium`}>
                  <span className={`font-bold`}>{hilight.what}</span> {hilight.how} {hilight.why}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default ProjectsPage;
