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

export default async function handler(req, res) {
    res.setHeader('Content-Type', register.contentType);

    // Example of tracking (In a real app, you'd call these from other components)
    // pageViews.inc({ page: '/' }); 

    res.send(await register.metrics());
}
