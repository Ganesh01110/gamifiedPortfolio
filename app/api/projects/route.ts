import { NextResponse } from 'next/server';
import projectsData from '@/src/data/projects.json';

/**
 * @openapi
 * /api/projects:
 *   get:
 *     summary: Retrieve project list
 *     description: Returns a curated list of portfolio projects with their tech stacks and descriptions.
 *     responses:
 *       200:
 *         description: Success
 */
export async function GET() {
    return NextResponse.json(projectsData);
}
