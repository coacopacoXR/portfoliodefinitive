import { Project, Publication, Music, Scholar } from './types';

export const projectsData: Project[] = [
  {
    "title": "Hospital Cleaning Analytics Dashboard",
    "description": "Commissioned by a consulting firm managing facility services across hospitals in Granada, Spain. The hospitals conduct continuous cleanliness audits — scoring elements, zones, and room types across every unit — and the raw data was piling up in CSV/Excel files with no efficient way to act on it.\n\nI built a Flask web application that ingests those audit files, processes them with Pandas, and instantly generates six types of interactive Plotly charts: mean cleanliness scores over time, breakdowns by hospital unit, by zone, by zone and room type, by structural elements per quarter, and cross-analyses of unit vs. zone. A date-range filter lets managers zoom into any period for targeted comparisons.\n\nThe result: the consulting team could identify which floors, zones, or room types were consistently underperforming and reallocate cleaning staff and schedules accordingly — shifting from reactive to data-driven resource planning.",
    "youtube": "",
    "github": "https://github.com/frangarivera94/Analyzer",
    "demo": "analyzer",
    "linked_paper": "",
    "images": []
  },
  {
    "title": "Viewpoint Arena — AI-Collaborative Design Review",
    "description": "How do you study the way people look at things together? Viewpoint Arena is an experimental research sandbox built to answer exactly that — a browser-based 3D environment where AI agents and human users conduct collaborative design reviews of engineering models.\n\nThe platform places multiple AI agents (each with a role: PRESENTER, REVIEWER, OBSERVER) around a shared 3D object — a synthesizer assembly, a bicycle, or a user-imported STEP file. Each agent has its own perspective, gaze direction, and behavioral state (IDLE, MOVING, INSPECTING, DISCUSSING, FOLLOWING). The system tracks where every participant is looking and accumulates a volumetric attention heatmap on the model surface.\n\nSeven distinct view modes let you study collaboration differently: a split-screen hybrid comparing your perspective with a collaborator's, an AI-guided focus mode that frames areas of collective interest, a leader/follower presenter mode, and an overhead heatmap view. Visual grounding aids — gaze rays, camera frustums, ghost trails — make attention visible and legible.\n\nAn AI intelligence layer runs in parallel: a live transcript generates contextual dialogue based on what agents are inspecting, and an Insights Deck surfaces categorised findings (Risks, Rationale, Actions) linked to a mock engineering requirements database. Spatial comments and drawing annotations can be pinned to model geometry and tied to meeting records.\n\nBuilt as a research platform to study attention, social presence, and AI-assisted sensemaking in remote engineering collaboration. Stack: React 19, React Three Fiber, Three.js, Zustand, occt-import-js (STEP/CAD import).",
    "youtube": "",
    "github": "",
    "demo": "viewpoint",
    "linked_paper": "",
    "images": []
  },
  {
    "title": "OptimaChef — Kitchen Operations Simulator",
    "description": "Commissioned by Optima Chef — a professional kitchen training company that deploys experienced chef trainers directly into clients’ facilities. Restaurants fail not because the food is bad, but because the kitchen can’t keep up. They needed a way to model and stress-test kitchen operations before stepping into a real service.\n\nOptimaChef is a browser-based discrete event simulation (DES) environment that lets restaurant operators design their kitchen as a network of nodes (order generators, prep stations, cooking stations, plating, sinks), then simulate a full service second by second — worker energy depletion, shift rotations, queue dynamics, batch processing.\n\nAn NSGA-II multi-objective genetic algorithm automatically searches the Pareto frontier across throughput, average wait time, and peak queue depth, returning a set of optimal trade-off configurations. The analytics dashboard surfaces utilisation per station, bottleneck detection, and order-flow histograms. Results export to Excel or Word for sharing with kitchen managers.\n\nStack: React 19, TypeScript, Vite, Tailwind CSS, Recharts, Express, SQLite.",
    "youtube": "",
    "github": "",
    "demo": "kitchen",
    "linked_paper": "",
    "images": []
  },
  {
    "title": "Antwerp Voices: Celebrating Citizens’ Stories",
    "description": "A VR storytelling experience that immerses users in the personal narratives of Antwerp citizens using 360-degree video, inspired by the Human Library concept. I developed all the Unity environment, sound design, interaction with no controllers (since it is thought to be done in a museum setting). The environment is presented to the user as a map of Antwerp. There are books coming out of the map. Each book represents a different story of a different person from the city. Each story has a unique interaction mode and story telling technique, which is discussed with the person whose story is told",
    "youtube": "https://youtu.be/ppNm-QpI2CQ",
    "linked_paper": "Submission Antwerp Voices.pdf",
    "images": []
  },
  {
    "title": "Virtual Reality for Fracture Classification",
    "description": "I developed the entire Virtual Reality (VR) environment in Unity for a study comparing VR with 3D-printed models in orthopedic surgery. The system presented fracture cases in a random and distributed order, allowing participants to classify fractures while the application collected all necessary data for analysis. The results demonstrated that VR can be as effective as traditional 3D-printed models while offering benefits like faster setup, cost efficiency, and sustainability.",
    "youtube": "https://youtu.be/2MaVxZpq6cA",
    "linked_paper": "New technologies for the classification of proximal humeral fractures: Comparison between Virtual Reality and 3D printed models—a randomised controlled trial",
    "images": []
  },
  {
    "title": "VR Ergonomic Assessment with Xsens",
    "description": "I developed a full Virtual Reality (VR) environment in Unity to integrate real-time motion capture data from Xsens for ergonomic evaluations. The system connected the incoming data stream from Xsens to assess ergonomic performance and visualized the Xsens manikin within the VR environment, allowing users to see their own movements in real time. This project showcased how VR and motion capture can enhance ergonomic assessments in workplace design.",
    "youtube": "https://youtu.be/n3B-nSl1uEU?si=Dm3c5kjTjYtwQ3-4",
    "linked_paper": "Using Virtual Reality and Smart Textiles to Assess the Design of Workstations",
    "images": []
  }
];

export const publicationsData: Publication[] = [
  {
    "year": 2025,
    "title": "Friction situations in real-world remote design reviews when using CAD and videoconferencing tools",
    "authors": "Francisco Garcia Rivera, Maurice Lamb, Dan Högberg, Beatrice Alenljung",
    "journal": "Empathic Computing",
    "type": "Article",
    "doi": "https://doi.org/10.70401/ec.2025.0001",
    "open_access": true
  },
  {
    "year": 2024,
    "title": "VR Interaction for Efficient Virtual Manufacturing: Mini Map for Multi-User VR Navigation Platform",
    "authors": "Huizhong Cao, Henrik Söderlund, Mélanie Despeisse, Francisco Garcia Rivera, Björn Johansson",
    "journal": "Proceedings of the 11th Swedish Production Symposium (SPS2024)",
    "type": "Conference Paper",
    "doi": "https://doi.org/10.3233/ATDE240178",
    "open_access": true
  },
  {
    "year": 2024,
    "title": "How Can XR Enhance Collaboration with CAD/CAE Tools in Remote Design Reviews?",
    "authors": "Francisco Garcia Rivera, Rostami Asreen, Sandra Mattsson, Henrik Söderlund",
    "journal": "Proceedings of the 11th Swedish Production Symposium (SPS2024)",
    "type": "Conference Paper",
    "doi": "https://doi.org/10.3233/ATDE240182",
    "open_access": true
  },
  {
    "year": 2024,
    "title": "Examining the Impact of Camera Control on Collaborative Problem-Solving",
    "authors": "Francisco Garcia Rivera, Maurice Lamb",
    "journal": "Proceedings of the 19th SweCog Conference",
    "type": "Conference Paper, Poster",
    "doi": "",
    "open_access": true
  },
  {
    "year": 2023,
    "title": "New technologies for the classification of proximal humeral fractures: Comparison between Virtual Reality and 3D printed models—a randomised controlled trial",
    "authors": "Rafael Almirón Santa-Bárbara, Francisco García Rivera, Maurice Lamb, Rodrigo Víquez Da-Silva, Mario Gutiérrez Bedmar",
    "journal": "Virtual Reality",
    "type": "Article",
    "doi": "https://doi.org/10.1007/s10055-023-00757-4",
    "open_access": true
  },
  {
    "year": 2022,
    "title": "DHM supported assessment of the effects of using an exoskeleton during work",
    "authors": "Francisco Garcia Rivera, Dan Högberg, Maurice Lamb, Estela Perez Luque",
    "journal": "International Journal of Human Factors Modelling and Simulation",
    "type": "Article",
    "doi": "https://doi.org/10.1504/ijhfms.2021.10048920",
    "open_access": false
  },
  {
    "year": 2022,
    "title": "The Schematization of XR Technologies in the Context of Collaborative Design",
    "authors": "Francisco García Rivera, Maurice Lamb, Dan Högberg, Anna Brolin",
    "journal": "SPS2022: Proceedings of the 10th Swedish Production Symposium",
    "type": "Conference Paper",
    "doi": "https://doi.org/10.3233/ATDE220170",
    "open_access": true
  },
  {
    "year": 2022,
    "title": "Improving the efficiency of virtual-reality-based ergonomics assessments with digital human models in multi-agent collaborative virtual environments",
    "authors": "Francisco Garcia Rivera, Maurice Lamb, Melanie Waddell",
    "journal": "Proceedings of the 7th International Digital Human Modeling Symposium (DHM 2022)",
    "type": "Conference Paper",
    "doi": "https://doi.org/10.17077/dhm.31781",
    "open_access": true
  },
  {
    "year": 2021,
    "title": "A Framework to Model the Use of Exoskeletons in DHM Tools",
    "authors": "Francisco Garcia Rivera, Anna Brolin, Estela Perez Luque, Dan Högberg",
    "journal": "Advances in Simulation and Digital Human Modeling",
    "type": "Conference Paper",
    "doi": "https://doi.org/10.1007/978-3-030-79763-8_38",
    "open_access": false
  },
  {
    "year": 2020,
    "title": "Using Virtual Reality and Smart Textiles to Assess the Design of Workstations",
    "authors": "Francisco Garcia Rivera, Erik Brolin, Anna Syberfeldt, Dan Högberg, Aitor Iriondo Pascual, Estela Perez Luque",
    "journal": "SPS2020: Proceedings of the Swedish Production Symposium",
    "type": "Conference Paper",
    "doi": "https://doi.org/10.3233/ATDE200152",
    "open_access": true
  },
  {
    "year": 2020,
    "title": "Aiding Observational Ergonomic Evaluation Methods Using MOCAP Systems Supported by AI-Based Posture Recognition",
    "authors": "Victor Igelmo, Anna Syberfeldt, Dan Högberg, Francisco García Rivera, Estela Peréz Luque",
    "journal": "DHM2020: Proceedings of the 6th International Digital Human Modeling Symposium",
    "type": "Conference Paper",
    "doi": "https://doi.org/10.3233/ATDE200050",
    "open_access": true
  },
  {
    "year": 2020,
    "title": "Implementation of Ergonomics Evaluation Methods in a Multi-Objective Optimization Framework",
    "authors": "Aitor Iriondo Pascual, Dan Högberg, Anna Syberfeldt, Francisco García Rivera, Estela Pérez Luque, Lars Hanson",
    "journal": "DHM2020: Proceedings of the 6th International Digital Human Modeling Symposium",
    "type": "Conference Paper",
    "doi": "https://doi.org/10.3233/ATDE200044",
    "open_access": true
  },
  {
    "year": 2020,
    "title": "Motion Behavior and Range of Motion when Using Exoskeletons in Manual Assembly Tasks",
    "authors": "Estela Perez Luque, Dan Högberg, Aitor Iriondo Pascual, Dan Lämkull, Francisco Garcia Rivera",
    "journal": "SPS2020: Proceedings of the Swedish Production Symposium",
    "type": "Conference Paper",
    "doi": "https://doi.org/10.3233/ATDE200159",
    "open_access": true
  },
  {
    "year": 2020,
    "title": "The Use and Usage of Virtual Reality Technologies in Planning and Implementing New Workstations",
    "authors": "René Reinhard, Peter Mårdberg, Francisco García Rivera, Tobias Forsberg, Anton Berce, Fang Mingji, Dan Högberg",
    "journal": "DHM2020: Proceedings of the 6th International Digital Human Modeling Symposium",
    "type": "Conference Paper",
    "doi": "https://doi.org/10.3233/ATDE200047",
    "open_access": true
  }
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