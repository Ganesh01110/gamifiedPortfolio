import { NextResponse } from 'next/server';
import profileData from '@/src/data/profile.json';

/**
 * @openapi
 * /api/profile:
 *   get:
 *     summary: Retrieve developer profile
 *     description: Exposes the developer's professional metadata (bio, name, social links) as JSON.
 *     responses:
 *       200:
 *         description: Success
 */
export async function GET() {
    return NextResponse.json(profileData);
}
