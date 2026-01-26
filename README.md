# 🎮 Gamified Portfolio

An interactive, dual-mode portfolio website built with **Next.js**, **Phaser.js**, and **Framer Motion**. It features a standard "Professional View" for recruiters and an immersive "Gamified View" where visitors can play as different developer archetypes (Painter, Architect, DevOps Wizard) and battle bugs to reveal projects.

## ✨ Features

### 👔 Professional View
- **Clean Responsive Design:** Built with Tailwind CSS for a sleek, modern look.
- **Dynamic Content:** Profile, skills, and projects loaded from JSON data.
- **Contact Form:** Functional form with Zod validation.
- **Resume Download:** Direct link to download your resume.

### 🕹️ Gamified Mechanics
- **Character Selection:** Choose your class with unique stats and stunning visual previews.
- **Story Mode:** Interactive narrative with a typewriter effect and immersive transitions.
- **Advanced Battle System:** Real-time combat scene with sophisticated monster AI.
  - **State Machine AI:** Monsters chase, prepare attacks, and defend.
  - **Dynamic Combat:** Damage syncing, hit effects, and boss-specific random attack modes.
  - **Hero Abilities:** Dodge invulnerability and class-specific attack animations.
- **Enhanced Reward System:** Level completion spawns an interactive chest on a themed "Level Clear" screen. Opening the chest reveals a project "Knowledge Scroll" with carousel mockups and external links.

## 🛠️ Tech Stack

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Game Engine:** [Phaser.js 3.90+](https://phaser.io/)
- **Testing:** [Vitest](https://vitest.dev/) & [Happy-DOM](https://github.com/capricorn86/happy-dom)
- **Infrastructure:** [Terraform](https://www.terraform.io/) (Vercel Provider)
- **CI/CD:** GitHub Actions with Snyk & Docker

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ installed.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Ganesh01110/gamifiedPortfolio.git
    cd gamifiedPortfolio
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```

4.  **Fresh Dev Run (Clear Cache):**
    ```bash
    npm run dev:fresh
    ```

5.  **Open in Browser:**
    Navigate to `http://localhost:3000`.

## � Secondary Documentation

For a deeper dive into the technical architecture and pipeline, check out:

*   **[🧪 Automated Testing Guide](./src/test/tests.md)**: Details on Vitest integration, unit tests for email actions, theme stores, and data integrity audits.
*   **[🏗️ Professional DevOps Guide](./DEVOPS_GUIDE.md)**: A complete overview of the CI/CD pipeline, Docker containerization, Infrastructure-as-Code (Terraform), and Prometheus observability.

## �📁 Project Structure

```bash
├── .github/workflows/    # CI/CD Pipeline Definitions
├── terraform/            # Infrastructure-as-Code (Vercel)
├── app/                  # Next.js App Router & API Routes
├── public/               # Game assets (GIFs, audio, images)
├── src/
│   ├── actions/          # Server actions (Resend Email)
│   ├── components/       # Reusable React components
│   ├── data/             # Game configuration & Project metadata
│   ├── store/            # Global state (Theme/Character)
│   ├── test/             # Vitest test suites & documentation
│   ├── views/
│   │   ├── gamified/     # Phaser engine, scenes & entities
│   │   └── normal/       # Tailwind-driven profile components
```

## 🧪 Verification

To maintain high code quality and security, the following commands are available:

```bash
# Run Automated Tests
npm run test

# Run Linting
npm run lint

# Build Project
npm run build
```

---
*Note: This repository is part of a professional DevOps showcase. Secrets for Docker Hub, Snyk, and Vercel must be configured in GitHub Actions for full pipeline functionality.*

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
