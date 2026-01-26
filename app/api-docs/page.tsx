import swaggerSpec from '@/src/lib/swagger';
import SwaggerUIComponent from '@/src/components/SwaggerUI';

export const metadata = {
    title: 'API Documentation | Gamified Portfolio',
    description: 'OpenAPI Specification and Interactive Documentation',
};

export default function ApiDocs() {
    return <SwaggerUIComponent spec={swaggerSpec} />;
}
