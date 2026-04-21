import { Project, Publication, Music, Scholar, Thesis, CVEntry } from './types';

export const projectsData: Project[] = [
  {
    title: "Hospital Cleaning Analytics Dashboard",
    tagline: "Turned hospital audit CSVs into six types of interactive charts — giving facility managers the tools to shift from reactive to data-driven resource allocation.",
    tags: ["Flask", "Pandas", "Plotly", "Python", "Data Visualization"],
    description: "Commissioned by a consulting firm managing facility services across hospitals in Granada, Spain. The hospitals conduct continuous cleanliness audits — scoring elements, zones, and room types across every unit — and the raw data was piling up in CSV/Excel files with no efficient way to act on it.\n\nI built a Flask web application that ingests those audit files, processes them with Pandas, and instantly generates six types of interactive Plotly charts: mean cleanliness scores over time, breakdowns by hospital unit, by zone, by zone and room type, by structural elements per quarter, and cross-analyses of unit vs. zone. A date-range filter lets managers zoom into any period for targeted comparisons.\n\nThe result: the consulting team could identify which floors, zones, or room types were consistently underperforming and reallocate cleaning staff and schedules accordingly — shifting from reactive to data-driven resource planning.",
    youtube: "",
    github: "",
    demo: "analyzer",
    linked_paper: "",
    images: []
  },
  {
    title: "Viewpoint Arena — AI-Collaborative Design Review",
    tagline: "A browser-based 3D research sandbox where AI agents and humans conduct shared design reviews — tracking collective attention and surfacing actionable insights in real time.",
    tags: ["React 19", "Three.js", "React Three Fiber", "TypeScript", "Zustand", "Research Platform"],
    description: "How do you study the way people look at things together? Viewpoint Arena is an experimental research sandbox built to answer exactly that — a browser-based 3D environment where AI agents and human users conduct collaborative design reviews of engineering models.\n\nThe platform places multiple AI agents (each with a role: PRESENTER, REVIEWER, OBSERVER) around a shared 3D object — a synthesizer assembly, a bicycle, or a user-imported STEP file. Each agent has its own perspective, gaze direction, and behavioral state (IDLE, MOVING, INSPECTING, DISCUSSING, FOLLOWING). The system tracks where every participant is looking and accumulates a volumetric attention heatmap on the model surface.\n\nSeven distinct view modes let you study collaboration differently: a split-screen hybrid comparing your perspective with a collaborator's, an AI-guided focus mode that frames areas of collective interest, a leader/follower presenter mode, and an overhead heatmap view. Visual grounding aids — gaze rays, camera frustums, ghost trails — make attention visible and legible.\n\nAn AI intelligence layer runs in parallel: a live transcript generates contextual dialogue based on what agents are inspecting, and an Insights Deck surfaces categorised findings (Risks, Rationale, Actions) linked to a mock engineering requirements database. Spatial comments and drawing annotations can be pinned to model geometry and tied to meeting records.\n\nBuilt as a research platform to study attention, social presence, and AI-assisted sensemaking in remote engineering collaboration. Stack: React 19, React Three Fiber, Three.js, Zustand, occt-import-js (STEP/CAD import).",
    youtube: "",
    github: "",
    demo: "viewpoint",
    linked_paper: "",
    images: []
  },
  {
    title: "OptimaChef — Kitchen Operations Simulator",
    tagline: "Discrete event simulation + NSGA-II genetic optimization for restaurant kitchens — automatically finding Pareto-optimal staffing and station configurations to eliminate bottlenecks.",
    tags: ["React 19", "TypeScript", "NSGA-II", "Discrete Event Simulation", "SQLite", "Recharts"],
    description: "Commissioned by Optima Chef — a professional kitchen training company that deploys experienced chef trainers directly into clients' facilities. Restaurants fail not because the food is bad, but because the kitchen can't keep up. They needed a way to model and stress-test kitchen operations before stepping into a real service.\n\nOptimaChef is a browser-based discrete event simulation (DES) environment that lets restaurant operators design their kitchen as a network of nodes (order generators, prep stations, cooking stations, plating, sinks), then simulate a full service second by second — worker energy depletion, shift rotations, queue dynamics, batch processing.\n\nAn NSGA-II multi-objective genetic algorithm automatically searches the Pareto frontier across throughput, average wait time, and peak queue depth, returning a set of optimal trade-off configurations. The analytics dashboard surfaces utilisation per station, bottleneck detection, and order-flow histograms. Results export to Excel or Word for sharing with kitchen managers.\n\nStack: React 19, TypeScript, Vite, Tailwind CSS, Recharts, Express, SQLite.",
    youtube: "",
    github: "",
    demo: "kitchen",
    linked_paper: "",
    images: []
  },
  {
    title: "Antwerp Voices: Celebrating Citizens' Stories",
    tagline: "Controller-free VR storytelling for museum visitors — immersing them in personal narratives of Antwerp citizens through spatial audio and 360° video, designed for a public museum setting.",
    tags: ["Unity", "VR", "C#", "360° Video", "Sound Design", "Museum UX"],
    description: "A VR storytelling experience that immerses users in the personal narratives of Antwerp citizens using 360-degree video, inspired by the Human Library concept. I developed the full Unity environment, sound design, and controller-free interaction system — designed to be accessible for all museum visitors without prior VR experience.\n\nThe environment presents as a stylized map of Antwerp, with books rising from the city surface. Each book represents a different person from the city, and opening it transports the user into their story. Each narrative uses a unique interaction mode and storytelling technique, co-designed with the person whose story is told.\n\nDeveloped in collaboration with the University of Antwerp.",
    youtube: "https://youtu.be/ppNm-QpI2CQ",
    github: "",
    demo: "",
    linked_paper: "",
    images: []
  },
  {
    title: "OrthoVR — MRI Fracture Visualization & Traumatologist Onboarding",
    tagline: "Immersive VR environment for MRI-based fracture visualization with an integrated learning module — enabling structured, evidence-based onboarding for new traumatologists through progressive case exploration.",
    tags: ["Unity", "C#", "VR", "Clinical Training", "MRI Visualization"],
    description: "Designed and built a complete VR application in Unity for orthopedic trauma education. The platform presents 3D fracture models derived from real clinical cases in an immersive virtual environment, allowing new traumatologists to explore anatomy from any angle and develop classification intuition through structured, hands-on case exposure.\n\nThe system includes an integrated learning module that guides trainees through progressive case complexity — starting with clear, textbook presentations and advancing to ambiguous fracture patterns. Cases are delivered in randomized order to prevent order bias, and the application captures all classification decisions and response times for clinical tracking.\n\nA randomized controlled trial validated the platform against 3D-printed models for proximal humeral fracture classification, finding equivalent educational effectiveness while eliminating the setup overhead, cost, and material waste associated with physical model preparation.",
    youtube: "https://youtu.be/2MaVxZpq6cA",
    github: "",
    demo: "",
    linked_paper: "New technologies for the classification of proximal humeral fractures: Comparison between Virtual Reality and 3D printed models—a randomised controlled trial",
    images: []
  },
  {
    title: "VR Ergonomic Assessment with Xsens",
    tagline: "Real-time Xsens motion capture streamed into Unity VR — enabling live ergonomic feedback and manikin visualization for workplace design evaluation.",
    tags: ["Unity", "C#", "Xsens", "Motion Capture", "VR", "Ergonomics"],
    description: "I developed a full Virtual Reality (VR) environment in Unity to integrate real-time motion capture data from Xsens for ergonomic evaluations. The system connected the incoming data stream from Xsens to assess ergonomic performance and visualized the Xsens manikin within the VR environment, allowing users to see their own movements in real time. This project showcased how VR and motion capture can enhance ergonomic assessments in workplace design.",
    youtube: "https://youtu.be/n3B-nSl1uEU?si=Dm3c5kjTjYtwQ3-4",
    github: "",
    demo: "",
    linked_paper: "Using Virtual Reality and Smart Textiles to Assess the Design of Workstations",
    images: []
  }
];

export const publicationsData: Publication[] = [
  {
    year: 2026,
    title: "Towards Advanced Collaboration Systems for Design Reviews in Product and Production Development",
    authors: "Francisco Garcia Rivera, P Mugur, D Li, Henrik Söderlund",
    journal: "IOP Conference Series: Materials Science and Engineering 1342 (1), 012040",
    type: "Conference Paper",
    doi: "https://doi.org/10.1088/1757-899X/1342/1/012040",
    open_access: true
  },
  {
    year: 2025,
    title: "Human-centered design of VR interface features to support mental workload and spatial cognition during collaboration tasks in manufacturing",
    authors: "Huizhong Cao, Francisco Garcia Rivera, Henrik Söderlund, C Berlin, J Stahre, Björn Johansson",
    journal: "Cognition, Technology & Work 27 (3), 467–485",
    type: "Article",
    doi: "https://doi.org/10.1007/s10111-025-00809-6",
    open_access: true
  },
  {
    year: 2025,
    title: "Beyond Videoconferencing: How Collaborative Tools Make Virtual Design Reviews Work",
    authors: "Francisco Garcia Rivera, Asreen Rostami, Huizhong Cao, Dan Högberg, Maurice Lamb",
    journal: "International Conference on Human-Computer Interaction (HCII 2025)",
    type: "Conference Paper",
    doi: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=h2on66wAAAAJ&citation_for_view=h2on66wAAAAJ:0EnyYjriUFMC",
    open_access: false
  },
  {
    year: 2025,
    title: "Friction situations in real-world remote design reviews when using CAD and videoconferencing tools",
    authors: "Francisco Garcia Rivera, Maurice Lamb, Dan Högberg, Beatrice Alenljung",
    journal: "Empathic Computing 1 (1)",
    type: "Article",
    doi: "https://doi.org/10.70401/ec.2025.0001",
    open_access: true
  },
  {
    year: 2024,
    title: "Leveraging Activity Theory and Functional Modelling for Implementing Extended Reality in Design Reviews",
    authors: "Francisco Garcia Rivera, Francesco Ferrise, M Panarotto",
    journal: "Congress of the International Ergonomics Association (IEA 2024), 360–366",
    type: "Conference Paper",
    doi: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=h2on66wAAAAJ&citation_for_view=h2on66wAAAAJ:MXK_kJrjxJIC",
    open_access: false
  },
  {
    year: 2024,
    title: "How Can XR Enhance Collaboration with CAD/CAE Tools in Remote Design Reviews?",
    authors: "Francisco Garcia Rivera, Asreen Rostami, Sandra Mattsson, Henrik Söderlund",
    journal: "Proceedings of the 11th Swedish Production Symposium (SPS2024)",
    type: "Conference Paper",
    doi: "https://doi.org/10.3233/ATDE240182",
    open_access: true
  },
  {
    year: 2024,
    title: "VR Interaction for Efficient Virtual Manufacturing: Mini Map for Multi-User VR Navigation Platform",
    authors: "Huizhong Cao, Henrik Söderlund, Mélanie Despeisse, Francisco Garcia Rivera, Björn Johansson",
    journal: "Proceedings of the 11th Swedish Production Symposium (SPS2024)",
    type: "Conference Paper",
    doi: "https://doi.org/10.3233/ATDE240178",
    open_access: true
  },
  {
    year: 2024,
    title: "Examining the Impact of Camera Control on Collaborative Problem-Solving",
    authors: "Francisco Garcia Rivera, Maurice Lamb",
    journal: "Proceedings of the 19th SweCog Conference",
    type: "Conference Paper",
    doi: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=h2on66wAAAAJ&citation_for_view=h2on66wAAAAJ:UebtZRa9Y70C",
    open_access: true
  },
  {
    year: 2023,
    title: "New technologies for the classification of proximal humeral fractures: Comparison between Virtual Reality and 3D printed models—a randomised controlled trial",
    authors: "Rafael Almirón Santa-Bárbara, Francisco García Rivera, Maurice Lamb, Rodrigo Víquez Da-Silva, Mario Gutiérrez Bedmar",
    journal: "Virtual Reality 27 (3), 1623–1634",
    type: "Article",
    doi: "https://doi.org/10.1007/s10055-023-00757-4",
    open_access: true
  },
  {
    year: 2022,
    title: "DHM supported assessment of the effects of using an exoskeleton during work",
    authors: "Francisco Garcia Rivera, Dan Högberg, Maurice Lamb, Estela Perez Luque",
    journal: "International Journal of Human Factors Modelling and Simulation 7 (3–4), 231–246",
    type: "Article",
    doi: "https://doi.org/10.1504/ijhfms.2021.10048920",
    open_access: false
  },
  {
    year: 2022,
    title: "The Schematization of XR Technologies in the Context of Collaborative Design",
    authors: "Francisco García Rivera, Maurice Lamb, Dan Högberg, Anna Brolin",
    journal: "SPS2022: Proceedings of the 10th Swedish Production Symposium",
    type: "Conference Paper",
    doi: "https://doi.org/10.3233/ATDE220170",
    open_access: true
  },
  {
    year: 2022,
    title: "Improving the efficiency of virtual-reality-based ergonomics assessments with digital human models in multi-agent collaborative virtual environments",
    authors: "Francisco Garcia Rivera, Maurice Lamb, Melanie Waddell",
    journal: "Proceedings of the 7th International Digital Human Modeling Symposium (DHM 2022)",
    type: "Conference Paper",
    doi: "https://doi.org/10.17077/dhm.31781",
    open_access: true
  },
  {
    year: 2021,
    title: "A Framework to Model the Use of Exoskeletons in DHM Tools",
    authors: "Francisco Garcia Rivera, Anna Brolin, Estela Perez Luque, Dan Högberg",
    journal: "Advances in Simulation and Digital Human Modeling (AHFE 2021)",
    type: "Conference Paper",
    doi: "https://doi.org/10.1007/978-3-030-79763-8_38",
    open_access: false
  },
  {
    year: 2020,
    title: "Using Virtual Reality and Smart Textiles to Assess the Design of Workstations",
    authors: "Francisco Garcia Rivera, Erik Brolin, Anna Syberfeldt, Dan Högberg, Aitor Iriondo Pascual, Estela Perez Luque",
    journal: "SPS2020: Proceedings of the Swedish Production Symposium",
    type: "Conference Paper",
    doi: "https://doi.org/10.3233/ATDE200152",
    open_access: true
  },
  {
    year: 2020,
    title: "The Use and Usage of Virtual Reality Technologies in Planning and Implementing New Workstations",
    authors: "René Reinhard, Peter Mårdberg, Francisco García Rivera, Tobias Forsberg, Anton Berce, Fang Mingji, Dan Högberg",
    journal: "DHM2020: Proceedings of the 6th International Digital Human Modeling Symposium",
    type: "Conference Paper",
    doi: "https://doi.org/10.3233/ATDE200047",
    open_access: true
  },
  {
    year: 2020,
    title: "Aiding Observational Ergonomic Evaluation Methods Using MOCAP Systems Supported by AI-Based Posture Recognition",
    authors: "Victor Igelmo, Anna Syberfeldt, Dan Högberg, Francisco García Rivera, Estela Pérez Luque",
    journal: "DHM2020: Proceedings of the 6th International Digital Human Modeling Symposium",
    type: "Conference Paper",
    doi: "https://doi.org/10.3233/ATDE200050",
    open_access: true
  },
  {
    year: 2020,
    title: "Implementation of Ergonomics Evaluation Methods in a Multi-Objective Optimization Framework",
    authors: "Aitor Iriondo Pascual, Dan Högberg, Anna Syberfeldt, Francisco García Rivera, Estela Pérez Luque, Lars Hanson",
    journal: "DHM2020: Proceedings of the 6th International Digital Human Modeling Symposium",
    type: "Conference Paper",
    doi: "https://doi.org/10.3233/ATDE200044",
    open_access: true
  },
  {
    year: 2020,
    title: "Motion Behavior and Range of Motion when Using Exoskeletons in Manual Assembly Tasks",
    authors: "Estela Perez Luque, Dan Högberg, Aitor Iriondo Pascual, Dan Lämkull, Francisco Garcia Rivera",
    journal: "SPS2020: Proceedings of the Swedish Production Symposium",
    type: "Conference Paper",
    doi: "https://doi.org/10.3233/ATDE200159",
    open_access: true
  },
  {
    year: 2019,
    title: "Using Motion Capture and Virtual Reality to Test the Advantages of Human Robot Collaboration",
    authors: "Francisco Garcia Rivera",
    journal: "MSc Thesis, University of Skövde",
    type: "Thesis",
    doi: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=h2on66wAAAAJ&citation_for_view=h2on66wAAAAJ:9yKSN-GCB0IC",
    open_access: true
  },
  {
    year: 2018,
    title: "Implementation of Metallic Profiles in Social Houses",
    authors: "Francisco Garcia Rivera, D Hoyos Rodriguez",
    journal: "BSc Thesis",
    type: "Thesis",
    doi: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=h2on66wAAAAJ&citation_for_view=h2on66wAAAAJ:eQOLeE2rZwMC",
    open_access: false
  },
];

export const scholarData: Scholar = {
  title: "Google Scholar",
};

export const musicData: Music = {
  title: "my music",
  role: "Music Producer / Artist",
  spotifyEmbedUrl: "https://open.spotify.com/embed/artist/3MXbzd4DQnTACcuLaSwS6g?utm_source=generator&theme=0",
  description: "Electronic soundscapes, melodic experiments, and auditory engineering."
};

export const thesisData: Thesis = {
  title: "Extended Reality for Remote Collaborative Design Reviews",
  year: 2025,
  university: "University of Skövde, Sweden",
  abstract: "This thesis investigates how Extended Reality (XR) technologies can support and enhance remote collaborative design reviews in product development. Through six empirical studies carried out in close collaboration with industry partners, the work examines friction in real-world remote collaboration, the effects of viewpoint control on communication, and the development of evidence-based guidelines for XR-assisted design reviews. The findings contribute a design knowledge base for practitioners and researchers working at the intersection of XR, collaborative tools, and engineering design.",
  pdfFile: "/Assets/Kappa Fransisco Garcia Rivera.pdf",
  papers: [
    {
      number: "Paper I",
      title: "The Schematization of XR Technologies in the Context of Collaborative Design",
      journal: "SPS2022: Proceedings of the 10th Swedish Production Symposium",
      year: 2022,
      doi: "https://doi.org/10.3233/ATDE220170",
      pdfFile: "/Assets/Paper I. The schematization of XR technologies in the context of collaborative design.pdf",
      description: "Built a structured classification framework for XR technologies — VR, AR, and MR — in the context of collaborative design. Produced a taxonomy that maps tools across dimensions of immersion, collaboration mode, and use context, giving practitioners and researchers a shared vocabulary for positioning XR systems within real-world product development workflows."
    },
    {
      number: "Paper II",
      title: "Improving the Efficiency of VR-Based Ergonomics Assessments with Digital Human Models in Multi-Agent Collaborative Virtual Environments",
      journal: "Proceedings of the 7th International Digital Human Modeling Symposium (DHM 2022)",
      year: 2022,
      doi: "https://doi.org/10.17077/dhm.31781",
      pdfFile: "/Assets/Paper II. Improving the efficiency of virtual-reality-based ergonomics assessments with digital human models in multi-agent collaborative virtual environments.pdf",
      description: "Designed and evaluated a multi-agent VR environment where multiple users simultaneously conduct ergonomics assessments using Digital Human Models. Demonstrated that shared virtual workspaces reduce assessment overhead in industrial settings — with direct implications for how ergonomics tools should be architected for distributed engineering teams."
    },
    {
      number: "Paper III",
      title: "Friction Situations in Real-World Remote Design Reviews When Using CAD and Videoconferencing Tools",
      journal: "Empathic Computing",
      year: 2025,
      doi: "https://doi.org/10.70401/ec.2025.0001",
      pdfFile: "/Assets/Paper III. Friction situations in real-world remote design reviews when using CAD and videoconferencing tools.pdf",
      description: "Led a diary and interview study with professional engineering teams across multiple industry sectors to systematically catalogue the friction situations that arise in remote design reviews. Identified twelve recurring friction patterns grouped by communication, visualization, and coordination breakdowns — providing an empirical foundation for tool improvement and workflow redesign."
    },
    {
      number: "Paper IV",
      title: "Shared versus Individual Viewpoint Control in Remote Design Review Meetings: Effects on Communication and Collaboration",
      journal: "Proceedings of the 19th SweCog Conference",
      year: 2024,
      pdfFile: "/Assets/Paper IV. Shared versus Individual Viewpoint Control in Remote Design Reviews Meetings Effects on Communication and Collaboration.pdf",
      description: "Designed and conducted a controlled experiment comparing shared versus individual viewpoint control in remote design review meetings. Measured effects on verbal communication patterns, cognitive load, and collaboration quality — providing evidence-based guidance for XR tool designers on when to constrain or unlock viewpoint autonomy in collaborative sessions."
    },
    {
      number: "Paper V",
      title: "Beyond Videoconferencing: How Collaborative Tools Make Virtual Design Reviews Work",
      journal: "Under Review",
      year: 2025,
      pdfFile: "/Assets/Paper V. Beyond videoconferencing How collaborative tools make virtual design reviews work.pdf",
      description: "Mixed-methods study investigating how professional engineering teams move beyond basic videoconferencing to conduct effective virtual design reviews. Documents the practices, workarounds, and supplementary tools used by high-performing distributed teams, and derives a model of the strategies that make remote reviews work in practice."
    },
    {
      number: "Paper VI",
      title: "Guidelines Development for Design Reviews with Advanced Collaboration Tools",
      journal: "Under Review",
      year: 2025,
      pdfFile: "/Assets/Paper VI. Guidelines Development for Design Reviews with Advanced Collaboration Tools.pdf",
      description: "Synthesized findings from across all empirical studies into actionable guidelines for conducting design reviews with advanced collaboration tools. Covers tool selection criteria, session facilitation, viewpoint configuration strategies, and XR integration approaches — validated with practitioners across multiple industrial sectors."
    }
  ]
};

export const cvData: CVEntry[] = [
  {
    type: 'experience',
    role: "PhD Researcher — XR Products",
    org: "University of Skövde",
    period: "May 2021 — May 2026",
    location: "Skövde, Sweden",
    bullets: [
      "Defined strategy for collaborative XR features adopted in IPS IMMA, driving a roadmap used by 3 OEMs and 200+ engineers",
      "Designed and shipped 6+ XR prototypes (navigation, camera control, ergonomics) validated through 120+ user tests with Volvo, Scania, and CEVT",
      "Developed and taught a final-year Product Development course for design students, ~40% of curriculum centred on Gravity Sketch",
      "Translated research insights into product requirements that improved collaboration speed in design reviews by ~30%",
      "Coordinated cross-functional teams of researchers, developers, and industry stakeholders to deliver working solutions on time",
      "Published 5+ peer-reviewed papers establishing thought leadership on XR adoption in industry"
    ]
  },
  {
    type: 'experience',
    role: "Independent Consultant",
    org: "OptimaChef · Cogesa Consulting · Hospital de Antequera",
    period: "2023 — 2026",
    location: "Remote",
    bullets: [
      "OptimaChef — built a browser-based discrete event simulation environment for restaurant kitchens with an NSGA-II genetic optimiser, automatically surfacing Pareto-optimal staffing configurations across throughput, wait time, and queue depth",
      "Cogesa Consulting — developed a Flask/Pandas/Plotly dashboard that turns raw hospital cleanliness audit CSVs into six interactive chart types, enabling data-driven resource allocation for facility managers",
      "Hospital de Antequera — designed and delivered a Unity VR platform for MRI-based fracture visualization and traumatologist onboarding, validated in a randomized controlled trial against 3D-printed models"
    ]
  },
  {
    type: 'experience',
    role: "Visiting Researcher",
    org: "Politecnico Di Milano",
    period: "Jan 2024 — Jul 2024",
    location: "Milan, Italy",
    bullets: [
      "Led three user studies on virtual collaboration, testing XR features with 50+ participants across engineering teams",
      "Built Unity prototypes to compare and validate viewpoint configurations, directly informing product design choices",
      "Analyzed experimental data to deliver actionable insights that improved collaboration tool usability"
    ]
  },
  {
    type: 'experience',
    role: "Research Engineer",
    org: "University of Skövde",
    period: "Jun 2019 — May 2021",
    location: "Skövde, Sweden",
    bullets: [
      "Led development of 4 industrial XR demonstrators with Volvo, Scania, and CEVT, piloted by 300+ engineers in real assembly contexts",
      "Scoped and delivered XR tools for ergonomics and motion-capture analysis, reducing prototype testing time by ~25%",
      "Evaluated 10+ emerging technologies and drove integration of the most impactful solutions into industrial workflows",
      "Coordinated cross-functional teams of designers, developers, and engineers to ship prototypes on time"
    ]
  },
  {
    type: 'education',
    role: "PhD in Informatics — XR & Collaborative Design",
    org: "University of Skövde",
    period: "2021 — 2026",
    location: "Skövde, Sweden",
    details: "Dissertation: \"Asymmetric XR Collaboration\". Advisors: Maurice Lamb, Anna Brolin, Dan Högberg."
  },
  {
    type: 'education',
    role: "MSc in Intelligent Automation",
    org: "University of Skövde",
    period: "2018 — 2019",
    location: "Skövde, Sweden",
    details: "Thesis: \"Using motion capture and virtual reality to test the advantages of human-robot collaboration\". Advisor: Erik Brolin."
  },
  {
    type: 'education',
    role: "BSc in Mechanical Engineering",
    org: "University of Skövde / University of Málaga",
    period: "2016 — 2018",
    location: "Sweden / Spain",
    details: "Erasmus+ exchange. Summa Cum Laude in Physics. Focus on CAD, FEM, and manufacturing engineering."
  },
  {
    type: 'education',
    role: "Professional Degree in Classical Violin",
    org: "Conservatorio Ángel Barrios, Granada",
    period: "2013",
    location: "Granada, Spain",
    details: "Título Profesional de Música — Especialidad de Violín. Issued by the Junta de Andalucía."
  }
];
