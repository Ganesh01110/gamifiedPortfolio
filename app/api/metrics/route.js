import { register, Counter } from 'prom-client';

// Define Custom Metrics
const pageViews = new Counter({
    name: 'portfolio_page_views_total',
    help: 'Total number of page views',
    labelNames: ['page'],
});

const gameStarts = new Counter({
    name: 'portfolio_game_starts_total',
    help: 'Total number of game sessions started',
});

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

    // Example of tracking (In a real app, you'd call these from other components)
    // pageViews.inc({ page: '/' }); 

    res.send(await register.metrics());
}
