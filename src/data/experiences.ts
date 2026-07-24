import { IResumeRole, resumeRoles } from "./resume";

/**
 * The work history is written once, in `resume.ts`. This file adds the bits the
 * site needs and the CV does not — a company blurb, an engagement type, a
 * "current" flag — and joins them by company name.
 *
 * Adding a role to the CV and forgetting to add it here is the failure this
 * shape exists to prevent: an unmatched company still renders, just without the
 * extra colour.
 */

export interface IExperience extends IResumeRole {
  /** Employment shape — "Full-time", "Co-owned product", … */
  type: string;
  /** One or two sentences about the company itself, for a reader abroad. */
  about?: string;
  current: boolean;
}

interface ICompanyMeta {
  type: string;
  about?: string;
  current?: boolean;
}

const companyMeta: Record<string, ICompanyMeta> = {
  Tamdid: {
    type: "Co-owned product",
    about:
      "A two-person venture. My co-founder runs the business; I am the entire engineering team — every line, every deploy, every incident.",
    current: true,
  },
  Ragham: {
    type: "Full-time",
    about:
      "A startup building accounting software for small businesses on web and Android. The product handles debts, credits, invoicing and bookkeeping for more than 10,000 people a day.",
    current: true,
  },
  "Pishgaman Asia": {
    type: "Full-time",
    about:
      "An established software company in logistics and fleet management. Its flagship platform, Separta, is the exclusive ground-transport service for Imam Khomeini International Airport in Tehran — an Uber-shaped product with a single, very demanding customer.",
  },
  "Fortune Web Works": {
    type: "Freelance partnership",
    about:
      "Where I started. A two-person freelance outfit: my partner found the clients, I built everything they asked for.",
  },
};

export const experiences: IExperience[] = resumeRoles.map((role) => {
  const meta = companyMeta[role.company] ?? { type: "" };

  return {
    ...role,
    type: meta.type,
    about: meta.about,
    current: meta.current ?? false,
  };
});
