import { contactLinks } from "@/data/contacts";

function getAccentBgClass(id: string) {
  switch (id) {
    case "Github":
      return "bg-neutral-900";
    case "Email":
      return "bg-orange-500";
    case "Phone":
      return "bg-emerald-500";
    case "LinkedIn":
      return "bg-sky-600";
    case "Telegram":
      return "bg-cyan-500";
    default:
      return "bg-gray-500";
  }
}

const ContactPage = () => {
  return (
    <main>
      <h1 className={`mb-4 text-4xl`}>Contact Me</h1>

      {/* Outer glass card */}
      <section className="max-w-4xl w-full rounded-2xl bg-white/8 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden">
        <div className="md:flex">
          {/* Left column: avatar + subtle pattern */}
          <div className="md:w-1/3 flex items-center justify-center p-10 bg-gradient-to-b ">
            <div className="w-40 h-40 rounded-full bg-200/30 flex items-center justify-center shadow-inner">
              {/* simple svg avatar; replace with an <img /> if you have one */}
              <svg viewBox="0 0 128 128" className="w-28 h-28" aria-hidden="true">
                <defs>
                  <linearGradient id="g1" x1="0" x2="1">
                    <stop offset="0" stopColor="var(--text-100)" />
                    <stop offset="1" stopColor="var(--bg-500)" />
                  </linearGradient>
                </defs>
                <circle cx="64" cy="40" r="24" fill="url(#g1)" />
                <path d="M28 100c8-20 44-20 72 0v6H28v-6z" fill="var(--text-100)" opacity="0.9" />
                <rect x="40" y="34" width="48" height="6" rx="3" fill="var(--text-100)" />
                <rect x="36" y="46" width="56" height="8" rx="4" fill="var(--text-100)" />
              </svg>
            </div>
          </div>

          {/* Right column: title + list */}
          <div className="md:w-2/3 p-10">
            <div className="space-y-4">
              {contactLinks.map(({ name, icon, title, href, aria }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={aria}
                  className={`group flex items-center gap-6 rounded-xl p-4 md:p-5 shadow-sm
                    transition transform hover:translate-y-[-3px] hover:shadow-xl
                    bg-white/8 border border-white/6`}
                >
                  <div
                    className={`flex items-center justify-center min-w-[56px] h-14 rounded-lg
                      ${getAccentBgClass(name)} text-white text-xl`}
                    aria-hidden="true"
                  >
                    {icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg md:text-xl font-semibold">{name}</span>
                    </div>
                    <div className="text-sm md:text-base mt-1">{title}</div>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition ml-2 text-sm">↗</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ContactPage;
