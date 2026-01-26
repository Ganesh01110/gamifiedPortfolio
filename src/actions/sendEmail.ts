'use server';

import { Resend } from 'resend';
import { z } from 'zod';

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function sendEmail(prevState: unknown, formData: FormData) {
    const api_key_status = process.env.RESEND_API_KEY ? 'Present' : 'MISSING';
    console.log(`[ResendAction] Triggered. API Key check: ${api_key_status}`);

    const resend = new Resend(process.env.RESEND_API_KEY);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message'),
    };

    console.log('[ResendAction] Processing data:', { ...data, message: data.message?.toString().substring(0, 20) + '...' });

    const validatedFields = formSchema.safeParse(data);

    if (!validatedFields.success) {
        console.warn('[ResendAction] Validation Failed:', validatedFields.error.flatten().fieldErrors);
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to send email.',
        };
    }

    const { name, email, message } = validatedFields.data;

    try {
        if (!process.env.RESEND_API_KEY) {
            console.log('[ResendAction] SIMULATION MODE ACTIVE. No real email will be sent.');
            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            return { success: true, message: 'Email sent successfully! (Simulation)' };
        }

        console.log('[ResendAction] Attempting to send live email via Resend...');
        const response = await resend.emails.send({
            from: 'Portfolio Contact <onboarding@resend.dev>',
            to: 'ganeshsahu0108@gmail.com', // Replace with your email
            subject: `New Message from Portfolio: ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
        });

        console.log('[ResendAction] Resend API Response:', response);

        return { success: true, message: 'Email sent successfully!' };
    } catch (error) {
        console.error('[ResendAction] CRITICAL ERROR:', error);
        return {
            message: error instanceof Error ? error.message : 'Failed to send email. Please check your Resend configuration.',
        };
    }
}
