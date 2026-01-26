'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

interface ApiDocsPageProps {
    spec: any;
}

export default function ApiDocsPage({ spec }: ApiDocsPageProps) {
    return (
        <div className="bg-white min-h-screen">
            <SwaggerUI spec={spec} />
        </div>
    );
}
