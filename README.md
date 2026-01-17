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

- **Framework:** [Next.js 14+](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Game Engine:** [Phaser.js](https://phaser.io/)
- **Validation:** [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/gamified-portfolio.git
    cd gamified-portfolio
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

## 📁 Project Structure

```bash
├── app/                  # Next.js App Router
├── public/               # Static assets (images, audio)
├── src/
│   ├── actions/          # Server actions (Email)
│   ├── components/       # Reusable UI components
│   ├── data/             # JSON data files (profile, projects, etc.)
│   ├── store/            # Zustand stores
│   ├── views/
│   │   ├── gamified/     # Game logic & Phaser scenes
│   │   └── normal/       # Professional portfolio components
```

## 🧪 Verification

To ensure everything is working correctly, you can run:

```bash
# Run Linting
npm run lint

# Build Project
npm run build
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
