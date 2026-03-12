# Online Voting System

A stunning, frontend-only web application for managing college club elections. Built completely without a backend, utilizing local browser storage to persist voting data securely and beautifully.

## Features
- **Bright & Animated UI**: Features a custom-built Glassmorphism 3.0 aesthetic over a constantly animating, vibrant gradient mesh.
- **Double-Vote Protection**: Built-in Javascript verification ensuring one vote per Register Number.
- **Real-time Results Page**: Includes an integrated Chart.js implementation mapping live voting results.
- **Admin Dashboard**: Secured portal (`admin` / `admin123`) to view all recent voters and securely Reset the election cycle.
- **Serverless**: Zero backend configuration required.

## Live Deployment (Vercel)
This project is explicitly structured to be instantly deployable on **Vercel** with zero configuration required.

### How to Deploy to Vercel
1. Fork or upload this repository to your GitHub account.
2. Go to [Vercel.com](https://vercel.com) and log in with your GitHub account.
3. Click **Add New Project**.
4. Import your newly created repository.
5. In the "Configure Project" screen, **leave all settings as their defaults** (Framework Preset: Other).
6. Click **Deploy**.

Vercel will automatically host the `index.html` root file and serve the CSS/JS files flawlessly.

## Running Locally
Because this project does not rely on a backend server, you can run it simply by opening `index.html` in any modern web browser. 

---
*Built with HTML, CSS, JavaScript, Chart.js, and Canvas-Confetti.*
