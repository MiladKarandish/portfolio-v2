import { MoveDirection, OutMode, type ISourceOptions } from "@tsparticles/engine";

export const firefly: ISourceOptions = {
  fullScreen: {
    enable: true,
    zIndex: -1,
  },
  fpsLimit: 120,
  particles: {
    number: {
      value: 0,
    },
    color: {
      value: "#fff",
    },
    life: {
      duration: {
        value: 5,
        sync: false,
      },
      count: 1,
    },
    opacity: {
      value: { min: 0.1, max: 1 },
      animation: {
        enable: true,
        speed: 3,
      },
    },
    size: {
      value: {
        min: 3,
        max: 6,
      },
    },
    move: {
      enable: true,
      speed: 3,
      random: false,
      size: true,
    },
  },
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: "trail",
      },
    },
    modes: {
      trail: {
        delay: 0.5,
        pauseOnStop: true,
        quantity: 4,
      },
    },
  },
  background: {
    color: "#000",
  },
};

export const textMask: ISourceOptions = {
  autoPlay: true,
  clear: true,
  fullScreen: {
    enable: false,
    zIndex: 0,
  },
  style: {
    width: "100%",
    height: "100%",
  },
  detectRetina: true,
  fpsLimit: 120,
  interactivity: {
    detectsOn: "window",
    events: {
      onHover: {
        enable: true,
        mode: "bubble",
        parallax: {
          enable: false,
          force: 1,
          smooth: 10,
        },
      },
      resize: {
        delay: 0.5,
        enable: true,
      },
    },
  },
  particles: {
    color: {
      value: ["#4285f4", "#34A853", "#FBBC05", "#EA4335"],
    },
    move: {
      enable: true,
      outModes: {
        default: "bounce",
        bottom: "bounce",
        left: "bounce",
        right: "bounce",
        top: "bounce",
      },
      random: true,
      speed: 2,
    },
    number: {
      limit: {
        mode: "delete",
        value: 150,
      },
      value: 200,
    },
    opacity: {
      value: {
        min: 0.05,
        max: 0.4,
      },
    },
    size: {
      value: 0.1,
      animation: {
        count: 10,
        enable: true,
        speed: 50,
        mode: "random",
        startValue: "random",
        destroy: "none",
      },
    },
    links: {
      color: {
        value: "random",
      },
      distance: 40,
      enable: true,
      frequency: 1,
      opacity: 1,
      width: 1,
    },
  },
  pauseOnBlur: true,
  pauseOnOutsideViewport: true,
  smooth: true,
  name: "Milad",
  polygon: {
    enable: true,
    inline: {
      arrangement: "equidistant",
    },
    move: {
      radius: 10,
      type: "path",
    },
    scale: 1,
    type: "inline",
    url: "/milad.svg",
    position: {
      x: 50,
      y: 50,
    },
  },
};

export const stars: ISourceOptions = {
  background: {
    color: "#000",
  },
  particles: {
    number: {
      value: 100,
    },
    move: {
      direction: MoveDirection.none,
      enable: true,
      outModes: {
        default: OutMode.out,
      },
      random: true,
      speed: 0.1,
      straight: false,
    },
    opacity: {
      animation: {
        enable: true,
        speed: 1,
        sync: false,
      },
      value: { min: 0, max: 1 },
    },
    size: {
      value: { min: 1, max: 3 },
    },
  },
};

export const mask: ISourceOptions = {
  fpsLimit: 60,
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: "bubble",
      },
    },
    modes: {
      bubble: {
        distance: 40,
        duration: 2,
        opacity: 8,
        size: 6,
        speed: 3,
      },
    },
  },
  particles: {
    color: {
      value: ["#4285f4", "#34A853", "#FBBC05", "#EA4335"],
      animation: {
        enable: true,
        speed: 20,
        sync: true,
      },
    },
    links: {
      blink: false,
      color: "random",
      consent: false,
      distance: 30,
      enable: true,
      opacity: 0.7,
      width: 0.5,
    },
    move: {
      enable: true,
      outModes: "bounce",
      speed: { min: 0.5, max: 1 },
    },
    number: {
      value: 200,
    },
    opacity: {
      animation: {
        enable: true,
        speed: 2,
        sync: false,
      },

      value: { min: 0.05, max: 1 },
    },
    shape: {
      type: "circle",
    },
    size: {
      animation: {
        enable: false,
        speed: 40,
        sync: false,
      },

      value: { min: 0.1, max: 1 },
    },
  },
  polygon: {
    draw: {
      enable: true,
      stroke: {
        color: "#fff",
        width: 0.3,
        opacity: 0.2,
      },
    },
    move: {
      radius: 10,
    },
    inline: {
      arrangement: "equidistant",
    },
    scale: 0.5,
    type: "inline",
    url: "/milad.svg",
  },
};

export const mask2: ISourceOptions = {
  pauseOnBlur: false,
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: "bubble",
      },
    },
    modes: {
      bubble: {
        distance: 40,
        duration: 2,
        opacity: 8,
        size: 6,
        speed: 3,
      },
    },
  },
  particles: {
    color: {
      value: ["#4285f4", "#34A853", "#FBBC05", "#EA4335"],
    },
    links: {
      color: "random",
      distance: 40,
      enable: true,
      opacity: 0.8,
      width: 1,
    },
    move: {
      direction: "none",
      enable: true,
      outModes: "bounce",
      speed: 1,
    },
    number: {
      value: 200,
    },
    opacity: {
      animation: {
        enable: true,
        speed: 2,
        sync: false,
      },
      value: { min: 0.3, max: 0.8 },
    },
    shape: {
      type: "circle",
    },
    size: {
      value: 1,
    },
  },
  polygon: {
    draw: {
      enable: true,
      stroke: {
        color: "#fff",
        opacity: 0.2,
        width: 1,
      },
    },
    enable: true,
    move: {
      radius: 5,
    },
    position: {
      x: 30,
      y: 10,
    },
    inline: {
      arrangement: "equidistant",
    },
    scale: 1,
    type: "inline",
    url: "/milad.svg",
  },
  background: {
    color: "#000000",
    image: "",
    position: "50% 50%",
    repeat: "no-repeat",
    size: "cover",
  },
};

export const reveal: ISourceOptions = {
  fpsLimit: 60,
  particles: {
    number: {
      value: 10,
      // density: {
      //   enable: true,
      // },
    },
    color: {
      value: "#ff0000",
      animation: {
        enable: true,
        speed: 180,
        sync: true,
      },
    },
    shape: {
      type: "circle",
    },
    opacity: {
      value: 0.5,
      animation: {
        enable: false,
        speed: 3,
        sync: false,
      },
    },
    size: {
      value: 50,

      animation: {
        enable: true,
        speed: 5,
        sync: true,
        startValue: "min",
        destroy: "max",
      },
    },
    links: {
      enable: true,
    },
    move: {
      enable: true,
      speed: 10,
      direction: "none",
      random: false,
      straight: false,
      outModes: "destroy",
      attract: {
        enable: true,
        rotate: {
          x: 600,
          y: 1200,
        },
      },
    },
  },
  interactivity: {
    detectsOn: "window",
    events: {
      onHover: {
        enable: true,
        mode: "trail",
      },
      onClick: {
        enable: true,
        mode: "push",
      },
      resize: {
        enable: true,
      },
    },
    modes: {
      grab: {
        distance: 400,
        line_linked: {
          opacity: 1,
        },
      },
      bubble: {
        distance: 400,
        size: 40,
        duration: 2,
        opacity: 0.8,
        speed: 3,
      },
      repulse: {
        distance: 200,
      },
      push: {
        particles_nb: 4,
      },
      remove: {
        particles_nb: 2,
      },
      trail: {
        delay: 0.005,
        quantity: 5,
      },
    },
  },
  retina_detect: true,
  background: {
    color: "#000000",
    image:
      "url('https://lh3.googleusercontent.com/54K6582JHJ9cD13G0REbbR6jHEJZWzUzqaQo1SIFpyznYzx3uCi6XRgeBjyupw3EkiXaJM6HBW5ued9yiA44r25e5Xi6z_yF7mwKE2FncO-bQw=w1200-h630-rj-pp-e365')",
    position: "50% 50%",
    repeat: "no-repeat",
    size: "cover",
  },
  backgroundMask: {
    enable: true,
    cover: {
      color: "#000000",
    },
  },
};

export const mouseMove: ISourceOptions = {
  name: "Mouse Trail",
  particles: {
    color: {
      value: ["#ffe234", "#ffa534"],
    },
    move: {
      outModes: "destroy",
      enable: true,
      speed: 6,
    },
    opacity: {
      value: {
        min: 0.1,
        max: 1,
      },
      animation: {
        enable: true,
        speed: 3,
        startValue: "max",
        destroy: "min",
      },
    },
    size: {
      value: {
        min: 3,
        max: 7,
      },
    },
    shape: {
      type: "char", // Use "char" for text or emojis
      options: {
        char: [
          {
            value: ["🌟", "✨", "🔥"], // Your custom text or emojis
            font: "Verdana", // Optional font for text (not applicable to emojis)
            style: "", // Optional CSS styles (e.g., "italic bold")
            weight: "400", // Font weight
          },
        ],
      },
    },
  },
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: "trail",
      },
    },
    modes: {
      trail: {
        delay: 0.01,
        pauseOnStop: true,
      },
    },
  },
};

export const shootTechs: ISourceOptions = {
  name: "Tech Stack Trail",
  particles: {
    number: {
      value: 0, // Emit particles dynamically
    },
    color: {
      value: ["#61dafb", "#007acc", "#ff2d20", "#38bdf8", "#f9a825"], // React, TypeScript, Git, etc.
    },
    move: {
      enable: true,
      speed: { min: 5, max: 15 }, // Randomized speed
      gravity: {
        enable: true,
        acceleration: 10, // Simulate gravity
      },
      decay: 0.01,
      direction: "top", // Shoot upwards
      outModes: {
        default: "destroy", // Remove particles when they leave the canvas
        bottom: "bounce", // Bounce on hitting the bottom
        left: "bounce",
        right: "bounce",
        top: "bounce",
      },
    },
    collisions: {
      enable: true, // Particles collide with the canvas boundary
      mode: "bounce", // Bounce on collision
    },
    // life: {
    //   duration: {
    //     sync: true, // Each particle has a different lifespan
    //     value: { min: 3, max: 5 }, // Particle lifetime range in seconds
    //   },
    //   delay: {
    //     value: 0, // No delay before starting the fade-out
    //   },
    // },
    // move: {
    //   enable: true,
    //   speed: 6, // Speed of particles
    //   outModes: {
    //     default: "destroy", // Destroy particles when out of bounds
    //   },
    // },
    opacity: {
      value: 1,
    },
    size: {
      value: 20, // Uniform size for text particles
    },
    shape: {
      type: "char", // Text/character shape
      options: {
        char: [
          {
            value: [
              "React",
              "Next.js",
              "TypeScript",
              "Tailwind",
              "JavaScript",
              "HTML",
              "CSS",
              "Axios",
              "REST API",
              "WebSocket",
              "SCSS",
            ], // Your tech stack
            font: "Verdana", // Font for text
            weight: "700", // Bold text
          },
        ],
      },
    },
  },
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: "trail", // Hover-based particle emission
      },
    },
    modes: {
      trail: {
        delay: 0.5, // Delay between particles
        quantity: 1, // Number of particles emitted
      },
    },
  },
  background: {
    color: {
      value: "#000", // Black background for contrast
    },
  },
  emitters: [
    {
      direction: "top",
      rate: {
        quantity: 1, // Emit 1 particle at a time on hover
        delay: 0.1, // Delay between emitted particles
      },
      position: {
        x: 50,
        y: 50,
      },
    },
  ],
};

export const hoverShootTechs: ISourceOptions = {
  name: "Hover Shoot Techs with Gravity and Explosion",
  particles: {
    number: {
      value: 0, // Dynamically emit particles on hover
    },
    color: {
      value: ["#61dafb", "#007acc", "#ff2d20", "#38bdf8", "#f9a825"], // Tech stack colors
    },
    shape: {
      type: "char", // Character-based particles
      options: {
        char: [
          {
            value: [
              "React",
              "Next.js",
              "TypeScript",
              "Tailwind",
              "JavaScript",
              "HTML",
              "CSS",
              "Axios",
              "REST API",
              "WebSocket",
              "SCSS",
            ], // Tech stack
            font: "Verdana",
            weight: "700",
          },
        ],
      },
    },
    size: {
      value: 20, // Particle size
    },
    move: {
      enable: true,
      speed: { min: 5, max: 15 }, // Randomized speed
      gravity: {
        enable: true,
        acceleration: 10, // Simulate gravity
      },
      direction: "top", // Shoot upwards
      outModes: {
        default: "destroy", // Remove particles when they leave the canvas
        bottom: "bounce", // Bounce on hitting the bottom
      },
    },
    opacity: {
      value: 1,
      animation: {
        enable: true,
        speed: 0.5, // Gradual fade-out
        startValue: "max",
        destroy: "min",
      },
    },
    collisions: {
      enable: true, // Particles collide with each other
      mode: "bounce",
    },
    life: {
      duration: 5, // Duration of the particle’s life before fading out
      delay: 1, // Delay before the fade-out starts
    },
  },
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: "trail", // Emit particles on hover
      },
    },
    modes: {
      trail: {
        delay: 0.1, // Short delay between emitted particles
        quantity: 5, // Emit 5 particles per interaction
      },
    },
  },
  background: {
    color: {
      value: "#141414", // Dark background for better visibility
    },
  },
  emitters: [
    {
      direction: "top",
      rate: {
        quantity: 1, // Emit 1 particle at a time on hover
        delay: 0.1, // Delay between emitted particles
      },
      position: {
        x: 50,
        y: 50,
      },
    },
  ],
};
