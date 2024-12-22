import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import AnimatedBackground from './components/AnimatedBackground';

function App() {
    return (
        <div>
            <AnimatedBackground />
            <Header />
            <Hero />
            <Features />
            <Footer />
        </div>
    );
}

export default App;
