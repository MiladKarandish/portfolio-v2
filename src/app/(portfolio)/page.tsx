import ParticleText from "@/common/components/ParticleText";

export default function HomePage() {
  return (
    <main className={`text-lg`}>
      <h1>Hello, I&apos;m Milad</h1>
      <h2>FrontEnd Web Developer</h2>

      <ParticleText texts={["Milad Karandish", "FrontEnd Web Developer"]} />
    </main>
  );
}
