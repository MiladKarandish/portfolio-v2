# Portfolio — Milad Karandish

Personal site and résumé. Next.js 15 (App Router), React 19, TypeScript, Tailwind v4.

## Running it

```bash
npm install
cp .env.example .env.local   # fill in RESEND_API_KEY to enable the contact form
npm run dev                  # http://localhost:3000
```

`npm run build` · `npm run lint` · `npx tsc --noEmit`

## Where things live

```
src/
  app/
    (portfolio)/        # the site: home, experience, projects, contact — shared header/footer
    resume/             # the A4 résumé sheet, printed to PDF from the browser
    _components/        # header, footer, nav, page header, scroll reveal
    opengraph-image.tsx # link preview, generated at build time
  data/                 # all copy lives here — see below
  common/               # generic components and hooks
  themes/               # colour palettes + the theme picker
  styles/               # theme variables, UI primitives, the résumé print sheet
```

## Content is data, not markup

Every piece of copy is in `src/data/`, and each fact is written down once:

- **`profile.tsx`** — name, contact details, availability, intro copy, stats. Everything else imports identity from here.
- **`resume.ts`** — the CV: summary, skill groups, and the work history (`resumeRoles`).
- **`experiences.ts`** — reads `resumeRoles` back out and adds site-only extras (company blurb, "current" flag), so the résumé and the experience page cannot disagree.
- **`skills.ts`** — the grouped view of `resumeSkills`, plus a short headline list.
- **`projects.ts`** — project write-ups; `featured: true` promotes one to the home page.
- **`honest.ts`** — the `/honest` page. Read the header comment before editing it; two categories of content are deliberately kept off that page for reasons that are not stylistic.

To update a job, edit it in `resume.ts` — both pages follow.

**[`docs/EDITING.md`](docs/EDITING.md) is the guide for changing anything on the
site**: a what-do-I-edit table, step-by-step recipes for adding a job, a project
or a page, the decisions that must not be reversed by accident, and the traps
that don't fail loudly.

## The résumé

`/resume` is laid out for A4 in `src/styles/custom.css`. Export it by printing the
page and choosing "Save as PDF" (A4, margins "Default", background graphics off).
The layout is deliberately single-column plain text so applicant tracking systems
parse it.

There is one tuning knob, commented in the print media query: the font size. The
content is sized to land on two pages; if it ever spills onto a third, drop that
value before cutting content.

There is intentionally no education section — see the note in `src/data/resume.ts`.

## Theming

`src/themes/index.tsx` holds the palettes. The picker writes the chosen one to
`localStorage` and sets CSS custom properties on `:root`; an inline script in the
root layout replays that choice before first paint, and `styles/themes.css` carries
the default palette so the server-rendered HTML is never colourless.

Adding a palette means adding one object to `src/themes/index.tsx` — the picker,
the inline script and every surface pick it up automatically.

## Contact form

A server action (`src/services/contact/actions/contact.ts`) that sends through
[Resend](https://resend.com), with validation, a honeypot field and errors that
send people to the direct email address when anything fails. Without
`RESEND_API_KEY` the form degrades to that message rather than pretending to send.

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | for the contact form | Resend API key |
| `CONTACT_FROM_EMAIL` | no | Sender address; only once a domain is verified in Resend |
| `NEXT_PUBLIC_SITE_URL` | no | Canonical origin for metadata, `sitemap.xml`, `robots.txt` |

`.env` is gitignored. It was previously committed — the key that was in it should
be treated as public and rotated.
