# Editing this site

Everything you are likely to change is text, and all of it lives in `src/data/`.
You should almost never need to open a `page.tsx` to update the site.

---

## The one rule

**Each fact is written down once.** The pages read from the data files; the data
files read from each other in one direction only:

```
profile.tsx  ── identity: name, email, phone, links, location
     │
     └──> resume.ts  ── the CV: summary, skills, work history
              │
              ├──> experiences.ts  ── /experience  (adds company blurbs)
              └──> skills.ts       ── skill groups
```

Arrows only point downward. `resume.ts` never imports from `experiences.ts`.
If you find yourself typing the same sentence into two files, stop — one of them
should be importing it from the other.

This is why the site was stale before: the résumé and the experience page held
separate copies of the work history, and only one of them got updated.

---

## I want to…

| Change | File | Notes |
| --- | --- | --- |
| Email, phone, LinkedIn, GitHub, city | `data/profile.tsx` → `person` | Everything follows, including the CV and the OG image |
| Home page headline / intro paragraphs | `data/profile.tsx` → `intro` | |
| The four stat boxes | `data/profile.tsx` → `stats` | |
| "What I'm good at" cards | `data/profile.tsx` → `focusAreas` | |
| Relocation / sponsorship wording | `data/profile.tsx` → `availability` | Appears on the home page and the CV |
| Add or edit a job | `data/resume.ts` → `resumeRoles` **and** `data/experiences.ts` → `companyMeta` | See recipe below |
| CV summary paragraph | `data/resume.ts` → `profile.summary` | |
| Skills | `data/resume.ts` → `resumeSkills` | `/experience`'s skill list follows automatically |
| The chip list on the home page | `data/skills.ts` → `headlineSkills` | Hand-ordered on purpose, not alphabetical |
| Add a project | `data/projects.ts` | `featured: true` also puts it on the home page |
| The `/honest` page | `data/honest.ts` | **Read that file's header comment first** |
| Show or hide the Tamdid venture | `data/visibility.ts` → `showTamdid` | One boolean, then rebuild. See below |
| Colours | `themes/index.tsx` | Add one object; the picker and the anti-flash script pick it up |
| Résumé is spilling onto a third page | `styles/custom.css`, the `THE ONE KNOB` comment | Currently `10.6pt`, roughly one bullet of headroom |
| Email, phone, portfolio, LinkedIn or GitHub on the CV | `data/profile.tsx` → `person` | Two rows of three in the header — keep it at three per row |

---

## Recipes

### Add a job

Two files, in this order.

1. **`data/resume.ts` → `resumeRoles`** — add it at the top (reverse
   chronological). Fill in every field of `IResumeRole`. `context` is the
   one-liner explaining what the company is, because nobody abroad has heard of
   it. Bullets lead with the outcome, then the method.
2. **`data/experiences.ts` → `companyMeta`** — add an entry **keyed by the exact
   company name string** you used in step 1, with `type`, an optional `about`
   blurb, and `current: true` if you still work there.

⚠️ The join is by name string. Misspell it and nothing breaks loudly — the role
still renders on `/experience`, just without the blurb and the "Current" badge.
If a new job appears but looks plain, that's this.

`current: true` also puts the role in the "Right now" section of the home page.

### Add a project

One entry in `data/projects.ts`. Use an `id` that is unique and URL-safe.

- `availability` is a badge for things with nothing to link to — `"Private source"`,
  `"Internal tool"`. Leave it out if you have a real link.
- `highlights` may be empty (`[]`); the list just won't render.
- `featured: true` promotes it to the three cards on the home page. Keep that to
  three — a fourth makes the grid ragged.

### Edit the honest page

`data/honest.ts`, sections in display order. Adding one renumbers the rail
automatically. The `id` is a real anchor — `/honest#ai` is a valid link to paste
into a cover letter.

Before editing, read the header comment in that file. It records three
constraints with reasons, and they are not stylistic preferences.

### Show or hide the Tamdid venture

`data/visibility.ts`, one boolean:

```ts
export const showTamdid = false;   // hidden
export const showTamdid = true;    // shown
```

Rebuild and it is done. Currently **hidden**.

It hides more than the name, on purpose. The venture was also the subject of
sentences that never named it — "co-founder and sole engineer of a fintech
product", "1 fintech product built solo", "I built an entire fintech product
in evenings and weekends". Anyone with a reason to recognise it would
recognise it from those, so removing only the project card and the CV entry
would protect nothing while still costing the CV its best material.

`false` therefore removes it from: the projects list and the home-page cards
(Separta is promoted to keep three), the CV work history, `/experience`, the
CV summary, the home page intro, the stats row, the "end-to-end ownership"
card, two passages on `/honest`, and the page descriptions and OG metadata.

Both versions of every affected sentence sit side by side in the data files,
so turning it back on restores the original wording rather than something
rewritten later from memory. `grep -rn showTamdid src/` finds all of them.

**The one maintenance cost:** if you edit a sentence that has a counterpart,
check whether the counterpart needs the same edit. Nothing enforces this, and
it is the only way the two versions can drift apart.

Turning it back on was verified to reproduce the pre-switch site exactly — the
visible text of every page, and the résumé PDF, byte-for-byte. To re-check
that after editing, build the old commit in a worktree and diff the rendered
text rather than the source:

```bash
git worktree add /tmp/before <commit-before-your-edits>
ln -s "$PWD/node_modules" /tmp/before/node_modules
# build and `next start` each on its own port, then for each page:
#   curl -s localhost:PORT/path | strip tags | diff
```

Ignore `<lastmod>` in `sitemap.xml`: it is `new Date()` at build time and
differs between any two builds.

To verify a change, build and grep the rendered pages rather than trusting the
source:

```bash
npm run build && npx next start -p 3131
for p in / /experience /projects /honest /resume; do
  echo "$p -> $(curl -s localhost:3131$p | grep -o -iE 'tamdid|fintech|co-found' | sort -u | tr '\n' ' ')"
done
```

Note that with Tamdid hidden the résumé is about one and a half pages, so page
two ends early. That is content volume, not a layout bug — don't reach for the
font-size knob to fill it.

### Add a new page

1. `src/app/(portfolio)/<name>/page.tsx` — export `metadata` and start with
   `<PageHeader />`, like the others.
2. Add it to `routes` in `_components/Navbar.tsx`.
3. Decide about `sitemap.ts` — see "indexing" below.

**Nav width budget:** five items is the maximum at the current sizing. A sixth
will fit on a laptop but will scroll on a phone. If you add one, shorten a label
rather than shrinking the padding again.

---

## Rules that exist for a reason

Each of these was a deliberate decision. Reverse them on purpose, not by accident.

**No Education section.** Not an oversight. The reasoning is written out in
`data/resume.ts`; short version: a heading with nothing credible under it points
at the gap, while its absence lets the work answer the question.

**`/honest` is not indexed.** It sets `robots: { index: false }` in its own
`metadata` **and** is deliberately absent from `sitemap.ts`. Those two go
together — re-adding it to the sitemap while it carries `noindex` sends mixed
signals and achieves nothing. It's meant to be found by someone already on the
site, not by someone searching your name.

**Nothing political on `/honest`, ever.** The site carries a real name, a phone
number and a city, and it is read from inside Iran as well as outside. The
relocation section says what you are moving toward and stops there.

**The page never congratulates itself.** No "the page most portfolios leave
out", no framing that awards points for candour before saying anything. It
exists so nobody overestimates you and is disappointed later; that's a plain
motive that needs no dressing up.

**The résumé is single-column plain text.** It looks less designed than it could
because applicant tracking systems have to parse it. Don't add columns, icons or
a photo.

---

## Traps

**`"use server"` files can only export functions.** Every export in such a module
becomes a server reference. This is why `IContactFormState` and
`initialContactState` live in `services/contact/types.ts` instead of next to the
action — putting them in the action file builds fine and then crashes at runtime
with `Cannot read properties of undefined`.

**`<Reveal>` inside a list needs `as="li"`.** A `<div>` between `<ul>` and `<li>`
is invalid HTML. Same for `<ol>`.

**Adding a colour palette needs no other changes.** `themes/index.tsx` is read by
the picker *and* serialised into the inline script in `app/layout.tsx` that sets
the colours before first paint. Don't hardcode a palette anywhere else, or the
page will flash the wrong colours on load.

**Printing the résumé:** A4, margins "Default", **background graphics off**. The
`@page` rule owns the margins; the browser's own margin setting fights it.

**`.env` is gitignored now, but it was committed once.** The Resend key that was
in it should be treated as public until rotated.

---

## Before you deploy

```bash
npx tsc --noEmit    # types
npm run lint        # eslint
npm run build       # must reach "Generating static pages (12/12)"
```

Every page is statically prerendered. If `build` starts reporting a route as
dynamic (`ƒ` instead of `○`), something started reading request state at render
time — find it, because it costs the page its caching.

Then check the résumé PDF — see below. It is the one thing the type-checker
cannot verify, and it is the file most likely to be read by a human who decides
something about your life.

---

## Checking the résumé PDF

Don't guess at the print layout. Render it exactly as a browser would:

```bash
npm run dev                                    # in one terminal
google-chrome-stable --headless=new --no-pdf-header-footer \
  --print-to-pdf=/tmp/resume.pdf http://localhost:3000/resume
```

Then open `/tmp/resume.pdf` and check four things:

1. **It is two pages.** Not one and a bit, not three.
2. **Neither page has a hole in it.** A large gap in the *middle* of the document
   is a page-break bug, not a content problem — a role that couldn't fit in the
   space left and jumped whole to the next page. Trailing space at the end of
   page two is normal.
3. **No heading is stranded** at the foot of a page with its bullets overleaf.
4. **The header is two tidy rows of three.** A contact field sitting alone on a
   row of its own means something got longer and pushed it over. This has
   regressed twice; it is the first thing to look at.

Don't judge any of this from `pdftotext` — it re-wraps lines and will tell you
the header is fine when it isn't. Render the page to an image and look:

```bash
pdftoppm -png -r 90 /tmp/resume.pdf /tmp/page   # → /tmp/page-1.png, /tmp/page-2.png
```

If it spills to three pages, turn the knob in `styles/custom.css` (search
`THE ONE KNOB`) down one step at a time before cutting any content.

Printing it by hand from the browser: **A4, margins "Default", background
graphics off.** The `@page` rule owns the margins and the browser's own margin
setting fights it.
