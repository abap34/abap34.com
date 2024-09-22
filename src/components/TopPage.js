import React from 'react';
import About from './About';
import Introduction from './Introduction';

export default function TopPage() {

    return (
        <main className="container px-4 py-8 max-w-6xl mx-auto">
            <Introduction />
            <About />
        </main>
    );
}