/**
 * Copy for /honest.
 *
 * The point of this page is that it costs something to publish — it only works
 * if it stays specific. Vague self-deprecation ("I'm a perfectionist") reads as
 * a humblebrag and does the opposite of what it's for. Every item here names a
 * real cost and, where there is one, the concrete thing that offsets it.
 *
 * The page must also never congratulate itself for existing. It is here because
 * being overestimated and then disappointing someone is a worse outcome than
 * being read accurately from the start — that is a plain motive and it needs no
 * framing. Any wording implying "most people wouldn't be brave enough to write
 * this" is doing the opposite of what the page is for and should be cut.
 *
 * Two things are deliberately NOT on this page, and should stay off it:
 *   - Any political statement, or criticism of a country, its rules or its
 *     people. This site carries a real name, a phone number and a city, and it
 *     is read from inside Iran as well as outside. The relocation section says
 *     what he is moving toward and stops there.
 *   - Any claim of being behind, running out of time, or being too old. It is
 *     not true at 25 with six years shipped, and stated on a public page it
 *     reads as desperation to exactly the people being asked to sponsor a visa.
 */

import { showTamdid } from "./visibility";

export interface IHonestSection {
  id: string;
  title: string;
  body: string[];
}

export const honestIntro = {
  /* No eyebrow. Anything that framed this as the brave page nobody else writes
     was taking credit for the page before saying anything in it. */
  title: "Honestly",
  lead: "The rest of this site is a pitch, and pitches make people expect more than is actually there. I'd rather be read accurately than generously. The outcome I want least is someone hiring the version of me they pictured from the other pages.",
};

export const honestSections: IHonestSection[] = [
  {
    id: "ai",
    title: "I use AI agents, heavily and deliberately",
    body: [
      showTamdid
        ? "I work with AI agents every day, and I used them heavily on Tamdid. I'd rather say so outright than let you assume otherwise."
        : "I work with AI agents every day, and I've used them heavily on work that is in production right now. I'd rather say so outright than let you assume otherwise.",
      "It isn't a machine writing the product while I watch. I build the base myself — the data model, the boundaries, the conventions the rest of the code has to obey — then use agents to move quickly on top of it. Given a codebase with a clear shape they extend it well. Given an empty repository and a loose goal they produce something that looks finished and isn't.",
      "The direction is mine, and so are the decisions I'd have to defend: the architecture, the invariants, the trade-offs. Agents give me ideas too, and I'll say so. But an agent will cheerfully write a balance update outside its transaction boundary and hand you something that reads perfectly well in review — knowing where to look is the part that doesn't transfer.",
      "I'd also argue that not using them is the expensive choice now. I work at a startup; there is no version of it with a hundred engineers, and speed and correctness matter far more than whether I typed each line personally. What doesn't change either way is that I read what ships, I can explain it, and I'm accountable for it in production.",
    ],
  },
  {
    id: "confidence",
    title: "Careful, not confident",
    body: [
      "I don't think I'm the smartest engineer in the room, and I tend to assume I'm not. That isn't modesty for the benefit of this page — it's how I actually experience it.",
      "In practice it looks like this: I check things twice. I don't ship code I can't explain. I'd rather ask a question that makes me look slow than guess and be wrong in production. On financial systems that instinct has been worth more than confidence would have been.",
      "The cost is real, and you should know about it before an interview rather than during one: I undersell myself. I'll describe what I built more cautiously than someone who built less. So if you want to know whether I can do something, the shipped work is a better source than how sure I sound about it.",
      /* The hidden variant has to carry the same weight from the Ragham work
         alone, since the venture was the original evidence. */
      showTamdid
        ? "The one thing I'll claim without hedging is that I work hard. I built an entire fintech product — schema, payment engine, PWA, signed Android release — in evenings and weekends around a full-time job, over twelve months. I don't offer that as a personality trait. It's just the plainest evidence I have."
        : "The one thing I'll claim without hedging is that I work hard. I rebuilt a product serving 10,000 people a day on a new framework — feature by feature, running beside the old app until it could replace it, with no downtime and no pause on features — while also building the reporting service and the internal tooling around it. I don't offer that as a personality trait. It's just the plainest evidence I have.",
    ],
  },
  {
    id: "english",
    title: "My English is functional, not polished",
    body: [
      "I can hold a conversation, think through a problem out loud, and get to know people. My grammar is not good. Writing takes me longer than it should, and I make mistakes I can hear afterwards but not before.",
      "Technical English is my strongest part. I've read documentation, issues, specs and code in English every working day for six years.",
      "Since this is the honest page: this text has been edited. My unedited writing is rougher than what you're reading. On a call you get the unedited version — so treat this as fair warning rather than a bait and switch.",
      "It's the thing I'm actively working on, and it's the part of relocating I expect to improve fastest, because it will have to.",
    ],
  },
  {
    id: "people",
    title: "Quiet, not difficult",
    body: [
      "I'm not the loudest person on a team. I do my best thinking in writing and my best talking one to one. Large rooms and fast social settings tire me out.",
      "Inside work I'm fine with friction: code review, someone telling me my design is wrong, a tense incident call, a stakeholder who wants a different answer than the one the data gives. That's the job, and I can keep it separate from how I feel about the person on the other side of it.",
      "Outside that structure I'm less good at it. People who are genuinely hostile or manipulative wear me down, and I don't handle them well. I don't believe it has ever affected my work — but it's true, so it belongs on this page.",
    ],
  },
  {
    id: "relocation",
    title: "Why I'm relocating",
    body: [
      "I want to build my life somewhere I fit: in a room with the team I work with, in a place I chose, where what happens next is decided by the work I do.",
      "I've put a lot on hold to make that possible, and I'm not going to pretend it has been comfortable. It does mean I'm serious about it. A sponsored offer isn't a nice-to-have in my case — it is the entire plan, and I'll treat it that way.",
    ],
  },
  {
    id: "maths",
    title: "The arithmetic, since you'll check it anyway",
    body: [
      "I'm 25. I have six years of production experience and no degree — I started working at nineteen because university wasn't available to me.",
      "I spent a long time reading that as being behind. Written out, it isn't: it's six years of shipped software at an age where the other path would have produced roughly one. What it does mean is that I need a company willing to sponsor someone whose qualifying route is experience rather than a diploma. Most of the visas I'm aiming at are built for precisely that case.",
    ],
  },
];

export const honestClose = {
  title: "That's the whole list",
  body: "If any of it is a dealbreaker, I'd much rather you close the tab now than three interviews from now. If it isn't, the work is on the other pages and my inbox is open.",
};
