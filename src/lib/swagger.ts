import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Gamified Portfolio API',
            version: '1.0.0',
            description: 'API Documentation for the Gamified Portfolio services (Observability, Webhooks, etc.)',
            contact: {
                name: 'Ganesh Sahu',
                email: 'ganeshsahu0108@gmail.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development Server',
            },
            {
                url: 'https://gamified-portfolio-devops.vercel.app/',
                description: 'Production Server',
            },
        ],
    },
    // Look for annotations in these files
    apis: ['./app/api/**/*.js', './app/api/**/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
