import { NextResponse } from 'next/server';
import { sendEmail } from '@/src/actions/sendEmail';

/**
 * Rest API wrapper for the Contact Form Server Action
 * This allows documenting it in Swagger
 */
export async function POST(req: Request) {
    console.log('[API] /api/contact called');
    try {
        const body = await req.json();
        const formData = new FormData();
        formData.append('name', body.name || '');
        formData.append('email', body.email || '');
        formData.append('message', body.message || '');

        const result = await sendEmail(null, formData);

        if (!result.success) {
            return NextResponse.json(result, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('[API] Contact Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
