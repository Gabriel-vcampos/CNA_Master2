
// Single source of scene content and camera direction.
// `image`      filename in public/images (webp, avif, jpg or png)
// `ar`         actual image aspect ratio (width/height): anchors glow and sparks to image content
// `length`     scene scroll duration, in vh (higher values make the camera move more slowly)
// `side`       text placement: left | right | top | bottom
// `valign`     start | center | end | split (title at the top, remaining content at the bottom)
// `motion`     scroll-driven camera movement (origin in SCREEN %; from/to)
// status: exists = existing technology | developing = under development | possible = future possibility

export const STATUS_LABEL = {
  exists: 'Existing',
  developing: 'In Development',
  possible: 'Future Possibility',
}

export const sections = [
  {
    id: 'ia',
    length: 330,
    nav: 'Artificial Intelligence',
    image: 'ia',
    ar: 1612 / 752,
    alt: 'A human hand and a translucent robotic hand reach toward each other, with a point of light between their fingertips, referencing The Creation of Adam.',
    position: '50% 50%',
    positionMobile: '47% 50%',
    title: ['ARTIFICIAL', 'INTELLIGENCE'],
    tagline: 'When technology begins to think alongside us.',
    desc: 'Artificial intelligence is transforming the way we work, learn, create, and make decisions.',
    side: 'top',
    valign: 'start',
    mode: 'list',
    enter: { type: 'iris', at: '47% 59%' },
    seam: 'bloom',
    motion: { origin: '47% 58.6%', from: { scale: 1.02 }, to: { scale: 1.2 } },
    // The point of light between the fingertips slowly grows throughout the scene: the "encounter".
    focus: { x: 47.8, y: 58.6, size: 6 },
    groups: [
      {
        lines: [
          { text: 'AI in Everyday Life', status: 'exists' },
          { text: 'Intelligent Assistants', status: 'exists' },
          { text: 'Task Automation', status: 'exists' },
          { text: 'Human-Machine Collaboration', status: 'developing' },
          { text: 'Large-Scale Data Analysis', status: 'exists' },
        ],
      },
    ],
  },
  {
    id: 'cidades',
    length: 330,
    nav: 'Cities of the Future',
    image: 'cidade',
    ar: 1609 / 744,
    alt: 'A futuristic metropolitan avenue at dusk, with glass skyscrapers illuminated in blue and cyan, pedestrians, autonomous vehicles, and an elevated train.',
    position: '50% 60%',
    positionMobile: '48% 50%',
    title: ['CITIES', 'OF THE FUTURE'],
    tagline: 'A new way of living in metropolitan areas.',
    desc: 'Smart, connected, and automated cities could transform mobility, infrastructure, and quality of life.',
    side: 'left',
    valign: 'start',
    mode: 'list',
    enter: { type: 'slit' },
    seam: 'scan',
    // Slow approach along the avenue: the camera moves toward the vanishing point.
    motion: { origin: '48% 75%', from: { scale: 1.02 }, to: { scale: 1.22 } },
    groups: [
      {
        lines: [
          { text: 'Smart Infrastructure', status: 'developing' },
          { text: 'Urban Mobility', status: 'developing' },
          { text: 'Connected Buildings', status: 'exists' },
          { text: 'Service Automation', status: 'developing' },
          { text: 'Smart Resource Management', status: 'developing' },
        ],
      },
    ],
  },
  {
    id: 'medicina',
    length: 330,
    nav: 'The Future of Medicine',
    image: 'medicina',
    ar: 1600 / 900,
    alt: 'A futuristic operating room: a robotic arm performing surgery on a patient, a nurse, a doctor at a console, and holographic displays of the human body and a heart.',
    position: '50% 50%',
    positionMobile: '43% 50%',
    title: ['THE FUTURE', 'OF MEDICINE'],
    tagline: 'Technology could redefine the limits of human health.',
    desc: '',
    side: 'bottom',
    valign: 'end',
    mode: 'list',
    enter: { type: 'fade' },
    seam: 'bloom',
    motion: { origin: '45% 50%', from: { scale: 1.02 }, to: { scale: 1.2 } },
    // Points of light over details already present in the image: surgical laser, heart, and holographic figure.
    sparks: [
      { x: 43.8, y: 45.5 },
      { x: 83, y: 26 },
      { x: 10, y: 28 },
    ],
    groups: [
      {
        lines: [
          { text: 'Medical Robotics', status: 'exists' },
          { text: 'AI-Assisted Surgery', status: 'exists' },
          { text: 'AI-Powered Diagnostics', status: 'exists' },
          { text: 'Personalized Medicine', status: 'developing' },
          { text: 'Artificial Organs', status: 'developing' },
          { text: 'New Treatment Possibilities', status: 'possible' },
        ],
      },
    ],
  },
  {
    id: 'profissoes',
    length: 400,
    nav: 'Future Careers',
    image: 'profissoes',
    ar: 1616 / 765,
    alt: 'An advanced office where people and humanoid robots work side by side: a professional wearing headphones interacts with a luminous interface next to a robot, overlooking a city with drones.',
    position: '50% 50%',
    positionMobile: '56% 50%',
    title: ['FUTURE', 'CAREERS'],
    tagline: 'Work is evolving. So are the skills we need.',
    desc: 'Automation and artificial intelligence are transforming existing professions and creating new career opportunities.',
    side: 'left',
    valign: 'end',
    strong: true, // Bright image: increases darkening to maintain text readability.
    mode: 'sequence',
    enter: { type: 'wipe-left' },
    seam: 'scan',
    // Slow panoramic movement from left to right (robot → professional → team).
    motion: { origin: '50% 50%', from: { scale: 1.12, xPercent: -3 }, to: { scale: 1.14, xPercent: 3 } },
    groups: [
      {
        title: 'EMERGING PROFESSIONS',
        lines: [
          { text: 'Artificial Intelligence Specialists' },
          { text: 'Robotics Engineers' },
          { text: 'Cybersecurity Specialists' },
          { text: 'Immersive Technology Professionals' },
        ],
      },
      {
        title: 'EVOLVING PROFESSIONS',
        lines: [
          { text: 'Engineering' },
          { text: 'Medicine' },
          { text: 'Education' },
          { text: 'Administration' },
          { text: 'Software Development' },
        ],
      },
      {
        title: 'FUTURE SKILLS',
        lines: [
          { text: 'Critical Thinking' },
          { text: 'Creativity' },
          { text: 'Digital Literacy' },
          { text: 'Adaptability' },
          { text: 'Ability to Work with Artificial Intelligence' },
        ],
      },
    ],
  },
  {
    id: 'educacao',
    length: 350,
    nav: 'Education of the Future',
    image: 'educacao',
    ar: 1609 / 756,
    alt: 'An immersive learning environment with large windows overlooking the city: students use translucent screens and holographic models while a teacher guides the class.',
    position: '50% 55%',
    positionMobile: '67% 50%',
    title: ['EDUCATION', 'OF THE FUTURE'],
    tagline: 'Learning will become an increasingly personalized experience.',
    desc: '',
    side: 'top', // Upper section over the windows: teacher, robot, and students remain unobstructed.
    valign: 'start',
    shade: 0.72,
    mode: 'stack',
    enter: { type: 'iris', at: '25% 60%' },
    seam: 'bloom',
    motion: { origin: '66% 60%', from: { scale: 1.02 }, to: { scale: 1.16 } },
    groups: [
      {
        title: 'PERSONALIZED LEARNING',
        lines: [{ text: 'Intelligent systems adapting content to each student’s learning pace.', status: 'developing' }],
      },
      {
        title: 'IMMERSIVE CLASSROOMS',
        lines: [{ text: 'Augmented and virtual reality enabling hands-on learning experiences.', status: 'exists' }],
      },
      {
        title: 'TEACHERS OF THE FUTURE',
        lines: [{ text: 'Educators acting as mentors with the support of intelligent tools.', status: 'developing' }],
      },
    ],
  },
  {
    id: 'transporte',
    length: 370,
    nav: 'Transportation of the Future',
    image: 'transporte',
    ar: 1614 / 752,
    alt: 'A streamlined high-speed train traveling along a curved elevated track, against a futuristic metropolis at dusk illuminated in blue and cyan.',
    position: '50% 55%',
    positionMobile: '31% 50%',
    title: ['TRANSPORTATION', 'OF THE FUTURE'],
    tagline: 'Shorter distances. Faster connections.',
    desc: 'The evolution of transportation systems could transform the way cities connect.',
    side: 'right',
    valign: 'split',
    mode: 'list',
    enter: { type: 'wipe-right' },
    seam: 'scan',
    // Two-layer parallax: background (city) moves slowly; foreground (train) moves slightly faster.
    motion: { origin: '18% 76%', from: { scale: 1.03, xPercent: 0.8 }, to: { scale: 1.1, xPercent: -0.8 } },
    fg: {
      origin: '18% 76%',
      mask: 'radial-gradient(ellipse 62% 25% at 56% 61%, #000 55%, transparent 100%)',
      from: { scale: 1.03, xPercent: -0.8 },
      to: { scale: 1.16, xPercent: 1.2 },
    },
    speed: true,
    groups: [
      {
        lines: [
          { text: 'Maglev Trains', status: 'exists' },
          { text: 'High-Speed Transportation Systems', status: 'exists' },
          { text: 'Autonomous Vehicles', status: 'developing' },
          { text: 'Electric Mobility', status: 'exists' },
          { text: 'Smart Infrastructure', status: 'developing' },
        ],
      },
    ],
  },
]
