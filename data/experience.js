const EXPERIENCE_DATA = [
  {
    year: "2025",
    month: "Jun",
    duration: "Present",
    role: "Android Security Engineer (SDE-1)",
    company: "DailyRounds (Marrow)",
    location: "Bangalore · Hybrid",
    isActive: true, // Adds the pulsing glow effect
    badges: [
      { text: "Current", class: "tb-now" },
      { text: "Security", class: "tb-lead" }
    ],
    bullets: [
      "I own the runtime security (RASP) for the main app, protecting against reverse engineering, tampering, rooting, hooking, and AI automation attacks using commercial RASP and obfuscation tooling, Ghidra and Jadx, and native code protection.",
      "I built encryption using native C++ (NDK/JNI) with HMAC, and added Google Play Integrity for app attestation.",
      "I wrote 10+ security research documents the team uses as reference, and ran a Frida workshop to share runtime attack knowledge across the team."
    ],
    tags: [
      { text: "RASP", class: "tt-r" },
      { text: "Reverse Engineering", class: "tt-o" },
      { text: "Ghidra", class: "tt-o" },
      { text: "Jadx", class: "tt-o" },
      { text: "Native C++ (NDK/JNI)", class: "tt-c" },
      { text: "HMAC", class: "tt-c" },
      { text: "Play Integrity", class: "tt-p" },
      { text: "Obfuscation", class: "tt-p" }
    ]
  },
  {
    year: "2024",
    month: "Sep – May",
    duration: "9 months",
    role: "SDE Intern",
    company: "DailyRounds (Marrow)",
    location: "Remote",
    isActive: false,
    badges: [
      { text: "Internship", class: "tb-intern" }
    ],
    bullets: [
      "I built an internal sales app with Kotlin Multiplatform (KMP), sharing a single codebase across Android and iOS using Koin, Ktor, Datastore, and Jetpack Compose.",
      "I built an internal event logging app used daily by QA and developers to verify event logs across Firebase and Mixpanel, cutting event checking from 10-15 minutes to under a minute.",
      "I worked on a production business app and a custom app installer tool for the team."
    ],
    tags: [
      { text: "Kotlin Multiplatform", class: "tt-c" },
      { text: "Jetpack Compose", class: "tt-c" },
      { text: "Koin · Ktor", class: "tt-p" },
      { text: "Datastore", class: "tt-p" },
      { text: "Firebase · Mixpanel", class: "tt-o" }
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
      "I created an Android app from scratch that connects individuals for dating or friendship, using Kotlin with 30+ custom layouts and 25+ API routes for an engaging user experience.",
      "I designed a clean app structure using MVVM architecture, Hilt for dependency management, and Navigation Component for smooth navigation.",
      "I enhanced app security with Firebase Authentication and kept it stable using Firebase Crashlytics for quick issue resolution."
    ],
    tags: [
      { text: "Kotlin", class: "tt-c" },
      { text: "MVVM · Hilt", class: "tt-p" },
      { text: "Navigation Component", class: "tt-p" },
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
