import { experiences } from "@/data/experiences";

const Experience = () => {
  return (
    <main className={``}>
      <h1 className={`mb-4 text-4xl`}>Experiecnes</h1>

      <ul className={`space-y-4`}>
        {experiences.map((experience) => (
          <li key={experience.at.href} className={`bg-800 rounded-lg p-4`}>
            <div className={`flex justify-between items-center mb-2`}>
              <h3>{experience.title}</h3>
              <p className={`text-xl`}>{experience.date}</p>
            </div>
            <p className={`mb-2 text-xl font-medium`}>
              <a href={experience.at.href} className={`font-bold underline underline-offset-4`}>
                {experience.at.name}
              </a>
              ({experience.at.type}){experience.at.title ? ": " + experience.at.title : ""}
            </p>

            <ul className={`text-xl list-disc list-inside`}>
              {experience.hilights.map((hilight) => (
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

export default Experience;
