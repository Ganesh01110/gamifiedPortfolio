import { register, Counter } from 'prom-client';

// Shared Metrics Registry
// These are essentially the "Sensors" for your business logic
export const pageViews = new Counter({
    name: 'portfolio_page_views_total',
    help: 'Total number of page views',
    labelNames: ['page'],
});

export const gameStarts = new Counter({
    name: 'portfolio_game_starts_total',
    help: 'Total number of game sessions started',
});

export const apiHits = new Counter({
    name: 'portfolio_api_hits_total',
    help: 'Total number of hits to the metrics endpoint',
});

export { register };
