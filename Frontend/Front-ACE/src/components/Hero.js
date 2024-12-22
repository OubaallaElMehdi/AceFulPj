import React from 'react';

function Hero() {
    return (
        <div
            className="hero bg-dark text-white text-center d-flex flex-column justify-content-center align-items-center"
            style={{
                height: '100vh',
                background: 'url(https://via.placeholder.com/1920x1080) no-repeat center center/cover',
            }}
        >
            <h1 className="display-4 fw-bold">Welcome to Trajectory App</h1>
            <p className="lead">Track, analyze, and visualize your data with ease.</p>
            <div className="mt-4">
                <a href="#features" className="btn btn-primary btn-lg me-3">Explore Features</a>
                <a href="#contact" className="btn btn-outline-light btn-lg">Contact Us</a>
            </div>
        </div>
    );
}

export default Hero;
