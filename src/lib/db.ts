import fs from 'fs';
import os from 'os';
import path from 'path';
import bcrypt from 'bcryptjs';
import { getMongoDb, isMongoConfigured } from './mongodb';
import {
  DatabaseSchema,
  StudentRequest,
  Project,
  EventItem,
  Achievement,
  IndustryRecord,
  Vertical,
  HomeContent,
  AboutContent,
  RequestFormContent,
  SiteSettings,
  EventStatus
} from './types';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Helper to calculate event status from dates
export function calculateEventStatus(startDate: string, endDate: string): EventStatus {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  // Set end of day for end date comparison
  end.setHours(23, 59, 59, 999);

  if (now < start) {
    return 'upcoming';
  } else if (now >= start && now <= end) {
    return 'ongoing';
  } else {
    return 'completed';
  }
}

// Initial Seed Data
function getInitialData(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('Admin@ARVR2026!', salt);

  return {
    admin_users: [
      {
        id: 'admin-1',
        email: 'admin@coe.edu',
        password_hash: passwordHash,
        name: 'CoE Administrator',
        role: 'superadmin',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
    ],
    settings: {
      institution_name: 'Centre of Excellence',
      coe_name: 'AR/VR Centre of Excellence',
      tagline: 'Explore. Learn. Build. Innovate.',
      site_title: 'AR/VR Centre of Excellence | Spatial Computing Lab',
      meta_description: 'A multidisciplinary immersive technology ecosystem for students to learn, collaborate, develop practical skills and build solutions using AR, VR, MR, XR, 3D and related technologies.',
      favicon_url: '/favicon.ico',
      contact_email: 'arvr.coe@institute.edu',
      contact_phone: '+91 44 2345 6789',
      office_location: 'Centre of Excellence Block, 2nd Floor, Room COE-204',
      campus_address: 'Technology Campus, Innovation Corridor, Chennai - 600001',
      working_hours: 'Monday – Saturday: 8:30 AM – 4:30 PM',
      social_links: {
        linkedin: 'https://linkedin.com',
        github: 'https://github.com',
        youtube: 'https://youtube.com',
        twitter: 'https://twitter.com',
      },
      footer_copyright: 'All Rights Reserved.',
      footer_tagline: 'Spatial Computing & Immersive Engineering Digital Ecosystem',
    },
    home_content: {
      hero: {
        title: 'AR/VR Centre of Excellence',
        subtitle: 'Explore. Learn. Build. Innovate.',
        description: 'A multidisciplinary immersive technology ecosystem for students to learn, collaborate, develop practical skills and build solutions using AR, VR, MR, XR, 3D and related technologies.',
        primary_cta_label: 'Request to Join',
        secondary_cta_label: 'Explore Verticals',
      },
      about_preview: {
        heading: 'Where Learning Meets Immersive Technology',
        description: 'The AR/VR Centre of Excellence provides an advanced spatial computing environment where students bridge theoretical engineering with hands-on immersive innovation.',
        pillars: [
          {
            tag: 'MULTIDISCIPLINARY',
            title: 'Cross-Department Collaboration',
            desc: 'Bringing together students from CSE, IT, ECE, EEE, Mechanical, and AI/DS to build next-generation immersive systems.',
          },
          {
            tag: 'HANDS-ON',
            title: 'Practical Development',
            desc: 'Direct access to high-end VR headsets, haptic controllers, spatial sensors, and GPU workstations.',
          },
          {
            tag: 'INNOVATION',
            title: 'Projects & Ideas',
            desc: 'Incubating original prototypes, technical IP, research publications, and patentable spatial solutions.',
          },
          {
            tag: 'INDUSTRY',
            title: 'Real-World Exposure',
            desc: 'Working directly with industry partners, MoUs, live consultancy problems, and specialized mentor sessions.',
          },
        ],
      },
      verticals_preview: {
        heading: 'Five Pathways. One Immersive Ecosystem.',
        subheading: 'Structured avenues tailored for every stage of your spatial computing journey.',
      },
      featured_content: {
        heading: "What's Happening",
      },
      journey: {
        heading: 'Build Your Journey',
        description: 'Progress through learning, practical development, competitions, projects, internships and industry-oriented opportunities.',
      },
      join_cta: {
        heading: 'READY TO EXPLORE IMMERSIVE TECHNOLOGY?',
        subheading: 'Take your first step into Spatial Computing and Extended Reality.',
        description: 'Tell us what interests you and join our dynamic ecosystem of builders, designers, and innovators.',
        cta_label: 'Request to Join',
      },
    },
    about_content: {
      hero: {
        heading: 'Beyond a Lab.',
        subheading: 'An Ecosystem for Immersive Innovation.',
        description: 'Established to cultivate pioneering engineers in Augmented Reality, Virtual Reality, Mixed Reality, and Spatial Computing.',
      },
      mission: 'To foster an open, multidisciplinary research and development laboratory where students master spatial computing paradigms, solve industry-grade engineering challenges, and build deployable XR solutions.',
      vision: 'To emerge as a premier institutional hub for immersive technologies in South India, driving academic excellence, intellectual property creation, and industry-ready engineering talent.',
      what_we_do: [
        'Structured hands-on technical bootcamps in Unity, Unreal Engine 5, WebXR, and Blender',
        'Industry-sponsored research and development projects addressing real operational challenges',
        'Continuous mentorship for national and international XR hackathons and competitions',
        'Facilitating summer and semester-long internships with leading spatial technology firms',
        'Fostering interdepartmental project teams bridging hardware, software, 3D art, and domain logic',
      ],
      coworking_title: 'Your Space to Learn and Build',
      coworking_description: 'The CoE is designed as a collaborative, modern studio workspace rather than a conventional classroom. High-performance VR test rigs, dedicated tracking bays, and agile huddle areas empower active experimentation.',
      multidisciplinary_desc: 'Spatial computing requires diverse disciplines: computer vision, 3D spatial audio, kinematics, computer graphics, human-computer interaction, and cloud streaming. Our lab welcomes students across all engineering branches.',
      student_development_desc: 'From first-year orientation through final-year capstones, students progress through progressive milestones—from fundamental 3D mathematical principles to full-fledged multi-user immersive applications.',
      industry_orientation_desc: 'Through bilateral MoUs and active industry advisory boards, the curriculum and projects are aligned with prevailing spatial computing standards (OpenXR, WebXR, Apple visionOS, Meta Quest SDKs).',
      roadmap: [
        {
          phase: 'Phase 01',
          title: 'Foundation & Spatial Literacy',
          description: '3D mathematics, spatial scene graphs, linear algebra for graphics, basic asset workflows, and Unity/Unreal fundamentals.',
        },
        {
          phase: 'Phase 02',
          title: 'Applied XR Development',
          description: 'HMD tracking pipelines, hand tracking & gesture interactions, spatial audio, physics simulation, and shader development.',
        },
        {
          phase: 'Phase 03',
          title: 'Advanced Engineering & Optimization',
          description: 'OpenXR runtimes, networked multi-user environments, foveated rendering, spatial mesh scanning, and latency tuning.',
        },
        {
          phase: 'Phase 04',
          title: 'Industry Capstones & Incubation',
          description: 'Commercial prototype delivery, patent filings, research papers, venture competitions, and placement acceleration.',
        },
      ],
    },
    verticals: [
      {
        id: 'vert-1',
        slug: 'long-term-certification',
        number: '01',
        title: 'Long-Term Certification Courses',
        short_description: 'Comprehensive curriculum tracks covering foundational to advanced spatial computing and 3D engine development.',
        full_description: 'Structured multi-semester technical progressions designed to take students from absolute zero to production-capable XR engineers. Covering computer graphics mathematics, Unity / Unreal Engine development, OpenXR integrations, 3D asset optimization, spatial audio, and interactive interface design.',
        icon: 'Award',
        outcomes: [
          'Industry-standard certified skill credentials',
          'Deep mastery of Unity & Unreal Engine XR toolchains',
          'Portfolio of 4+ production-level interactive applications',
          'Fluency in OpenXR, C#, and C++ graphics pipelines',
        ],
        tools: ['Unity 2023 LTS', 'Unreal Engine 5.4', 'OpenXR SDK', 'Blender 4.x', 'Visual Studio 2022'],
        opportunities: ['Software Engineer - XR', 'Unity/Unreal Developer', 'Graphics Programmer', 'Technical Artist'],
        is_published: true,
        order_index: 1,
      },
      {
        id: 'vert-2',
        slug: 'industry-internships',
        number: '02',
        title: 'Internships with Industry Support',
        short_description: 'Direct engagement with technology partners on live commercial and industrial XR deliverables.',
        full_description: 'Bridge academic preparation with enterprise execution. Students are paired with corporate mentors to build industrial training simulations, medical visualization platforms, and digital twin interfaces under real development sprints.',
        icon: 'Briefcase',
        outcomes: [
          'Real-world client project demonstrations and delivery',
          'Direct mentorship from senior XR architects',
          'Stipend-supported internship positions',
          'Fast-track Pre-Placement Offers (PPO) upon completion',
        ],
        tools: ['Jira / Git Workflows', 'Enterprise Cloud SDKs', 'Meta Quest Pro / 3', 'Apple Vision Pro Dev Kit'],
        opportunities: ['Enterprise XR Consultant', 'Simulation Engineer', 'Pre-Placement Offers', 'Industrial Designer'],
        is_published: true,
        order_index: 2,
      },
      {
        id: 'vert-3',
        slug: 'self-learning-courses',
        number: '03',
        title: 'Self-Learning Courses',
        short_description: 'Self-paced modular pathways with code repositories, hands-on tutorials, and assessment checkpoints.',
        full_description: 'Guided asynchronous learning paths tailored for students balancing academic coursework. Structured in three clear tiers (Beginner -> Intermediate -> Advanced), complete with starter repos, step-by-step documentation, and lab test criteria.',
        icon: 'BookOpen',
        outcomes: [
          'Self-directed progression tailored to student schedules',
          'GitHub-backed repository of completed exercises',
          'Structured peer reviews and automated test checkpoints',
          'Gateway qualifications for advanced research pods',
        ],
        tools: ['WebXR & Three.js', 'ShaderLab / HLSL', 'A-Frame & Babylon.js', 'GitHub Education'],
        opportunities: ['WebXR Specialist', 'Creative Technologist', 'Independent XR Creator', 'Research Fellow'],
        is_published: true,
        order_index: 3,
      },
      {
        id: 'vert-4',
        slug: 'skill-development',
        number: '04',
        title: 'Skill Development Activities',
        short_description: 'Intensive hackathons, technical paper symposiums, patent clinics, and national challenge teams.',
        full_description: 'Competitive, collaborative arenas designed to stretch engineering limits. The CoE sponsors and mentors student squads competing in Smart India Hackathon, global XR game jams, IEEE VR conferences, and student IP disclosures.',
        icon: 'Zap',
        outcomes: [
          'National & international hackathon podium finishes',
          'Provisional patent filings and institutional IP generation',
          'Published conference papers in IEEE and Springer venues',
          'High-stakes presentation and rapid-prototyping skills',
        ],
        tools: ['Rapid Prototyping Kits', 'Haptic Actuators', 'Arduino / ESP32 XR Peripherals', 'LiDAR Scanners'],
        opportunities: ['Hackathon Champions', 'Patent Holders', 'Research Presenters', 'Tech Community Leaders'],
        is_published: true,
        order_index: 4,
      },
      {
        id: 'vert-5',
        slug: 'product-development',
        number: '05',
        title: 'Product Development',
        short_description: 'Incubation of deployable industrial, healthcare, and educational spatial computing solutions.',
        full_description: 'Operating like an advanced engineering product laboratory. Interdisciplinary squads design, engineer, stress-test, and deploy end-to-end applications for engineering education, medical training, smart manufacturing, and cultural preservation.',
        icon: 'Cpu',
        outcomes: [
          'Fully deployable spatial products with end-user validation',
          'Exploded engineering CAD-to-XR pipelines',
          'Campus-wide adoption of developed educational modules',
          'Foundation for technology spin-offs and startup incubation',
        ],
        tools: ['SolidWorks XR Exporter', 'Spatial Anchors', 'Multi-user Photon Fusion', 'Eye & Face Tracking SDKs'],
        opportunities: ['Product Engineer - XR', 'Spatial UX Architect', 'Startup Founder', 'Hardware/Software Systems Integrator'],
        is_published: true,
        order_index: 5,
      },
    ],
    projects: [
      {
        id: 'proj-1',
        slug: 'industrial-safety-training-vr',
        title: 'Industrial High-Voltage Substation VR Safety Simulator',
        category: 'VR',
        cover_image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1200&auto=format&fit=crop',
        short_desc: 'An immersive virtual reality simulation for electrical engineering students and technicians to practice hazardous substation maintenance without real-world electrical danger.',
        full_desc: 'Developed in collaboration with regional power utility consultants, this VR application recreates a 230kV electrical substation in millimeter accuracy. Users follow Standard Operating Procedures (SOP), execute safety lockouts, wear virtual personal protective equipment (PPE), and handle emergency arc-flash contingencies in real-time.',
        problem: 'Real high-voltage electrical substations present lethal hazards during training. Physical access for undergraduate students is severely restricted due to safety protocols and equipment downtime costs.',
        solution: 'A photorealistic VR simulator with physics-driven switchgear, dielectric testing procedures, and procedural fail-state safety simulations providing muscle memory retention with zero physical risk.',
        technologies: ['Unity 2023 LTS', 'OpenXR', 'Meta Quest 3', 'Shader Graph', 'C#', 'Blender CAD Retopology'],
        team: ['Karthik S. (CSE - Final Year)', 'Pooja R. (EEE - 3rd Year)', 'Vignesh M. (ECE - 3rd Year)'],
        mentor: 'Dr. S. Ramesh, Professor & CoE Lead',
        gallery: [
          'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1000&auto=format&fit=crop',
        ],
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        result_outcome: 'Adopted as a certified laboratory module for 180+ electrical engineering students. Evaluated pre/post test scores demonstrated an 84% reduction in procedural sequencing errors.',
        is_featured: true,
        is_published: true,
        created_at: '2026-01-15T10:00:00.000Z',
        updated_at: '2026-02-10T14:30:00.000Z',
      },
      {
        id: 'proj-2',
        slug: 'medical-cardiac-anatomy-mr',
        title: 'Mixed Reality Interactive Cardiac Anatomy & Pathology Explorer',
        category: 'MR',
        cover_image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop',
        short_desc: 'A mixed reality spatial application rendering volumetric, beating 3D human heart models with interactive pathology slicing and surgical path planning.',
        full_desc: 'Transforming complex 2D CT/MRI DICOM scans into real-time volumetric mixed reality holograms. Students and medical trainees can manipulate 3D anatomical structures in physical room space, observe blood hemodynamics, and simulate surgical incisions with bimanual hand gestures.',
        problem: 'Traditional flat medical atlases fail to communicate complex 3D cardiac chamber depth, spatial spatial orientation, and dynamic valve mechanics, leading to steep learning curves.',
        solution: 'A passthrough-enabled MR application utilizing spatial anchors and custom volumetric shaders to project interactive 4D cardiac dynamics directly onto student workbenches.',
        technologies: ['Unreal Engine 5.4', 'Meta XR SDK', 'OpenXR', 'Volumetric Shader HLSL', 'DICOM to 3D Pipeline'],
        team: ['Harish Kumar (IT - Final Year)', 'Divya B. (CSE - 3rd Year)', 'Siddharth N. (AI/DS - 3rd Year)'],
        mentor: 'Dr. P. Anitha, Dept of Information Technology',
        gallery: [
          'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=1000&auto=format&fit=crop',
        ],
        result_outcome: 'Presented at the National Biomedical Engineering Conclave 2026; received Best Student Innovation Award. Pilot clinical study showed significant improvement in spatial comprehension.',
        is_featured: true,
        is_published: true,
        created_at: '2026-01-20T11:00:00.000Z',
        updated_at: '2026-02-15T16:00:00.000Z',
      },
      {
        id: 'proj-3',
        slug: 'smart-campus-digital-twin-3d',
        title: 'Campus 3D Spatial Digital Twin & Energy Visualizer',
        category: '3D',
        cover_image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1200&auto=format&fit=crop',
        short_desc: 'A web-accessible high-fidelity 3D digital twin of the engineering college campus streaming live IoT sensor telemetry and solar energy yields.',
        full_desc: 'Constructed using drone photogrammetry, high-precision LiDAR scans, and WebGL optimization. The digital twin models over 45 acres of campus terrain, academic blocks, and solar power installations, feeding real-time power consumption metrics into interactive spatial dashboards.',
        problem: 'Campus facilities management relied on disparate analog meters and siloed spreadsheets, making energy anomaly detection and spatial resource planning inefficient.',
        solution: 'An interactive, lightweight browser-based WebGL digital twin that integrates MQTT IoT sensor streams with spatial 3D building models for instant visual analytics.',
        technologies: ['Three.js', 'WebGL', 'TypeScript', 'Node.js', 'MQTT IoT', 'LiDAR Point Cloud'],
        team: ['Arun Balaji (CSE - Final Year)', 'Deepak K. (Mechanical - Final Year)', 'Sneha M. (IT - 3rd Year)'],
        mentor: 'Prof. K. Venkatesh, Head - Digital Infrastructure',
        gallery: [
          'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop',
        ],
        result_outcome: 'Deployed on the college intranet for estate maintenance. Identified peak-load HVAC discrepancies resulting in a measurable 12% campus energy conservation.',
        is_featured: true,
        is_published: true,
        created_at: '2025-11-10T09:00:00.000Z',
        updated_at: '2026-01-05T12:00:00.000Z',
      },
      {
        id: 'proj-4',
        slug: 'automotive-engine-exploded-ar',
        title: 'Augmented Reality Exploded Internal Combustion Engine Disassembly',
        category: 'AR',
        cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
        short_desc: 'An enterprise AR training tool that superimposes exploded mechanical assemblies onto physical engine blocks using model target recognition.',
        full_desc: 'Using advanced computer vision model targets, students point a tablet or AR glasses at a disassembled four-stroke engine to see internal piston tolerances, lubrication flowpaths, and torque specification callouts floating precisely in real space.',
        problem: 'Mechanical engineering laboratories face wear-and-tear on training engines and cannot show internal fluid mechanics or combustion phases during physical disassembly.',
        solution: 'Markerless AR superimposition with interactive step-by-step assembly guides, tolerance gauge checks, and animated thermodynamic cycle overlays.',
        technologies: ['PTC Vuforia Engine', 'Unity 3D', 'ARKit / ARCore', 'Autodesk Inventor CAD Export'],
        team: ['Rahul S. (Mechanical - Final Year)', 'Praveen T. (ECE - 3rd Year)'],
        mentor: 'Dr. G. Ravikumar, Dept of Mechanical Engineering',
        gallery: [
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
        ],
        result_outcome: 'Tested across 3 undergraduate mechanical engineering batches; reduced laboratory equipment setup time by 40% and improved practical exam scores.',
        is_featured: false,
        is_published: true,
        created_at: '2025-10-18T10:00:00.000Z',
        updated_at: '2025-12-20T11:00:00.000Z',
      },
      {
        id: 'proj-5',
        slug: 'heritage-temple-spatial-xr',
        title: 'Ancient Temple Architectural Heritage Spatial XR Walkthrough',
        category: 'XR',
        cover_image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop',
        short_desc: 'A cultural heritage preservation project reconstructing ancient South Indian temple architecture through photogrammetry and spatial audio acoustics.',
        full_desc: 'Digitally preserving intricate monolithic stone carvings and sanctum acoustics using drone photogrammetry and physically-based rendering in Unreal Engine 5 with Lumen illumination.',
        problem: 'Historical stone structures suffer environmental weathering, while public access to delicate architectural features is restricted.',
        solution: 'Millimeter-precise digital archival and immersive walkthrough with spatialized temple bell reverb and interactive bilingual epigraphy guides.',
        technologies: ['Unreal Engine 5.3', 'RealityCapture', 'Nanite & Lumen', 'Ambisonic Spatial Audio'],
        team: ['Keerthana V. (CSE - 3rd Year)', 'Naveen Raj (IT - 3rd Year)'],
        mentor: 'Prof. M. Selvam, Digital Heritage Initiative',
        gallery: [
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop',
        ],
        result_outcome: 'Featured in the Tamil Nadu State Innovation Showcase; permanent interactive kiosk installed at the central library.',
        is_featured: false,
        is_published: true,
        created_at: '2025-09-05T08:30:00.000Z',
        updated_at: '2025-11-12T15:00:00.000Z',
      },
    ],
    events: [
      {
        id: 'event-1',
        slug: 'spatial-computing-hackathon-2026',
        title: 'National Spatial Hack 2026: 36-Hour XR Hackathon',
        category: 'Hackathon',
        poster: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop',
        start_date: '2026-11-15',
        end_date: '2026-11-16',
        time: '08:00 AM – 08:00 PM (36 Hours Continuous)',
        venue: 'AR/VR Centre of Excellence & Central Auditorium',
        registration_url: 'https://spatialhack2026.example.edu',
        short_desc: 'Our flagship national hackathon challenging student developers to build transformative spatial computing solutions for healthcare, industry, and education.',
        full_desc: 'National Spatial Hack 2026 brings together over 50 shortlisted student teams for an intensive 36-hour sprint. Participants receive on-site access to Meta Quest 3 headsets, high-performance GPU workstations, and direct guidance from industry mentors from leading spatial computing enterprises.',
        highlights: [
          'Total prize pool of INR 1,50,000 across 3 innovation tracks',
          'On-site hardware loaner pool: Meta Quest 3, Vive Pro, HoloLens 2',
          'Mentorship clinics by Unity Certified Experts and XR Founders',
          'Direct interview opportunities for top 10 finalist teams',
        ],
        gallery: [
          'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1000&auto=format&fit=crop',
        ],
        is_featured: true,
        is_published: true,
        created_at: '2026-02-01T10:00:00.000Z',
        updated_at: '2026-02-20T12:00:00.000Z',
      },
      {
        id: 'event-2',
        slug: 'unity-unreal-bootcamp-2026',
        title: 'Hands-on Bootcamp: Building OpenXR Applications with Unity & Unreal',
        category: 'Bootcamp',
        poster: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1200&auto=format&fit=crop',
        start_date: '2026-10-20',
        end_date: '2026-10-22',
        time: '09:00 AM – 04:00 PM Daily',
        venue: 'AR/VR CoE Lab, 2nd Floor, Room COE-204',
        registration_url: 'https://example.edu/events/xr-bootcamp',
        short_desc: 'An intensive 3-day technical bootcamp covering OpenXR integration, locomotion mechanics, and hand tracking interactions.',
        full_desc: 'Designed for intermediate student coders who want to build cross-platform immersive applications. Each participant will build and deploy two complete VR mini-games onto standalone headsets during the workshop.',
        highlights: [
          'OpenXR standard specification breakdown and architecture',
          'Physics-based interaction toolkit setup and raycast interactor customization',
          'Optimization techniques for 90 FPS standalone VR rendering',
          'Hands-on certificate upon final capstone review',
        ],
        gallery: [
          'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1000&auto=format&fit=crop',
        ],
        is_featured: true,
        is_published: true,
        created_at: '2026-02-05T11:00:00.000Z',
        updated_at: '2026-02-18T14:00:00.000Z',
      },
      {
        id: 'event-3',
        slug: 'webxr-spatial-web-workshop',
        title: 'WebXR & Three.js: Spatial Computing in Modern Web Browsers',
        category: 'Workshop',
        poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop',
        start_date: '2026-01-25',
        end_date: '2026-01-25',
        time: '10:00 AM – 03:30 PM',
        venue: 'Computing Lab 4 & Hybrid Online',
        short_desc: 'Exploring frictionless browser-based VR/AR experiences with Three.js, WebGL, and the W3C WebXR Device API.',
        full_desc: 'Over 120 attendees participated in this hands-on workshop learning how to create spatial 3D web applications accessible from smartphones, laptops, and VR headsets with no app-store installation requirement.',
        highlights: [
          'Fundamentals of 3D scenegraphs in Three.js and shader programming',
          'WebXR hit-testing for browser-based augmented reality',
          'Asset compression using glTF Draco and KTX2 texture formats',
          'Live deployment of 30+ student spatial web pages to Vercel',
        ],
        gallery: [
          'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop',
        ],
        is_featured: true,
        is_published: true,
        created_at: '2025-12-10T10:00:00.000Z',
        updated_at: '2026-01-26T10:00:00.000Z',
      },
      {
        id: 'event-4',
        slug: 'industry-talk-spatial-audio',
        title: 'Industry Expert Session: Spatial Audio and Psychoacoustics in XR',
        category: 'Guest Lecture',
        poster: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1200&auto=format&fit=crop',
        start_date: '2025-11-18',
        end_date: '2025-11-18',
        time: '02:00 PM – 04:30 PM',
        venue: 'PEC Seminar Hall 1',
        short_desc: 'A masterclass on HRTF modeling, ambisonics, and binaural audio design delivered by senior audio engineers.',
        full_desc: 'Focusing on how sound propagation, reflection, and head-related transfer functions create convincing presence in spatial computing simulations.',
        highlights: [
          'Acoustic geometry and raytracing sound engines in game engines',
          'FMOD and Wwise integration with Unity XR',
          'Live psychoacoustic listening tests comparing mono vs binaural spatial cues',
        ],
        gallery: [
          'https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1000&auto=format&fit=crop',
        ],
        is_featured: false,
        is_published: true,
        created_at: '2025-10-25T09:00:00.000Z',
        updated_at: '2025-11-19T10:00:00.000Z',
      },
    ],
    achievements: [
      {
        id: 'ach-1',
        title: 'First Place at National Smart XR Innovators Hackathon 2026',
        category: 'Hackathon',
        year: '2026',
        date: 'February 2026',
        description: 'Our student team "SpatialMinds" bagged the 1st prize and a cash award of INR 75,000 for developing a Mixed Reality surgical pre-planning assistant.',
        student_team: 'Karthik S., Harish Kumar, Divya B.',
        department: 'Computer Science & Engineering and Information Technology',
        image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?q=80&w=1000&auto=format&fit=crop',
        supporting_info: 'Competed against 140+ engineering college teams across South India; judged by senior technical leaders from global XR enterprises.',
        is_featured: true,
        is_published: true,
        created_at: '2026-02-12T10:00:00.000Z',
      },
      {
        id: 'ach-2',
        title: 'Patent Published: Haptic Feedback Glove for Virtual Tool Simulation',
        category: 'Patent',
        year: '2026',
        date: 'January 2026',
        description: 'Indian Patent Office published our provisional patent (Application No: 202641002341) for a low-cost vibrotactile and tendon-actuated glove peripheral.',
        student_team: 'Rahul S., Vignesh M., Dr. S. Ramesh (Faculty)',
        department: 'Mechanical Engineering & Electronics & Communication Engineering',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop',
        supporting_info: 'Provisional specification filed with Indian Patent Office; incorporates active torque resistance for simulating hand tool resistance in VR.',
        is_featured: true,
        is_published: true,
        created_at: '2026-01-28T10:00:00.000Z',
      },
      {
        id: 'ach-3',
        title: '14 Students Selected for Enterprise XR Internships',
        category: 'Internship',
        year: '2025',
        date: 'December 2025',
        description: 'Fourteen CoE students secured paid semester internships at top tier spatial technology companies, defense simulation labs, and digital twin consultancies.',
        student_team: 'Batch of 2025-2026 CoE Cohort',
        department: 'Interdepartmental (CSE, IT, ECE, Mech)',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop',
        supporting_info: 'Average monthly internship stipend of INR 25,000; includes roles in Unreal Engine graphics programming and industrial simulation.',
        is_featured: true,
        is_published: true,
        created_at: '2025-12-22T10:00:00.000Z',
      },
      {
        id: 'ach-4',
        title: 'Best Institutional XR Centre Award at Tamil Nadu EdTech Conclave',
        category: 'Award',
        year: '2025',
        date: 'October 2025',
        description: 'Recognized as an outstanding institutional Center of Excellence for immersive learning infrastructure and student practical output.',
        student_team: 'AR/VR Centre of Excellence Faculty & Student Leads',
        department: 'Computer Science & Engineering',
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1000&auto=format&fit=crop',
        supporting_info: 'Conferred by the Higher Education Department in partnership with industry consortiums.',
        is_featured: false,
        is_published: true,
        created_at: '2025-10-30T10:00:00.000Z',
      },
      {
        id: 'ach-5',
        title: 'IEEE Conference Paper Publication on Low-Latency Wireless XR',
        category: 'Conference',
        year: '2025',
        date: 'August 2025',
        description: 'Research paper titled "Optimizing Motion-to-Photon Latency in Wi-Fi 6 Connected VR Headsets for Industrial Teleoperation" accepted at IEEE ICCSP.',
        student_team: 'Deepak K., Pooja R., Dr. P. Anitha',
        department: 'Electronics & Communication Engineering',
        image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=1000&auto=format&fit=crop',
        supporting_info: 'Published in IEEE Xplore digital library; DOI indexed.',
        is_featured: false,
        is_published: true,
        created_at: '2025-08-25T10:00:00.000Z',
      },
    ],
    industry_records: [
      {
        id: 'ind-1',
        name: 'Unity Technologies Academic Alliance',
        category: 'Partner',
        logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop',
        description: 'Official academic engagement providing licensed developer toolchains, curriculum frameworks, and globally recognized student certification pathways.',
        date_or_term: 'Active MoU (2024 – 2027)',
        collaboration_details: 'Curriculum mapping with Unity Certified Associate and Professional exams, beta access to Unity XR interaction toolkits, and guest masterclasses.',
        key_outcomes: [
          'Official Unity student certification center',
          'Direct access to Unity academic engineering support',
          'Curriculum credits integrated with university electives',
        ],
        is_published: true,
        order_index: 1,
      },
      {
        id: 'ind-2',
        name: 'PTC Academic & Vuforia Enterprise',
        category: 'MoU',
        logo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=400&auto=format&fit=crop',
        description: 'Bilateral partnership focusing on Industrial Augmented Reality, CAD-to-AR digital work instructions, and spatial factory floor optimization.',
        date_or_term: 'MoU signed September 2024',
        collaboration_details: 'Enterprise software provisioning of Vuforia Studio and Vuforia Engine for training engineering students on real-world industrial IoT workflows.',
        key_outcomes: [
          'Vuforia Studio industrial AR training lab setup',
          'Joint capstone projects with manufacturing clients',
          'Faculty development programs conducted biannually',
        ],
        is_published: true,
        order_index: 2,
      },
      {
        id: 'ind-3',
        name: 'Industrial Visit to Spatial Tech Labs, Chennai',
        category: 'Industrial Visit',
        logo: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400&auto=format&fit=crop',
        description: 'A dedicated one-day exposure visit for 45 CoE student developers to observe live industrial VR training rigs and optical motion capture studios.',
        date_or_term: 'November 14, 2025',
        collaboration_details: 'Students observed 24-camera Vicon optical tracking volumes, haptic force-feedback simulators, and heavy engineering virtual commissioning.',
        key_outcomes: [
          'Observed live motion-capture shoot for game animation',
          'Interactive Q&A session with Chief Technology Officer',
          '3 student teams invited for summer internship screenings',
        ],
        is_published: true,
        order_index: 3,
      },
      {
        id: 'ind-4',
        name: 'Expert Session: Enterprise OpenXR Runtimes & VisionOS',
        category: 'Expert Session',
        logo: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=400&auto=format&fit=crop',
        description: 'Technical deep-dive delivered by Principal XR Systems Architect from a tier-1 multinational technology consulting corporation.',
        date_or_term: 'January 10, 2026',
        collaboration_details: 'Covered architectural mechanics of spatial eye tracking, dynamic foveated rendering pipelines, and enterprise application security in headsets.',
        key_outcomes: [
          'Attended by 110 students and 15 faculty members',
          'Recorded technical masterclass archived for CoE students',
        ],
        is_published: true,
        order_index: 4,
      },
    ],
    student_requests: [
      {
        id: 'req-1',
        full_name: 'Ananya Krishnan',
        register_number: '111422104012',
        department: 'Computer Science and Engineering',
        year: '3rd Year',
        section: 'A',
        email: 'ananya.k@gmail.com',
        mobile_number: '+91 98401 23456',
        interests: ['VR', 'Game Development', 'Simulation', 'Product Development'],
        experience_level: 'Intermediate',
        existing_skills: 'Intermediate C# scripting, built 2 simple 3D game prototypes in Unity, basic 3D mesh modeling in Blender.',
        motivation: 'I want to build clinical rehabilitation simulations for physical therapy. The CoE provides the high-end headsets and mentorship that I cannot access alone, and I want to collaborate with students from biomedical and mechanical engineering.',
        status: 'NEW',
        internal_notes: 'Strong Unity background. Schedule for technical interview for the upcoming medical simulation project squad.',
        submitted_at: '2026-02-18T09:15:00.000Z',
        updated_at: '2026-02-18T09:15:00.000Z',
      },
      {
        id: 'req-2',
        full_name: 'Suresh Varma',
        register_number: '111423205045',
        department: 'Electronics and Communication Engineering',
        year: '2nd Year',
        section: 'B',
        email: 'suresh.varma@gmail.com',
        mobile_number: '+91 97910 87654',
        interests: ['AR', 'MR', 'UI/UX', 'Hackathons'],
        experience_level: 'Beginner',
        existing_skills: 'C/C++, Arduino microcontroller prototyping, foundational Python, enthusiastic about computer vision.',
        motivation: 'Passionate about smart glasses and how heads-up displays can assist assembly line workers. I want to learn spatial computing pipelines and participate in national hackathons under the CoE banner.',
        status: 'WAITING',
        internal_notes: 'Good hardware and embedded foundation. Keep in waiting pool for the next cohort onboarding in April.',
        submitted_at: '2026-02-10T14:20:00.000Z',
        updated_at: '2026-02-15T11:00:00.000Z',
      },
      {
        id: 'req-3',
        full_name: 'Meera Nandakumar',
        register_number: '111421106028',
        department: 'Information Technology',
        year: 'Final Year',
        section: 'A',
        email: 'meera.nanda@gmail.com',
        mobile_number: '+91 94440 55432',
        interests: ['3D Modelling', 'Simulation', 'Industry Projects', 'Internships'],
        experience_level: 'Experienced',
        existing_skills: 'Three.js, WebGL, React, Blender asset texturing, WebXR device API, glTF optimization.',
        motivation: 'I have already developed a WebGL digital twin module. I want to join the CoE product development team to work directly on industry-sponsored enterprise XR projects.',
        status: 'JOINED',
        internal_notes: 'Approved and inducted into Product Development Vertical (Digital Twin Core Team).',
        submitted_at: '2026-01-10T08:00:00.000Z',
        updated_at: '2026-01-15T10:30:00.000Z',
        joined_at: '2026-01-15T10:30:00.000Z',
      },
    ],
  };
}

// Default academic departments available for student application
export const DEFAULT_DEPARTMENTS: string[] = [
  'Computer Science and Engineering',
  'Information Technology',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Artificial Intelligence and Data Science',
  'Cyber Security',
  'Mechatronics Engineering',
  'Civil Engineering',
];

// Ensure database file exists
export const DEFAULT_REQUEST_CONTENT: RequestFormContent = {
  title: 'Apply to Join the AR/VR Centre of Excellence',
  subtitle: 'A high-impact, multidisciplinary spatial computing laboratory for ambitious student researchers, creators, and engineers.',
  guidelines_heading: 'ADMISSION GUIDELINES & SQUAD ALLOCATION',
  guidelines_description: 'Candidates are evaluated continuously based on technical enthusiasm, problem-solving mindset, and commitment. Formal prior XR experience is NOT required — beginner to advanced tracks are supported.',
  eligibility_criteria: [
    'Open to all undergraduate & postgraduate engineering students',
    'Minimum 4 hours/week commitment to lab projects or squad sprints',
    'Access granted to real hardware: Apple Vision Pro, Meta Quest 3, HoloLens 2, HTC Vive',
    'Mentorship by leading faculty researchers and XR industry partners',
  ],
  interest_options: [
    'AR',
    'VR',
    'MR',
    'XR',
    '3D Modelling',
    'Game Development',
    'Simulation',
    'Product Development',
    'UI/UX',
    'Research',
    'Hackathons',
    'Industry Projects',
    'Internships',
    'Certification',
    'Self-Learning',
    'Still Exploring',
  ],
  departments: DEFAULT_DEPARTMENTS,
  keycard_title: 'HOLO_KEYCARD // ADMISSION DOSSIER',
  keycard_badge: 'REAL-TIME 3D WAFER',
  success_heading: 'Welcome to the Frontier.',
  success_message: 'Your joining application has been securely transmitted to the AR/VR Centre of Excellence faculty committee. Look for an induction briefing sent to your personal email within 72 hours.',
  custom_fields: [
    {
      id: 'field_portfolio',
      label: 'Portfolio / GitHub / Project Link',
      type: 'text',
      placeholder: 'https://github.com/... or https://yourportfolio.dev',
      required: false,
      help_text: 'Share links to any previous code, 3D models, or digital creations.',
    },
    {
      id: 'field_hardware',
      label: 'Preferred Target Platform / Rig',
      type: 'select',
      required: false,
      options: ['Any / Open to All', 'Meta Quest 3', 'Apple Vision Pro', 'HTC Vive Pro', 'Microsoft HoloLens 2', 'Unity / Unreal Engine 5'],
      help_text: 'Select your primary interest hardware or game engine.',
    },
  ],
};

let memoryCache: DatabaseSchema | null = null;
const TMP_DB_FILE = path.join(os.tmpdir(), 'arvr_coe_db.json');

export function initDb(): DatabaseSchema {
  if (memoryCache) {
    return memoryCache;
  }

  // 1. Check if /tmp has a hydrated cache from serverless execution
  if (fs.existsSync(TMP_DB_FILE)) {
    try {
      const raw = fs.readFileSync(TMP_DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      memoryCache = parsed;
      return parsed;
    } catch {}
  }

  // 2. Read bundled data/db.json
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      memoryCache = parsed;
      return parsed;
    } catch {}
  }

  // 3. Fallback
  const data = getInitialData();
  data.request_content = DEFAULT_REQUEST_CONTENT;
  memoryCache = data;
  return data;
}

// Asynchronously syncs local document state to MongoDB Atlas collections
export async function syncToMongo(data: DatabaseSchema): Promise<void> {
  const db = await getMongoDb();
  if (!db) return;

  try {
    // 1. Settings (Single Document)
    if (data.settings) {
      await db.collection('settings').updateOne(
        { _id: 'site_settings' as any },
        { $set: { ...data.settings, _id: 'site_settings' } },
        { upsert: true }
      );
    }

    // 2. Content Single Documents
    if (data.home_content) {
      await db.collection('home_content').updateOne(
        { _id: 'home_content' as any },
        { $set: { ...data.home_content, _id: 'home_content' } },
        { upsert: true }
      );
    }
    if (data.about_content) {
      await db.collection('about_content').updateOne(
        { _id: 'about_content' as any },
        { $set: { ...data.about_content, _id: 'about_content' } },
        { upsert: true }
      );
    }
    if (data.request_content) {
      await db.collection('request_content').updateOne(
        { _id: 'request_content' as any },
        { $set: { ...data.request_content, _id: 'request_content' } },
        { upsert: true }
      );
    }

    // 3. Collection Lists Helper
    const syncCollection = async (colName: string, items: any[], idField = 'id') => {
      const col = db.collection(colName);
      if (!Array.isArray(items) || items.length === 0) {
        if (colName === 'student_requests') {
          await col.deleteMany({});
        }
        return;
      }
      const itemIds = items.map((i) => i[idField]);
      await col.deleteMany({ [idField]: { $nin: itemIds } });
      for (const item of items) {
        const filter = { [idField]: item[idField] };
        await col.updateOne(filter as any, { $set: item }, { upsert: true });
      }
    };

    await Promise.all([
      syncCollection('verticals', data.verticals, 'slug'),
      syncCollection('projects', data.projects, 'slug'),
      syncCollection('events', data.events, 'slug'),
      syncCollection('achievements', data.achievements, 'id'),
      syncCollection('industry_records', data.industry_records, 'id'),
      syncCollection('student_requests', data.student_requests, 'id'),
      syncCollection('admin_users', data.admin_users, 'id'),
    ]);
  } catch (err: any) {
    console.warn('MongoDB write-through sync notification:', err?.message || err);
  }
}

// Thread-safe atomic local write with serverless tmp fallback & MongoDB write-through synchronization
export function saveDb(data: DatabaseSchema): void {
  memoryCache = data;

  // 1. Try local data/db.json write (works in persistent node servers, docker, local dev)
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch {
    // In serverless environments like Vercel, the local filesystem is read-only
  }

  // 2. Write to OS /tmp directory (writable in serverless lambdas)
  try {
    const tmpTempFile = `${TMP_DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpTempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpTempFile, TMP_DB_FILE);
  } catch {}

  // 3. If MongoDB Atlas is configured, asynchronously sync to cloud collections
  if (isMongoConfigured()) {
    syncToMongo(data).catch((err) => {
      console.warn('Async MongoDB write-through error:', err?.message || err);
    });
  }
}

export async function saveDbAsync(data: DatabaseSchema): Promise<void> {
  saveDb(data);
  if (isMongoConfigured()) {
    try {
      await syncToMongo(data);
    } catch (err: any) {
      console.warn('saveDbAsync MongoDB error:', err?.message || err);
    }
  }
}

// Hydrates database state from MongoDB Atlas into serverless cache if configured
export async function hydrateFromMongoIfNeeded(): Promise<DatabaseSchema> {
  const current = initDb();
  if (!isMongoConfigured()) return current;

  try {
    const db = await getMongoDb();
    if (!db) return current;

    const [settingsDoc, homeDoc, aboutDoc, reqDoc, verticals, projects, events, achievements, industry, student_requests, admin_users] = await Promise.all([
      db.collection('settings').findOne({ _id: 'site_settings' as any }),
      db.collection('home_content').findOne({ _id: 'home_content' as any }),
      db.collection('about_content').findOne({ _id: 'about_content' as any }),
      db.collection('request_content').findOne({ _id: 'request_content' as any }),
      db.collection('verticals').find().toArray(),
      db.collection('projects').find().toArray(),
      db.collection('events').find().toArray(),
      db.collection('achievements').find().toArray(),
      db.collection('industry_records').find().toArray(),
      db.collection('student_requests').find().toArray(),
      db.collection('admin_users').find().toArray(),
    ]);

    const stripId = (doc: any) => {
      if (!doc) return doc;
      const { _id, ...rest } = doc;
      return rest;
    };

    const stripList = (list: any[]) => (Array.isArray(list) ? list.map(stripId) : []);

    const hydrated: DatabaseSchema = {
      ...current,
      settings: settingsDoc ? stripId(settingsDoc) : current.settings,
      home_content: homeDoc ? stripId(homeDoc) : current.home_content,
      about_content: aboutDoc ? stripId(aboutDoc) : current.about_content,
      request_content: reqDoc ? stripId(reqDoc) : current.request_content,
      verticals: Array.isArray(verticals) && verticals.length > 0 ? stripList(verticals) : current.verticals,
      projects: Array.isArray(projects) && projects.length > 0 ? stripList(projects) : current.projects,
      events: Array.isArray(events) && events.length > 0 ? stripList(events) : current.events,
      achievements: Array.isArray(achievements) && achievements.length > 0 ? stripList(achievements) : current.achievements,
      industry_records: Array.isArray(industry) && industry.length > 0 ? stripList(industry) : current.industry_records,
      student_requests: Array.isArray(student_requests) ? stripList(student_requests) : current.student_requests,
      admin_users: Array.isArray(admin_users) && admin_users.length > 0 ? stripList(admin_users) : current.admin_users,
    };

    memoryCache = hydrated;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(hydrated, null, 2), 'utf-8');
    } catch {}
    try {
      fs.writeFileSync(TMP_DB_FILE, JSON.stringify(hydrated, null, 2), 'utf-8');
    } catch {}

    return hydrated;
  } catch (err: any) {
    console.warn('Hydration from MongoDB skipped, using local cache:', err?.message || err);
    return current;
  }
}

// ---------------- PUBLIC ACCESSORS (Strictly published, safe, no student data) ----------------

export function getPublicHomeContent() {
  const db = initDb();
  return {
    home_content: db.home_content,
    settings: {
      institution_name: db.settings.institution_name,
      coe_name: db.settings.coe_name,
      tagline: db.settings.tagline,
      contact_email: db.settings.contact_email,
      campus_address: db.settings.campus_address,
      office_location: db.settings.office_location,
    },
    featured_events: db.events
      .filter((e) => e.is_published && e.is_featured)
      .slice(0, 3)
      .map((e) => ({
        ...e,
        status: calculateEventStatus(e.start_date, e.end_date),
      })),
    featured_projects: db.projects
      .filter((p) => p.is_published && p.is_featured)
      .slice(0, 3),
    featured_achievements: db.achievements
      .filter((a) => a.is_published && a.is_featured)
      .slice(0, 3),
    verticals: db.verticals
      .filter((v) => v.is_published)
      .sort((a, b) => a.order_index - b.order_index)
      .map((v) => ({
        id: v.id,
        slug: v.slug,
        number: v.number,
        title: v.title,
        short_description: v.short_description,
        icon: v.icon,
      })),
  };
}

export function getPublicAboutContent() {
  const db = initDb();
  return {
    about_content: db.about_content,
    settings: {
      institution_name: db.settings.institution_name,
      coe_name: db.settings.coe_name,
      office_location: db.settings.office_location,
    },
  };
}

export function getPublicRequestContent(): RequestFormContent {
  const db = initDb();
  const content = db.request_content || DEFAULT_REQUEST_CONTENT;
  if (!content.departments || !Array.isArray(content.departments) || content.departments.length === 0) {
    content.departments = [...DEFAULT_DEPARTMENTS];
  }
  return content;
}

export function getPublicVerticals() {
  const db = initDb();
  return db.verticals
    .filter((v) => v.is_published)
    .sort((a, b) => a.order_index - b.order_index);
}

export function getPublicProjects(category?: string) {
  const db = initDb();
  let list = db.projects.filter((p) => p.is_published);
  if (category && category !== 'ALL') {
    list = list.filter((p) => p.category.toUpperCase() === category.toUpperCase());
  }
  return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getPublicProjectBySlug(slug: string) {
  const db = initDb();
  const project = db.projects.find((p) => p.slug === slug && p.is_published);
  if (!project) return null;

  // Related projects
  const related = db.projects
    .filter((p) => p.is_published && p.id !== project.id && (p.category === project.category || p.is_featured))
    .slice(0, 3);

  return { project, related };
}

export function getPublicEvents(statusFilter?: EventStatus) {
  const db = initDb();
  const list = db.events
    .filter((e) => e.is_published)
    .map((e) => ({
      ...e,
      status: calculateEventStatus(e.start_date, e.end_date),
    }));

  if (statusFilter) {
    return list.filter((e) => e.status === statusFilter);
  }
  return list.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
}

export function getPublicEventBySlug(slug: string) {
  const db = initDb();
  const event = db.events.find((e) => e.slug === slug && e.is_published);
  if (!event) return null;

  const eventWithStatus = {
    ...event,
    status: calculateEventStatus(event.start_date, event.end_date),
  };

  const related = db.events
    .filter((e) => e.is_published && e.id !== event.id)
    .slice(0, 3)
    .map((e) => ({
      ...e,
      status: calculateEventStatus(e.start_date, e.end_date),
    }));

  return { event: eventWithStatus, related };
}

export function getPublicAchievements(category?: string) {
  const db = initDb();
  let list = db.achievements.filter((a) => a.is_published);
  if (category && category !== 'All') {
    list = list.filter((a) => a.category === category);
  }
  return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getPublicIndustry() {
  const db = initDb();
  return db.industry_records
    .filter((i) => i.is_published)
    .sort((a, b) => a.order_index - b.order_index);
}

export function getPublicSettings() {
  const db = initDb();
  return {
    institution_name: db.settings.institution_name,
    coe_name: db.settings.coe_name,
    tagline: db.settings.tagline,
    site_title: db.settings.site_title || `${db.settings.coe_name} | ${db.settings.institution_name}`,
    meta_description: db.settings.meta_description || db.settings.tagline || 'AR/VR Centre of Excellence - Spatial Computing Lab',
    favicon_url: db.settings.favicon_url || '/favicon.ico',
    contact_email: db.settings.contact_email,
    contact_phone: db.settings.contact_phone,
    office_location: db.settings.office_location,
    campus_address: db.settings.campus_address,
    working_hours: db.settings.working_hours,
    social_links: db.settings.social_links,
    footer_copyright: db.settings.footer_copyright || 'All Rights Reserved.',
    footer_tagline: db.settings.footer_tagline || '',
  };
}

// ---------------- STUDENT REQUEST SUBMISSION (PUBLIC API) ----------------

export async function submitStudentRequest(data: Omit<StudentRequest, 'id' | 'status' | 'internal_notes' | 'submitted_at' | 'updated_at'>): Promise<{ success: boolean; message: string; duplicate?: boolean }> {
  if (isMongoConfigured()) {
    await hydrateFromMongoIfNeeded();
  }
  const db = initDb();

  const reqEmail = (data.email || data.college_email || '').trim().toLowerCase();

  // Check for active duplicate request by Register Number or Email (in NEW or WAITING state)
  const existing = db.student_requests.find(
    (r) =>
      (r.register_number.trim().toLowerCase() === data.register_number.trim().toLowerCase() ||
       (r.email && r.email.trim().toLowerCase() === reqEmail) ||
       (r.college_email && r.college_email.trim().toLowerCase() === reqEmail)) &&
      (r.status === 'NEW' || r.status === 'WAITING')
  );

  if (existing) {
    return {
      success: false,
      duplicate: true,
      message: 'An active request with this Register Number or Personal Email has already been received and is currently under review by the AR/VR CoE committee.',
    };
  }

  const newRequest: StudentRequest = {
    ...data,
    email: reqEmail,
    id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    status: 'NEW',
    internal_notes: '',
    submitted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.student_requests.unshift(newRequest);
  await saveDbAsync(db);

  return {
    success: true,
    message: 'Your request has been successfully submitted for AR/VR Centre of Excellence review.',
  };
}

// ---------------- ADMIN PRIVATE ACCESSORS & MUTATIONS ----------------

export async function getAdminDashboardStats() {
  if (isMongoConfigured()) {
    await hydrateFromMongoIfNeeded();
  }
  const db = initDb();
  const newRequests = db.student_requests.filter((r) => r.status === 'NEW').length;
  const waitingRequests = db.student_requests.filter((r) => r.status === 'WAITING').length;
  const joinedRequests = db.student_requests.filter((r) => r.status === 'JOINED').length;

  const totalEvents = db.events.length;
  const totalProjects = db.projects.length;
  const totalAchievements = db.achievements.length;

  const recentRequests = db.student_requests.slice(0, 5);
  const upcomingEvents = db.events
    .map((e) => ({
      ...e,
      status: calculateEventStatus(e.start_date, e.end_date),
    }))
    .filter((e) => e.status === 'upcoming' || e.status === 'ongoing')
    .slice(0, 5);

  return {
    counts: {
      new_requests: newRequests,
      waiting_requests: waitingRequests,
      joined_requests: joinedRequests,
      total_events: totalEvents,
      total_projects: totalProjects,
      total_achievements: totalAchievements,
    },
    recent_requests: recentRequests,
    upcoming_events: upcomingEvents,
  };
}

export async function getAdminStudentRequests(filterStatus?: string, search?: string, department?: string, year?: string, interest?: string): Promise<StudentRequest[]> {
  if (isMongoConfigured()) {
    await hydrateFromMongoIfNeeded();
  }
  const db = initDb();
  let list = db.student_requests;

  if (filterStatus && filterStatus !== 'ALL') {
    list = list.filter((r) => r.status === filterStatus);
  }

  if (search) {
    const s = search.toLowerCase();
    list = list.filter(
      (r) =>
        r.full_name.toLowerCase().includes(s) ||
        r.register_number.toLowerCase().includes(s) ||
        (r.email && r.email.toLowerCase().includes(s)) ||
        (r.college_email && r.college_email.toLowerCase().includes(s)) ||
        r.department.toLowerCase().includes(s)
    );
  }

  if (department && department !== 'ALL') {
    list = list.filter((r) => r.department === department);
  }

  if (year && year !== 'ALL') {
    list = list.filter((r) => r.year === year);
  }

  if (interest && interest !== 'ALL') {
    list = list.filter((r) => r.interests.includes(interest));
  }

  return list.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
}

export async function updateStudentRequestStatus(id: string, newStatus: 'NEW' | 'WAITING' | 'JOINED' | 'REJECTED', internalNotes?: string): Promise<StudentRequest | null> {
  if (isMongoConfigured()) {
    await hydrateFromMongoIfNeeded();
  }
  const db = initDb();
  const index = db.student_requests.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const req = db.student_requests[index];
  req.status = newStatus;
  req.updated_at = new Date().toISOString();
  if (newStatus === 'JOINED' && !req.joined_at) {
    req.joined_at = new Date().toISOString();
  }
  if (newStatus === 'REJECTED' && !req.rejected_at) {
    req.rejected_at = new Date().toISOString();
  }
  if (internalNotes !== undefined) {
    req.internal_notes = internalNotes;
  }

  db.student_requests[index] = req;
  await saveDbAsync(db);
  return req;
}

export async function batchUpdateStudentRequestStatus(
  ids: string[],
  newStatus: 'NEW' | 'WAITING' | 'JOINED' | 'REJECTED',
  internalNotes?: string
): Promise<StudentRequest[]> {
  if (isMongoConfigured()) {
    await hydrateFromMongoIfNeeded();
  }
  const db = initDb();
  const updatedList: StudentRequest[] = [];
  const now = new Date().toISOString();

  for (const id of ids) {
    const index = db.student_requests.findIndex((r) => r.id === id);
    if (index !== -1) {
      const req = db.student_requests[index];
      req.status = newStatus;
      req.updated_at = now;
      if (newStatus === 'JOINED' && !req.joined_at) {
        req.joined_at = now;
      }
      if (newStatus === 'REJECTED' && !req.rejected_at) {
        req.rejected_at = now;
      }
      if (internalNotes !== undefined) {
        req.internal_notes = internalNotes;
      }
      db.student_requests[index] = req;
      updatedList.push(req);
    }
  }

  if (updatedList.length > 0) {
    await saveDbAsync(db);
  }
  return updatedList;
}

// Student requests cannot be deleted; they can only be rejected.
export function deleteStudentRequest(_id: string): boolean {
  return false;
}

