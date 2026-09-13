import { NextRequest, NextResponse } from 'next/server';
import profileData from '@/src/data/profile.json';
import projectsData from '@/src/data/projects.json';
import skillsData from '@/src/data/skills.json';

// Intelligent grounded response engine for 100% reliable responses
function getLocalGroundedResponse(prompt: string): string {
    const q = prompt.toLowerCase();

    // Check for off-topic queries
    const offTopicKeywords = [
        'recipe', 'cook', 'politics', 'president', 'weather', 'stock',
        'movie', 'song', 'joke', 'poem', 'write a story', 'who won', 'crypto', 'bitcoin'
    ];
    if (offTopicKeywords.some(k => q.includes(k))) {
        return "I am Ganesh Sahu's Portfolio Assistant. I can only assist you with questions regarding Ganesh's background, technical skills, projects, experience, and contact information. Feel free to ask about his work!";
    }

    // 1. Hospital Management System (HMS)
    if (q.includes('hms') || q.includes('hospital')) {
        const exp = profileData.experience[0];
        const hms = exp.project;
        return `🏥 **Hospital Management System (HMS)**\n\n` +
            `• **Overview**: Developed at ${exp.company} (${exp.duration}) by Ganesh as ${exp.role}.\n` +
            `• **Key Features**:\n` +
            `  - Role-based access control for doctors, receptionists, and patients.\n` +
            `  - Real-time WebSocket notifications and live scheduling.\n` +
            `  - Financial billing tracking and record management.\n` +
            `  - **Performance Engineering**: Resolved critical server \`CLOSE_WAIT\` socket leak bottlenecks and implemented automated recovery scripts.\n` +
            `• **Tech Stack**: React, Redux, Node.js, Express.js, SQL, WebSockets, Python, TailwindCSS.\n` +
            `• **Repository**: ${exp.github}\n` +
            `• **Demo/Post**: [View LinkedIn Demo](${exp.demo})`;
    }

    // 2. Sworm / Simulation
    if (q.includes('sworm') || q.includes('simulation') || q.includes('swarm')) {
        const sworm = projectsData.find(p => p.id === 'project-1') || projectsData[0];
        return `🌐 **${sworm.name}**\n\n` +
            `• **Description**: ${sworm.description}\n` +
            `• **Problem Solved**: ${sworm.problem}\n` +
            `• **Tech Stack**: ${sworm.techStack.join(', ')}\n` +
            `• **Repository**: ${sworm.repoLink}`;
    }

    // 3. Gamified Portfolio
    if (q.includes('gamified') || q.includes('rpg') || (q.includes('game') && !q.includes('parking'))) {
        const game = projectsData.find(p => p.id === 'project-2') || projectsData[1];
        return `🎮 **${game.name}**\n\n` +
            `• **Description**: ${game.description}\n` +
            `• **Features**: 2D Phaser battle scene, custom mobile controls, sound effects, and character selection.\n` +
            `• **Tech Stack**: ${game.techStack.join(', ')}\n` +
            `• **Live Demo**: ${game.liveLink}\n` +
            `• **Repository**: ${game.repoLink}`;
    }

    // 4. Fitness Tracker PWA
    if (q.includes('fitness') || q.includes('workout') || q.includes('pwa')) {
        const fit = projectsData.find(p => p.id === 'project-3') || projectsData[2];
        return `💪 **${fit.name}**\n\n` +
            `• **Description**: ${fit.description}\n` +
            `• **Key Features**: Workout streak visualization, health metrics, supplement tracking, PWA offline caching.\n` +
            `• **Tech Stack**: ${fit.techStack.join(', ')}\n` +
            `• **Live URL**: ${fit.liveLink}\n` +
            `• **Repository**: ${fit.repoLink}`;
    }

    // 5. Smart Car Parking System
    if (q.includes('parking') || q.includes('car') || q.includes('spring boot')) {
        const park = projectsData.find(p => p.id === 'project-4') || projectsData[3];
        return `🚗 **${park.name}**\n\n` +
            `• **Description**: ${park.description}\n` +
            `• **Highlights**: Real-time parking slot occupancy, automated fee calculation, entry/exit gates, and admin dashboard.\n` +
            `• **Tech Stack**: ${park.techStack.join(', ')}\n` +
            `• **Repository**: ${park.repoLink}`;
    }

    // 6. Library Management System
    if (q.includes('library') || q.includes('django') || q.includes('book')) {
        const lib = projectsData.find(p => p.id === 'project-5') || projectsData[4];
        return `📚 **${lib.name}**\n\n` +
            `• **Description**: ${lib.description}\n` +
            `• **Key Features**: Comprehensive CRUD for books/members, borrowing lifecycle, overdue tracking, and PostgreSQL database.\n` +
            `• **Tech Stack**: ${lib.techStack.join(', ')}\n` +
            `• **Repository**: ${lib.repoLink}`;
    }

    // 7. Docker & DevOps
    if (q.includes('docker') || q.includes('container') || q.includes('devops') || q.includes('ci/cd') || q.includes('pipeline')) {
        const dock = projectsData.find(p => p.id === 'project-6') || projectsData[5];
        return `🐳 **${dock.name} & DevOps Architecture**\n\n` +
            `• **Setup**: Multi-service Docker Compose orchestration, Next.js Standalone optimization, and GitHub Actions CI/CD pipelines.\n` +
            `• **Observability**: Real-time Prometheus metrics endpoint (\`/api/metrics\`) and Grafana monitoring stack.\n` +
            `• **Tech Stack**: ${dock.techStack.join(', ')}`;
    }

    // 8. General Projects Overview
    if (q.includes('project') || q.includes('work') || q.includes('portfolio') || q.includes('built') || q.includes('apps')) {
        const list = projectsData.map(p => `• **${p.name}** (${p.category}): ${p.description}`).join('\n\n');
        return `Here are the key featured projects created by Ganesh Sahu:\n\n${list}\n\n• **Hospital Management System (HMS)**: Enterprise role-based healthcare portal with WebSockets & CLOSE_WAIT automation.\n\nAsk me about any specific project for details and links!`;
    }

    // 9. Experience / Taksh Software
    if (q.includes('experience') || q.includes('company') || q.includes('taksh') || q.includes('intern') || q.includes('job') || q.includes('history')) {
        const exp = profileData.experience[0];
        return `Ganesh has **${profileData.TotalExperience}+ years** of software engineering experience.\n\n` +
            `• **Company**: ${exp.company}\n` +
            `• **Role**: ${exp.role} (${exp.duration})\n` +
            `• **Key Contribution**: Led the development of an enterprise Hospital Management System, resolved server socket leaks (\`CLOSE_WAIT\`) through automated monitoring, and built real-time WebSocket communication pipelines.`;
    }

    // 10. Skills
    if (q.includes('skill') || q.includes('stack') || q.includes('language') || q.includes('frontend') || q.includes('backend')) {
        return `🛠️ **Ganesh's Core Technical Skills**:\n\n` +
            `• **Frontend**: ${skillsData.frontend.join(', ')}\n` +
            `• **Backend**: ${skillsData.backend.join(', ')}\n` +
            `• **DevOps & Cloud**: ${skillsData.devops.join(', ')}\n` +
            `• **Specializations**: System Design, Microservices, Agentic AI Workflows, WebSockets, High-Performance UI.`;
    }

    // 11. Who is Ganesh / Bio
    if (q.includes('who') || q.includes('about') || q.includes('introduce') || q.includes('bio') || q.includes('ganesh')) {
        return `👋 **Ganesh Sahu** is a **${profileData.title}** based in India.\n\n` +
            `• **Bio**: ${profileData.bio}\n` +
            `• **Education**: ${profileData.education[0].degree} from ${profileData.education[0].institution} (${profileData.education[0].year})\n` +
            `• **Tagline**: "${profileData.tagline}"\n\n` +
            `Feel free to ask about his projects, skills, or experience!`;
    }

    // 12. Contact / Resume
    if (q.includes('contact') || q.includes('email') || q.includes('hire') || q.includes('reach') || q.includes('phone') || q.includes('linkedin') || q.includes('github') || q.includes('resume')) {
        return `📬 **Get in touch with Ganesh**:\n\n` +
            `• **Email**: ${profileData.contact.email}\n` +
            `• **Phone/WhatsApp**: ${profileData.contact.phone}\n` +
            `• **LinkedIn**: ${profileData.socials.linkedin}\n` +
            `• **GitHub**: ${profileData.socials.github}\n` +
            `• **Resume**: Click the "Resume" button on the hero section to view/download!`;
    }

    // Default polite response
    return `Hello! I'm Ganesh's AI Assistant. I can tell you about:\n` +
        `• **Featured Projects**: Hospital Management System (HMS), Sworm Simulation, Gamified Portfolio, Fitness PWA, Car Parking System\n` +
        `• **Experience**: Full Stack Developer at Taksh Software\n` +
        `• **Skills & Tech Stack**: Next.js, React, TypeScript, Node.js, Spring Boot, WebSockets, Docker\n` +
        `• **Contact & Resume details**\n\n` +
        `What would you like to know?`;
}

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
        }

        const lastUserMessage = messages[messages.length - 1]?.content || '';

        // Check if Gemini API key is available
        const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

        if (geminiKey) {
            try {
                const systemPrompt = `You are Ganesh Sahu's dedicated Portfolio AI Assistant. You speak in a helpful, knowledgeable, and polite tone.
Your knowledge is STRICTLY constrained to Ganesh Sahu's background:
- Name: ${profileData.name}
- Title: ${profileData.title}
- Bio: ${profileData.bio}
- Tagline: ${profileData.tagline}
- Experience: ${JSON.stringify(profileData.experience)}
- Education: ${JSON.stringify(profileData.education)}
- Skills: ${JSON.stringify(skillsData)}
- All Projects: ${JSON.stringify(projectsData)}
- Contact: Email: ${profileData.contact.email}, Phone: ${profileData.contact.phone}, LinkedIn: ${profileData.socials.linkedin}, GitHub: ${profileData.socials.github}

CRITICAL RULES:
1. When asked about the Hospital Management System (HMS), explain the role-based system, real-time doctor notifications with WebSockets, and resolving CLOSE_WAIT socket issues at Taksh Software.
2. When asked about any project in the project section (Sworm Simulation, Gamified Portfolio, Fitness Tracker PWA, Smart Car Parking System, Library Management, Docker DevOps), give clear details about its features and tech stack.
3. If the user asks about unrelated topics (e.g. recipes, politics, weather, math, general non-portfolio queries), politely refuse: "I'm Ganesh's Portfolio Assistant and can only answer questions about Ganesh Sahu's background, skills, and projects."
4. Format responses cleanly with bullet points where helpful.`;

                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [
                            { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${lastUserMessage}` }] }
                        ],
                        generationConfig: {
                            temperature: 0.2,
                            maxOutputTokens: 400
                        }
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                        return NextResponse.json({ reply: text });
                    }
                }
            } catch (err) {
                console.warn('[Chatbot API] External LLM failed, using grounded fallback engine:', err);
            }
        }

        // Fallback to grounded intelligent engine
        const fallbackReply = getLocalGroundedResponse(lastUserMessage);
        return NextResponse.json({ reply: fallbackReply });
    } catch (error) {
        console.error('[Chatbot API] Error:', error);
        return NextResponse.json({ reply: "I'm currently experiencing a momentary hiccup. Feel free to reach Ganesh directly at ganeshsahu0108@gmail.com!" }, { status: 500 });
    }
}
