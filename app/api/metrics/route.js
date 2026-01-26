import { register, apiHits } from '@/src/lib/metrics';


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
 *             example: "# HELP portfolio_page_views_total Total number of page views..."
 */
export default async function handler(req, res) {
    res.setHeader('Content-Type', register.contentType);

    // Automatically track whenever this endpoint is called
    apiHits.inc();

    res.send(await register.metrics());
}
