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
| Water background: calmer, livelier, or off | `common/components/WaterBackground/` | See below. The amplitudes are all in `index.tsx` |
| How much water shows through the page card | `styles/custom.css`, `--card-opacity` | `1` restores the old opaque card |
| The basketball toy in the footer | `common/components/HoopToy/` | See below. Size is `--hoop-width` in `styles/custom.css` |
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

### Tune the water background

The background is a real height-field water simulation on the GPU
(`common/components/WaterBackground/`). Three files:

| File | What it is |
| --- | --- |
| `index.tsx` | **Policy.** When a drop happens and how strong. Everything you would want to tune is a named constant at the top |
| `_components/WaterSurface.ts` | The renderer. Loop, resources, and the `DEFAULTS` block of look/perf settings |
| `_components/shaders.ts` | The GLSL. Four small programs, each commented with what it is for |

**The pointer only disturbs the water outside the page card.** The margins are
live; the content area is still. This is on purpose and it is instead of a
"disable effects" button: anyone who finds the motion distracting is trying to
read, and their cursor is already over the thing they are reading, so the escape
is somewhere they will find without being told. It also stops the effect
competing with text while someone is using the page.

Waves already in flight still travel under the card — that is the simulation,
and stopping it at the edge would look like a bug. What stops is the *carving*.
The gate is `CONTENT_SELECTOR` in `index.tsx`, matched with `closest()` so the
card's rounded corners are handled exactly.

There are two ways the water gets disturbed, and they are deliberately
different:

- **Moving the pointer** carves a *stroke* — one continuous capsule from where
  the pointer was to where it is, pressed **downward**, because something moving
  through water displaces it. `TRAIL_DEPTH`, `TRAIL_RADIUS`.
- **Clicking** makes a *drop*, a peak, because that is something falling in.
  `CLICK_STRENGTH`, `CLICK_RADIUS`. Same for the ambient pulse.

The stroke replaced an earlier version that stamped a row of separate drops
along the path. Don't go back to that: every drop is a point source radiating
its own rings, so a moving cursor produced a train of overlapping bullseyes.
That is what "noisy" looks like here, and no amount of tuning the amplitude
fixes it — it is the wrong primitive.

⚠️ The amplitudes are more sensitive than they look. Refraction, the specular
glint and the caustics all scale off the *slope* of the surface, so doubling a
strength does considerably more than double to the picture. The first version
was about 3.5x higher and read as neon tubing. Move them ~25% at a time.

⚠️ A smooth stroke needs **more** amplitude than sharp rings to feel equally
present — it has no hard features to catch the eye. Matching the old trail's
surface slope exactly still looked like nothing was happening.

**To turn ambient drops off** (the pulse every 9–19 seconds, so the water only
ever moves when the visitor does), delete the `scheduleAmbient()` call.

**To turn the whole thing off**, remove `<WaterBackground />` from
`app/(portfolio)/layout.tsx` and set `--card-opacity: 1` in `styles/custom.css`.
The CSS gradient on `body` in `globals.css` is a complete standalone background
— it is already what a visitor sees without WebGL.

**It is deliberately not on `/resume`**, which is a print sheet.

**Who never sees it:** anyone with `prefers-reduced-motion: reduce`, and any
browser without WebGL2 or float render targets. Both get the CSS gradient. If
you change that gradient, change the water palette to match — the canvas fades
in over the top of it and the handover should not be visible.

### Tune the footer hoop

A slingshot, a ball and a rim in the bottom-right of the footer
(`common/components/HoopToy/`). `index.tsx` decides whether it runs and what
colour it is; `_components/Hoop.ts` is the whole simulation and renderer.

**It is silent until touched.** Parked, it draws no frames at all — the
animation frame is cancelled, not throttled. A visitor who never touches it pays
for one canvas and two idle listeners.

**It cannot steal a click.** A pointerdown is only captured if it lands within
`GRAB_RADIUS` of the ball; everything else falls through to the footer links.
If you move the toy, keep that property.

⚠️ **`LAUNCH_K` is derived, not chosen.** On the default 240px arena the
cheapest shot that reaches the rim centre is 526 px/s at 55°, and the fastest
shot available is `MAX_PULL * LAUNCH_K`. The first value shipped was 11, giving
a maximum of 528 — so the only possible score was a pixel-perfect pull at one
exact angle, and the toy could not be won. At 15 the maximum is 720, a make sits
near three-quarters pull, and there is room either side to be wrong.
**If you change `--hoop-width`, re-derive it** rather than eyeballing it.

⚠️ **The ball launches from its parking spot, never from where it was dragged
to.** The parking spot is on the floor, so the natural pull — down and back —
points out of the arena; releasing from there puts the ball under the floor and
the floor collision inverts the shot on the first step. That bug killed every
single shot. `PULL_VISUAL` is how far the ball leans into the pull instead.

The aim preview runs the *same* integrator at the *same* `STEP` as the
simulation. Euler integration at a coarser step lands somewhere else, and a
preview that disagrees with the shot is worse than no preview at all.

**Who never sees it:** anyone with `prefers-reduced-motion: reduce`, and any
coarse pointer. It is skipped on touch because the only way to give it a drag
gesture there is to take one away from the page scroll — making it work on touch
is real work, not a flag flip.

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

**Don't run `npm run build` while `npm run dev` is running.** They share
`.next/`, and the production build overwrites the dev server's manifests
underneath it. The dev server does not notice and does not recover: every route
starts returning `Internal Server Error`, which looks exactly like you broke a
page. Stop dev first, or accept that you will have to restart it. If it happens,
`pkill -f "next dev"`, `rm -rf .next`, and start dev again — in that order,
because deleting `.next` under a running dev server is its own crash.

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
