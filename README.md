<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/tv.svg" width="80" alt="E-Stream Logo">
  
  # E-Stream Premium
  
  **A high-performance IPTV platform with resilient caching and immersive playback.**
  
  [![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://react.dev)
  [![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)

</div>

## Overview

E-Stream is a production-grade IPTV client designed for clarity, speed, and resilience. It features a custom-engineered video engine with smart HLS handling, a 48-hour intelligent caching layer, and a "humanized" user interface that prioritizes content immersion.

<div align="center">
  <img src="media/preview.jpg" alt="E-Stream Interface Preview" style="border-radius: 24px; max-width: 100%; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
</div>

## Key Features

- **Resilient Caching:** Intelligent 48-hour caching system that ensures the platform remains operational even during API downtime.
- **Immersive Playback:** Custom video player with automatic control fading, DVR capabilities, and seamless PiP support.
- **Modern UI Architecture:** Skeleton loading states ("Glastonbury style") and smooth motion-based transitions.
- **Universal Accessibility:** Fully responsive design that adapts to mobile, desktop, and tablet viewports.
- **Push Notification Ready:** Integrated infrastructure for system-level alerts and "Now Playing" updates.

## Humanized Project Structure

The project follows a modular, developer-centric architecture:
- `src/api.ts`: Resilient data fetching and caching logic.
- `src/components/Skeleton.tsx`: Custom skeleton screens for high-quality loading experiences.
- `media/`: Centralized high-quality visual assets.
- `.vscode/`: Optimized environment settings for immediate productivity.

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Launch Development:**
   ```bash
   npm run dev
   ```

3. **Production Build:**
   ```bash
   npm run build
   ```

## Technical Excellence

Built with **React 19**, **Motion**, and **Tailwind CSS 4.0**, E-Stream utilizes a custom Express backend to proxy streams safely and inject dynamic SEO metadata for shared links.
