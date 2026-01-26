'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

interface ApiDocsPageProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    spec: any;
}

export default function ApiDocsPage({ spec }: ApiDocsPageProps) {
    return (
        <div className="bg-white min-h-screen">
            <SwaggerUI spec={spec} />
        </div>
    );
}
