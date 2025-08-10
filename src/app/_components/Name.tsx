"use client";

import { loadAll } from "@tsparticles/all";
import { Container } from "@tsparticles/engine";
import { initParticlesEngine, Particles } from "@tsparticles/react";
import { useEffect, useState } from "react";
import { shootTechs } from "./options";
// import { loadFull } from "tsparticles";

const Name = () => {
  const [init, setInit] = useState(false);

  const particlesLoaded: ((container?: Container) => Promise<void>) | undefined = async (container) => {
    console.log(container);
  };

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // await loadFull(engine);
      await loadAll(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  // return (
  //   <div style={{ position: "relative", height: "100vh", width: "100vw" }}>
  //     <Particles options={shootTechs} />
  //   </div>
  // );

  return (
    <div className={`relative m-auto w-full h-dvh `}>
      {init && <Particles particlesLoaded={particlesLoaded} options={shootTechs} />}
    </div>
  );
};

export default Name;
