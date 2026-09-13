import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: NextRequest) {
    try {
        const userAgent = req.headers.get('user-agent') || 'Unknown';
        const referer = req.headers.get('referer') || 'Direct';
        const forwardedFor = req.headers.get('x-forwarded-for') || 'Unknown IP';
        const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

        console.log(`[ResumeTrack] Resume button clicked by visitor at ${timestamp} | IP: ${forwardedFor} | UA: ${userAgent}`);

        // 1. Send Email Notification via Resend if configured
        if (process.env.RESEND_API_KEY) {
            try {
                const resend = new Resend(process.env.RESEND_API_KEY);
                await resend.emails.send({
                    from: 'Portfolio Alert <onboarding@resend.dev>',
                    to: 'ganeshsahu0108@gmail.com',
                    subject: `📄 Resume Viewed: ${timestamp} IST`,
                    text: `A visitor just opened your Resume on your portfolio!\n\n• Time: ${timestamp} IST\n• Referer: ${referer}\n• IP: ${forwardedFor}\n• User-Agent: ${userAgent}\n\nPortfolio URL: https://gamified-portfolio-one.vercel.app/`
                });
            } catch (emailErr) {
                console.warn('[ResumeTrack] Resend email dispatch failed:', emailErr);
            }
        }

        // 2. Send Discord Webhook ping if configured
        if (process.env.DISCORD_WEBHOOK) {
            try {
                await fetch(process.env.DISCORD_WEBHOOK, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        embeds: [
                            {
                                title: '📄 Resume Opened by Visitor!',
                                description: `**Time:** ${timestamp} IST\n**Referer:** ${referer}\n**IP:** \`${forwardedFor}\`\n**User-Agent:** \`${userAgent.substring(0, 100)}...\``,
                                color: 48867
                            }
                        ]
                    })
                });
            } catch (discErr) {
                console.warn('[ResumeTrack] Discord notification failed:', discErr);
            }
        }

        return NextResponse.json({ success: true, timestamp });
    } catch (error) {
        console.error('[ResumeTrack] Error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
