# E-Stream Premium

A high-performance IPTV platform built with React, Vite, and Tailwind CSS. Featuring resilient caching, immersive playback controls, and multi-device support.

![E-Stream Interface Preview](public/media/preview.jpg)

## Features

- **High-Performance Playback:** Custom-engineered HLS player with DVR capabilities and picture-in-picture support.
- **Smart Caching:** Local caching layer ensuring continuous operation during network instability.
- **Dynamic Content:** Real-time country and language categorization with deep link support.
- **Responsive Design:** Optimized layout for mobile, tablet, and desktop viewports.
- **SEO & Meta:** Server-side metadata injection for rich social sharing.

## Tech Stack

- **Frontend:** React 19, Motion, Tailwind CSS 4.0, Lucide Icons
- **Backend:** Express, Vite Middleware (Development)
- **Deployment:** Standalone Node.js server with bundled production assets

## Local Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```

## Production

To build and run the production server:

```bash
npm run build
npm start
```

## Environment

Configuration is handled via environment variables. See `.env.example` for required keys (if applicable).
