import Link from "next/link";

export default function NotFound() {
  return (
    <div className={`w-[92dvw] max-w-3xl rounded-3xl bg-700 p-8 text-center xs:p-14`}>
      <p className={`text-sm uppercase tracking-[0.2em] opacity-70`}>404</p>

      <h1 className={`mt-3 text-3xl font-bold xs:text-4xl`}>That page does not exist</h1>

      <p className={`mx-auto mt-3 max-w-lg opacity-80`}>
        The link is either old or slightly wrong. Everything on this site is one of the four below.
      </p>

      <div className={`mt-8 flex flex-wrap justify-center gap-3`}>
        <Link href="/" className={`btn btn-primary`}>
          Home
        </Link>
        <Link href="/experience" className={`btn btn-ghost`}>
          Experience
        </Link>
        <Link href="/projects" className={`btn btn-ghost`}>
          Projects
        </Link>
        <Link href="/contact" className={`btn btn-ghost`}>
          Contact
        </Link>
      </div>
    </div>
  );
}
