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
| The cobweb toy in the footer | `common/components/CobwebToy/` | See below. Size is `--cobweb-size` in `styles/custom.css` |
| Skipping stones on the water | `common/components/StoneToy/` | See below. There is nothing on the page until somebody throws one |
| The fish under the water | `common/components/FishToy/` | See below. Summoned by `ripples.ts`; it has no gesture of its own |
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

**Anything on the page can disturb the water** through `ripples.ts`, a two
function pub/sub next to the component. Call `ripple({ x, y, radius, strength })`
in viewport pixels and the surface picks it up; with no water mounted it is a
loop over an empty set. That indirection is the point — the water is absent for
reduced-motion visitors and for anyone without float render targets, so a caller
that held a reference to the surface would be holding a reference to nothing
most of the time. The footer basketball is the only caller today.

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

### Tune the fish

Something living under the water. Nothing is on screen until the surface is
disturbed; then a few shapes rise out of the dark, swim over to look, and sink
back down when nothing else happens (`common/components/FishToy/`). Two files:

| File | What it is |
| --- | --- |
| `index.tsx` | **Policy.** Whether it runs, what colour it is, what it listens to |
| `_components/School.ts` | The fish: simulation and renderer, on a viewport-sized canvas |

**It has no element of its own to press.** It listens to `ripples.ts`, which is
most of the design: the basketball hitting the water, every touch of a skipping
stone, and a hard pluck of the cobweb all summon fish without one line of any of
those files knowing this one exists. Add a fourth thing that publishes a ripple
and the fish come to that too, for free.

**It also takes a plain press on the open water,** through `visit`. That one is
not on the broadcast — the water handles its own cursor work directly and is
left alone — and it is there for discoverability, which is the whole problem
this toy had:

> All three things on the broadcast have to be *found* first. The ball reaching
> the water is about one shot in seven and needs the hoop discovered; the pluck
> needs the web found and dragged hard; the stone needs a flick gesture in a
> margin with nothing in it. The first version left presses out to keep fish
> rare, and it kept them rare by keeping them invisible.

Clicking the margin is the one thing a visitor tries unprompted, because it
visibly dents. What stops fish becoming a cursor effect is `COOLDOWN`, not the
absence of a way to call them.

⚠️ **Pointer *movement* still must not summon them,** and the water's own
movement handling must stay off the broadcast. That is continuous, and fish that
followed the cursor around would be a cursor effect rather than something living
under the page.

Because a press counts, this is **the only thing besides the water itself that a
phone gets** — the margin is narrow there so it is a fiddly tap rather than a
feature, but it works.

⚠️ **The cooldown is a timestamp, not a counter.** The obvious version counts
seconds-since-empty in the step loop — but the loop is *asleep* for exactly the
period being measured, so the count freezes the moment the last fish leaves and
never reaches the cooldown. The first school is then the only one the page ever
gets, and it fails silently.

⚠️ **The fish are `--bg-950` lifted toward white, and that is load-bearing.**
`WaterBackground` builds the entire surface out of `--bg-950` *darkened* — 0.44
for deep, 0.68 for mid. Drawing the fish in the same variable at full strength,
which the first version did, leaves the gap between fish and water entirely at
the mercy of how bright that one variable happens to be in a given theme. In
`earthy` it is `rgb(30, 24, 8)`, so the water came out around `rgb(20, 16, 5)`
and so did the fish. Measured as a luminance difference out of 255:

| theme | before | after |
| --- | --- | --- |
| fox | 12.8 | 44.1 |
| death | 7.5 | 47.9 |
| whale | 6.8 | 48.4 |
| earthy | **2.9** | 51.2 |
| dusk | 14.3 | 43.0 |
| green | 7.4 | 48.0 |

Lifting puts the fish on the opposite side of the water from where the water was
made, so the contrast is fixed by construction and survives a theme nobody has
written yet. `dusk` is the proof it was needed: its ramp is inverted —
`--bg-950` is *lighter* than `--bg-700` — so anything assuming 950 means dark is
already wrong there.

⚠️ **`EDGE_MARGIN` has to be bigger than a fish's turning circle.** At
`MAX_SPEED` over `TURN_RATE` that circle has a radius of about 73px. The first
attempt set the margin to 70 and made things *worse* — a fish that starts
turning one turning-radius from the edge still leaves, just along a longer arc,
and the worst excursion went from 165px to 246px. At 150 with a hard clamp
underneath as a backstop, time spent entirely off the window went from 8.1% to
0.0%, and time in open water from 83.8% to 96.2%.

This was the "fish disappear" bug: nothing was removing them — the school count
was always exactly what was summoned — they were simply swimming out of the
window and being counted as present while nobody could see them.

⚠️ **`LINGER` has to outlast the swim.** A fish gives up `LINGER` seconds after
the last disturbance. If the furthest, slowest fish cannot cross `SPAWN_FAR` in
that time, schools turn round and leave without ever arriving — which looks
exactly like nothing happened. At the shipped numbers the swim is 0.6–3s against
a 4.5s `LINGER`.

**They cannot chase a stone,** and are not meant to. A skipping stone crosses
the water at about 900px/s; nothing that looks like a fish moves at 900px/s.
What happens instead is that repeated disturbances *re-aim* one school rather
than summoning several, so a stone with eleven touches sends one group off
toward wherever it ended, arriving about when the ripples settle.

Layering is **DOM order, not z-index** — water, fish, stone, card, all mounted
in that order in `(portfolio)/layout.tsx` and all at `z-index: -1` except the
card. The fish are under the surface, the stone is on it, the page is above
both. Reordering those three lines in the layout reorders the water.

#### The knobs

| Knob | What it does |
| --- | --- |
| `NOTICE` | The weakest disturbance worth surfacing for. Below a single stone touch (0.06–0.13) on purpose. A press bypasses it — see `visit` |
| `COOLDOWN` | How long after a school leaves before another may come |
| `LINGER` | How long they keep swimming after the last disturbance. See the warning above |
| `SPAWN_NEAR` / `SPAWN_FAR` | How far out in the dark they start |
| `MIN_SPEED` / `MAX_SPEED` / `TURN_RATE` | How they swim. `TURN_RATE` is low enough that they arc rather than pivot |
| `ORBIT_RADIUS` | Inside this they stop aiming at the disturbance and start circling it |
| `MIN_FISH` / `MAX_FISH` | School size, 4–7 |
| `EDGE_MARGIN` / `EDGE_PUSH` | How far out they start turning back, and how hard. See the warning above |
| `LIFT` in `index.tsx` | How far the fish colour is lifted from the water's own. See the warning above |
| `FISH_ALPHA` | How much they show. The first pass was faint enough that they read as commas |

Costs 0.006ms a frame with a school up, and nothing at all otherwise — the
animation frame is cancelled, and like the stone the viewport-sized canvas is
not allocated until the first summon.

**Who never sees it:** anyone with `prefers-reduced-motion: reduce`, and anyone
whose GPU will not give the water float render targets — without the water there
is no surface to be under. There is deliberately **no `pointer: coarse` guard**,
unlike the toys: nothing publishes ripples on touch today so there is nothing to
come up for, but the day the hoop learns to be tapped this should start working
on its own rather than needing to be remembered.

### Tune the skipping stones

Flick the open water beside the card and a stone goes out across it, touching
down at intervals and sinking when it runs out of pace
(`common/components/StoneToy/`). Two files:

| File | What it is |
| --- | --- |
| `index.tsx` | **Policy.** Whether it runs, what colour it is, what counts as a throw, where the best run lives |
| `_components/Stone.ts` | The stone: simulation and renderer, on a viewport-sized canvas |

Each touch is a real dent in the WebGL surface, through `ripples.ts` — the same
channel the basketball's splash and the cobweb's pluck use. There is **nothing
on the page between throws**: no element to see, and the animation frame is
cancelled outright rather than throttled.

⚠️ **The geometry is the pond reading, not the falling one.** The page is two
things at once and always has been: the basketball *falls* off the footer, so
the screen is a vertical plane, while the water spreads ripples in circles, so
the same screen is a pond seen from above. A stone needs the pond, so there is
no gravity here and no arc — it travels in a straight line and loses pace, and
what makes it a skip rather than a slide is that it only touches every so
often. Adding gravity as well puts every stone in the bottom-left of the window.

⚠️ **Text selection is decided in the stylesheet, by surface — not in JS.**
`body:has(> .stone-skip)` is `user-select: none` and `.page-card` inside it is
`user-select: text`. The open water is a playing field and does not select;
the card is a page and does. The two footer canvases are `none` for the same
reason.

The `:has` is what scopes it: the toy renders nothing for reduced motion, for
coarse pointers, or without float render targets, and on those visits selection
is untouched — as it is on `/resume` and the 404, which have no stone. A browser
with no `:has` support ignores the rule and loses only the tidiness.

An earlier version did this dynamically, suppressing selection while the pointer
happened to be moving faster than a throw. It worked and it was the wrong shape:
whether something can be selected should depend on what you are pointing at, not
on how fast your hand was going. **The consequence, deliberately:** you can no
longer start a selection out in the margin and drag onto the text to grab a
paragraph. Start the selection on the text instead.

Nothing here ever calls `preventDefault`, and nothing touches the document's
classes: a press that turns out not to be a throw has to stay a completely
ordinary press.

It is drawn at the water's own `z-index: -1` and **mounted immediately after
it**, so it paints above the surface and below the page card. That ordering is
the effect — a stone that skips past the margin carries on *behind* the card,
which is translucent, and reads as something moving under frosted glass.

The count is anchored where the throw started, not where the stone ended: the
stone has usually gone under the card or off the window by then, and a number
that appears where nobody is looking is a number nobody reads.

#### The knobs

| Knob | What it does |
| --- | --- |
| `MIN_SPEED` | The slowest flick that counts as a throw at all |
| `MAX_SPEED` | Caps a wrist-flick, which can carry ten times what an arm can |
| `SKIP_LOSS` / `AIR_DRAG` | Pace lost per touch and per second. Together these set how many skips a throw is worth |
| `SINK_SPEED` | When the stone gives up |
| `HOP_TIME` | Seconds between touches. Constant, so the gaps *on screen* shorten as it slows — that is the rhythm the eye counts |
| `TOUCH_*` / `SINK_*` | How big a dent each touch and the final sink make |

For reference, at the shipped numbers: an ordinary flick is about 8 skips over
480px, a hard one 10 over 920px, and the hardest possible 11. A gentle push is
refused outright.

**Who never sees it:** anyone with `prefers-reduced-motion: reduce`, any coarse
pointer — the margin is a couple of dozen pixels wide on a phone and there is
nothing to aim at — and anyone whose GPU will not give the water float render
targets, because a stone skipping across a static gradient dents nothing and
reads as a bug.

⚠️ **It needs a margin to be thrown from.** That margin is 384px a side at
1920px wide, but only 144px at 1440 and 64px at 1280. It is a wide-desktop
bonus, not a feature everyone gets.

### Tune the footer cobweb

A quarter of an orb web strung across the bottom-left corner of the page, with a
spider walking about on it (`common/components/CobwebToy/`). It is the second
toy in the footer; the hoop is at the other end of the same row. Three files:

| File | What it is |
| --- | --- |
| `index.tsx` | **Policy.** Whether it runs, what colour it is, when it is allowed to be awake |
| `_components/Cobweb.ts` | The web, the spider and the renderer, inside a square canvas |
| `_components/verlet.ts` | The physics: particles, distance and angle constraints, one integration step |

Modelled on [this pen](https://codepen.io/Maxel88/pen/WNwVYjv), which uses
`verlet-js`. `verlet.ts` is a rewrite of the handful of primitives it needed
rather than the library.

**It is not silent, and cannot be.** The hoop draws nothing until you touch it;
a spider that only moves while you drag it is not a spider. The restraint is
somewhere else instead: **the loop only runs while the canvas is on screen and
the tab is in front**, via an `IntersectionObserver` and `visibilitychange`. The
footer is the last thing on every page, so most of a visit costs nothing.
If you move this toy somewhere that is visible on load, that trade changes.

**It cannot steal a click.** A pointerdown is only captured if it lands within
`GRAB_RADIUS` of a strand that can actually move; everything else falls through.

#### Three things that were not obvious

⚠️ **`angleAt` must be the cross/dot form, not a difference of two `atan2`s.**
They look equivalent. The difference form is unbounded — a stored angle and a
measured one can disagree by a full turn — and it carries the *opposite sign*,
which turns `Angle` from a constraint that restores a joint into one that drives
it away. The spider tears itself into a scribble within a second, and it reads
as "the legs need tuning" rather than as a sign error.

⚠️ **A leg reaches for a *place*, then takes the nearest strand to it** — not
for a strand directly. Eleven spokes converging on one corner put most of the
web's particles in a small area near the hub, so a spider choosing evenly among
strands is always being offered the corner: it walks into it in a few seconds
and stays there for good. Sampling a point and snapping to it makes the gait
independent of how the web is drawn.

⚠️ **The step window scales the leg's *design* reach, not its current length.**
Measure the leg as it stands and the two feed each other — a folded leg reaches
short, which folds it further — and the spider becomes a knot.

#### The knobs

| Knob | What it does |
| --- | --- |
| `--cobweb-size` in `custom.css` | The whole toy. The web is a quarter circle, so the box is square and everything else derives from it at runtime |
| `SPOKES` / `RINGS` | How finely the web is drawn, and so how many footholds the spider gets to choose between |
| `SPIDER_SCALE` | Spider size. Larger than about 0.4 and it spans half the web and reads as a knot in it |
| `SPIDER_GRAVITY` | Not about falling — eight grips hold it either way. It sets how much of the web the walk covers |
| `SILK_WEIGHT` | The web's inverse mass. It cancels between strands and only matters where a foot meets one, so it is really "how hard may the spider tug the web" |
| `BRUSH_RADIUS` | The cursor as a solid disc. Merely passing over parts the silk; this is how wide |
| `SHAKE_REACH` / `SHAKE_KICK` | How far a disturbance elsewhere on the page carries, and how hard it lands |
| `SHAKE_FLOOR` | The weakest disturbance worth feeling. Raise it and the splash's droplets stop registering; lower it and they start |
| `STARTLE_TIME` | How long the spider holds still after feeling something |

Below about 110px the spider has fewer strands within reach than it has legs and
the gait goes stiff. Keep the box no taller than the hoop's 132px canvas unless
you mean to: the two share a row and the taller one sets the footer's height.

#### It feels the basketball, without knowing about it

The two toys are connected, but not to each other. Both talk to `ripples.ts`,
the same broadcast the water listens to:

* **In.** A ball going over the edge of the court pours three disturbances into
  the water. The cobweb subscribes to the same channel, and anything over
  `SHAKE_FLOOR` at the far end of the footer rocks the card enough that the web
  shivers — about 14px on a full-width card, 20px on a narrow one, against a web
  132px across — and the spider **stops dead** for `STARTLE_TIME`. A spider that
  feels its web move and carries on strolling is the one thing a real one never
  does.

  The kick is phased by distance along the direction it came from, so the near
  side of the web moves before the far side. That is what makes it read as
  something arriving rather than as the web being shoved: the eye picks up a
  travelling wave and does not register a uniform translation at all. The first
  version was half this strong and unphased, and went unnoticed — which for a
  detail like this is the same as not existing.
* **Out.** Letting go of a strand mid-sweep publishes a ripple back, so a hard
  pluck dents the water under that corner of the page.

⚠️ **Neither toy imports the other, and it must stay that way.** Either can be
deleted without touching the other, and the cobweb works with no water mounted
at all — with nothing subscribed, `ripple()` is a loop over an empty set.

The floor is what keeps this from being a rattle: the splash pours three big
disturbances *and* one per droplet as they land, and at `SHAKE_FLOOR` only the
first two arrive. It reads as a thud and its echo.

A ripple that starts inside the web's own box is **ignored** — it can only be
this file's own pluck coming back round, because `ripples.ts` is a broadcast and
does not tell a listener who published.

#### Why the ball cannot land in the web

It is the obvious idea and it does not work, so it is written down here to save
the next person the trip. The fastest shot the slingshot can produce is
`MAX_PULL * LAUNCH_K` = 720 px/s, which at `GRAVITY` = 1100 gives a maximum
range on the flat of **471px**. The gap between the two canvases on a
full-width card is **780px**. The ball cannot get halfway, and closing that gap
means raising `LAUNCH_K` — which is derived from the hoop's own geometry, not
chosen, so raising it unbalances the game the toy is actually for.

**Who never sees it:** the same people who never see the hoop — anyone with
`prefers-reduced-motion: reduce`, and any coarse pointer.

### Tune the footer hoop

A slingshot, a ball and a rim in the bottom-right of the footer
(`common/components/HoopToy/`). Four files:

| File | What it is |
| --- | --- |
| `index.tsx` | **Policy.** Whether it runs, what colour it is, where the best streak lives |
| `_components/Hoop.ts` | The court: simulation and renderer, inside a 240px canvas |
| `_components/Splash.ts` | The ball after it leaves the court, on a viewport-sized canvas |
| `_components/ball.ts` | What both agree on — size, gravity, drag, and how a ball is painted |

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

#### The ball can go in the water

The court's **right-hand edge is open**. A ball that gets past the hoop with pace
on it goes over the edge, arcs off the side of the page and lands in the water
the whole site is sitting on — a real displacement in the WebGL surface, not a
drawing of one. `Hoop` hands it to `Splash` at the boundary and waits; `Splash`
runs it out, disturbs the water through `ripples.ts`, sinks it, and calls
`respawn()` for a fresh ball. It is about one shot in seven, and it sits on both
sides of the shots that go in: a little too flat or a little too strong.

⚠️ **The negative `margin-right` on `.hoop-toy` is load-bearing.** It pulls the
court out through the card's own padding so its open edge lands exactly on the
edge of the page. Without it the ball has to cross a strip of padding before
there is any water under it, falling the whole way — and there are only about
sixty pixels of window below the footer once the page is scrolled to the bottom,
so the splash happens below the fold and is never seen. It mirrors `px-3 xs:px-9`
on `.page-card` and has to move if that does.

⚠️ **`ESCAPE_SPEED` is about staying on screen, not difficulty.** Horizontal
speed decides how far the ball falls before it is clear of the page. At 130px/s
that is about thirty pixels; at 50px/s it is two hundred and the ball drops out
of the window. A ball with pace goes over the edge, a ball merely dribbling into
it stops there. The first version asked for 300px/s — a hard flat shot fired
under the rim and nothing else — and the best thing the toy does went unseen.

**A make that rolls off afterwards keeps its make.** Taking the streak away for
it would turn the funniest outcome into the most annoying one.

Everything the splash draws in the water is **clipped to outside the card**, so
ripples slide behind the page instead of spreading across the footer. The ball
*in the air* is not clipped — it is a thrown object crossing in front of the
page. Sizes are tuned against the ball, not the page: an early pass drew a 180px
ring for an 18px ball and read as a shockwave with opinions about the layout.

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
