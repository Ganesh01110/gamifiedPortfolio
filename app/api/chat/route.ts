import { NextRequest, NextResponse } from 'next/server';
import profileData from '@/src/data/profile.json';
import projectsData from '@/src/data/projects.json';
import skillsData from '@/src/data/skills.json';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

// Fallback intelligent intent matcher for 100% reliable offline operation
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

    // Who is Ganesh / About
    if (q.includes('who') || q.includes('about') || q.includes('introduce') || q.includes('bio') || q.includes('tell me about you')) {
        return `Ganesh Sahu is a ${profileData.title} with a Master's degree from Aurora's PG College (2022-2024). He specializes in modern web architectures, Next.js, React, Node.js, and agentic development, focusing on high performance, clean code, and scalable systems.`;
    }

    // Skills / Tech stack
    if (q.includes('skill') || q.includes('tech') || q.includes('stack') || q.includes('language') || q.includes('frontend') || q.includes('backend') || q.includes('devops')) {
        const frontendSkills = skillsData.frontend.slice(0, 6).join(', ');
        const backendSkills = skillsData.backend.slice(0, 6).join(', ');
        const devopsSkills = skillsData.devops.join(', ');
        return `Ganesh's core technical stack includes:\n• Frontend: ${frontendSkills}\n• Backend: ${backendSkills}\n• DevOps & Cloud: ${devopsSkills}`;
    }

    // Projects / HMS
    if (q.includes('project') || q.includes('work') || q.includes('hospital') || q.includes('game') || q.includes('portfolio') || q.includes('hms')) {
        const projectNames = projectsData.map(p => `• ${p.name}: ${p.description}`).join('\n');
        return `Here are key projects built by Ganesh:\n\n${projectNames}\n\nNotable highlight: Hospital Management System (HMS) with role-based access, real-time WebSocket notifications, and automated server CLOSE_WAIT connection optimization.`;
    }

    // Experience / Taksh
    if (q.includes('experience') || q.includes('company') || q.includes('taksh') || q.includes('intern') || q.includes('job') || q.includes('history')) {
        const exp = profileData.experience[0];
        return `Ganesh has ${profileData.TotalExperience}+ years of professional experience. At ${exp.company} (${exp.duration}) as a ${exp.role}, he led the development of a comprehensive Hospital Management System, implemented secure auth, RESTful APIs, real-time WebSockets, and resolved critical CLOSE_WAIT connection bottlenecks with custom automation scripts.`;
    }

    // Education
    if (q.includes('education') || q.includes('college') || q.includes('degree') || q.includes('study') || q.includes('university')) {
        const edu = profileData.education[0];
        return `Ganesh completed his ${edu.degree} at ${edu.institution} (${edu.year}), with a core curriculum focusing on software engineering, algorithms, and system design.`;
    }

    // Contact / Email / Socials
    if (q.includes('contact') || q.includes('email') || q.includes('hire') || q.includes('reach') || q.includes('phone') || q.includes('linkedin') || q.includes('github') || q.includes('resume')) {
        return `You can reach Ganesh directly via:\n• Email: ${profileData.contact.email}\n• Phone: ${profileData.contact.phone}\n• LinkedIn: ${profileData.socials.linkedin}\n• GitHub: ${profileData.socials.github}\n• Resume: Available via the "Resume" button on the hero section!`;
    }

    // Default polite grounded response
    return `Ganesh Sahu is a ${profileData.title} proficient in React, Next.js, Node.js, and TypeScript. You can ask me about his work experience, top projects (like HMS or Gamified Portfolio), technical skills, or how to contact him.`;
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
                const systemPrompt = `You are Ganesh Sahu's dedicated Portfolio AI Assistant. You must speak in a professional, friendly, and concise first/third-person supportive tone.
Your knowledge is STRICTLY constrained to Ganesh Sahu's background:
- Name: ${profileData.name}
- Title: ${profileData.title}
- Bio: ${profileData.bio}
- Tagline: ${profileData.tagline}
- Experience: ${JSON.stringify(profileData.experience)}
- Education: ${JSON.stringify(profileData.education)}
- Skills: ${JSON.stringify(skillsData)}
- Projects: ${JSON.stringify(projectsData)}
- Contact: Email: ${profileData.contact.email}, Phone: ${profileData.contact.phone}, LinkedIn: ${profileData.socials.linkedin}, GitHub: ${profileData.socials.github}

CRITICAL RULES:
1. ONLY answer questions about Ganesh Sahu, his technical skills, projects, experience, education, and contact channels.
2. If the user asks about unrelated topics (e.g. general coding tasks, recipes, politics, weather, math, other people, trivia), politely refuse and state: "I'm Ganesh's Portfolio Assistant and can only answer questions about Ganesh Sahu's background, skills, and projects."
3. Keep answers concise, informative, and formatted with clean bullet points where appropriate.`;

                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [
                            { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${lastUserMessage}` }] }
                        ],
                        generationConfig: {
                            temperature: 0.3,
                            maxOutputTokens: 300
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
