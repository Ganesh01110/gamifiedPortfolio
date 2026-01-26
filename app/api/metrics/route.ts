import { register, apiHits } from '@/src/lib/metrics';
import { NextResponse } from 'next/server';

/**
 * @openapi
 * /api/metrics:
 *   get:
 *     summary: Retrieve Prometheus metrics
 *     description: Returns real-time observability data including page views and game starts in Prometheus format.
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           text/plain:
 *             example: "# HELP portfolio_api_hits_total Total number of hits to the metrics endpoint..."
 */
export async function GET() {
    console.log('[API] /api/metrics called');

    // Automatically track whenever this endpoint is called
    apiHits.inc();

    const metrics = await register.metrics();
    return new NextResponse(metrics, {
        headers: {
            'Content-Type': register.contentType,
        },
    });
}

/**
 * @openapi
 * /api/contact:
 *   post:
 *     summary: Send a contact form email
 *     description: Submits a message to the portfolio owner using the Resend service.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, message]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email sent successfully
 */
