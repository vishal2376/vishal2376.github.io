const EXPERIENCE_DATA = [
  {
    year: "2025",
    month: "Jun",
    duration: "Present",
    role: "SDE-1 · Android Security Engineer",
    company: "DailyRounds (Marrow)",
    location: "Bangalore · Hybrid",
    isActive: true, // Adds the pulsing glow effect
    badges: [
      { text: "Current", class: "tb-now" },
      { text: "Security", class: "tb-lead" }
    ],
    bullets: [
      "Own the end-to-end security of Marrow - runtime tamper detection, Frida/Xposed hook detection, and RASP systems that respond to attacks in real time.",
      "Offensive security research: reverse engineer the app with Ghidra & Jadx, find the attack surface, patch it, and ship hardened code before anyone outside notices.",
      "Build content protection systems preventing unauthorized recording, screenshotting, and redistribution of premium course material.",
      "APK hardening, certificate pinning, bytecode-level obfuscation - raising the cost of attacks high enough that it's not worth trying."
    ],
    tags: [
      { text: "RASP", class: "tt-r" },
      { text: "Frida Detection", class: "tt-r" },
      { text: "Xposed Detection", class: "tt-r" },
      { text: "Reverse Engineering", class: "tt-o" },
      { text: "Ghidra", class: "tt-o" },
      { text: "Kotlin", class: "tt-c" },
      { text: "Jetpack Compose", class: "tt-c" },
      { text: "APK Hardening", class: "tt-p" }
    ]
  },
  {
    year: "2024",
    month: "Sep – May",
    duration: "9 months",
    role: "SDE Intern",
    company: "DailyRounds (Marrow)",
    location: "Bengaluru · On-site",
    isActive: false,
    badges: [
      { text: "Internship", class: "tb-intern" }
    ],
    bullets: [
      "Built an internal KMP app for managing sales and availability - single Clean MVVM codebase running on both Android and iOS simultaneously. Zero duplicated business logic.",
      "Created an internal Android library from scratch for synchronized event logging, making the QA testing flow dramatically faster with zero manual correlation overhead.",
      "Implemented better UI and smooth custom animations in the Marrow app using modern Jetpack Compose APIs - things that actually made engineers say \"wait, how did you do that?\""
    ],
    tags: [
      { text: "Kotlin Multiplatform", class: "tt-c" },
      { text: "Jetpack Compose", class: "tt-c" },
      { text: "KMP · Android · iOS", class: "tt-p" },
      { text: "Clean MVVM", class: "tt-p" },
      { text: "Custom Animations", class: "tt-o" },
      { text: "Internal Library", class: "tt-o" }
    ]
  },
  {
    year: "2023",
    month: "Jun – Aug",
    duration: "3 months",
    role: "Android Developer Intern",
    company: "Pokee",
    location: "Remote",
    isActive: false,
    badges: [
      { text: "Internship", class: "tb-intern" }
    ],
    bullets: [
      "Built a social connection app from scratch - 30+ custom layouts, 25+ API routes integrated, and a full MVVM + Hilt architecture set up before the senior team could finish their morning standup.",
      "Shipped Firebase Auth, real-time Crashlytics monitoring, and a user profile system with active feedback loops - production-quality on the first intern project."
    ],
    tags: [
      { text: "Kotlin", class: "tt-c" },
      { text: "Jetpack Compose", class: "tt-c" },
      { text: "MVVM · Hilt", class: "tt-p" },
      { text: "Firebase", class: "tt-o" },
      { text: "REST API", class: "tt-o" }
    ]
  }
];

const ACHIEVEMENTS_DATA = [
  {
    icon: "🏆",
    title: "AIR 101 · Zonal Rank 3",
    description: "National Cyber Olympiad (NCO) - top national ranking in cyber / computing competition."
  },
  {
    icon: "🌍",
    title: "App Sold Internationally",
    description: "ScrollBlock was acquired internationally - built, shipped, and sold entirely by Vishal while in college."
  },
  {
    icon: "🚀",
    title: "Google Jetpack Compose Camp",
    description: "Completed Google-organized Android Jetpack Compose Camp - certified in modern Android UI."
  },
  {
    icon: "⭐",
    title: "4k+ Play Store Installs",
    description: "Combined installs across Snaptick (1k+, 4.6★) and Git Coach (3k+, 4.8★) within months of launch."
  }
];
