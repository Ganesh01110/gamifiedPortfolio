import { NextResponse } from 'next/server';

/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: System health check
 *     description: Returns the current operational status of the portfolio backend. Every professional DevOps project needs a health check!
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             example: { "status": "UP", "timestamp": "2024-01-01T00:00:00Z", "version": "1.0.0" }
 */
export async function GET() {
    return NextResponse.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV
    });
}
