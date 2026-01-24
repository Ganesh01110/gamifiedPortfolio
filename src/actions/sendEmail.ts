'use server';

import { Resend } from 'resend';
import { z } from 'zod';

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
});

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(prevState: unknown, formData: FormData) {
    const validatedFields = formSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to send email.',
        };
    }

    const { name, email, message } = validatedFields.data;

    try {
        if (!process.env.RESEND_API_KEY) {
            console.log('Simulating email send (No API Key):', { name, email, message });
            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            return { success: true, message: 'Email sent successfully! (Simulation)' };
        }

        await resend.emails.send({
            from: 'Portfolio Contact <onboarding@resend.dev>',
            to: 'ganeshsahu0108@gmail.com', // Replace with your email
            subject: `New Message from Portfolio: ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
        });

        return { success: true, message: 'Email sent successfully!' };
    } catch (error) {
        console.error('Error sending email via Resend:', error);
        return {
            message: error instanceof Error ? error.message : 'Failed to send email. Please check your Resend configuration.',
        };
    }
}
