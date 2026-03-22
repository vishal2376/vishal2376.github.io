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
      "I own the end-to-end security of Marrow - runtime tamper detection, Frida/Xposed hook detection, and RASP systems that respond to attacks in real time.",
      "Offensive security work: I reverse engineer the app with Ghidra & Jadx, find the attack surface, patch it, and ship hardened code before anyone outside notices.",
      "I build content protection systems to prevent unauthorized recording, screenshotting, and redistribution of premium course material.",
      "APK hardening, certificate pinning, bytecode-level obfuscation - I raise the cost of attacks high enough that it's just not worth trying."
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
      "I built an internal KMP app for managing sales and availability - one Clean MVVM codebase running on both Android and iOS. Zero duplicated business logic.",
      "I created an internal Android library from scratch for synchronized event logging, making QA testing dramatically faster with no manual correlation overhead.",
      "I shipped better UI and smooth custom animations in the Marrow app using modern Jetpack Compose APIs."
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
      "I built a social connection app from scratch - 30+ custom layouts, 25+ API routes integrated, full MVVM + Hilt architecture. Got it to production quality within the first internship project.",
      "I shipped Firebase Auth, real-time Crashlytics monitoring, and a user profile system with feedback loops."
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
    description: "National Cyber Olympiad (NCO) - top national ranking in cyber and computing."
  },
  {
    icon: "🌍",
    title: "App Sold Internationally",
    description: "ScrollBlock was acquired internationally. I built, shipped, and sold it solo while still in college."
  },
  {
    icon: "🚀",
    title: "Google Jetpack Compose Camp",
    description: "Completed Google's Android Jetpack Compose Camp - certified in modern Android UI development."
  },
  {
    icon: "⭐",
    title: "4k+ Play Store Installs",
    description: "Combined installs across Snaptick (1k+, 4.6 stars) and Git Coach (3k+, 4.8 stars) within months of launch."
  }
];
