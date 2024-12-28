"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import Cookies from "js-cookie";

// Dynamically import the AnimatedBackground to prevent SSR
const AnimatedBackground = dynamic(() => import("./AnimatedBackground"), {
    ssr: false, // Disable server-side rendering for this component
});

export default function Home() {
    console.log(Cookies.get("loggedin"));

    return (
        <div
            className="home-container d-flex flex-column align-items-center justify-content-center vh-100"
            style={{ position: "relative", zIndex: 1 }}
        >
            {/* Animated Background */}
            <AnimatedBackground />

            {/* Content */}
            <h1 className="mb-4 text-primary fw-bold">Welcome to My App</h1>
            <Link href="/auth/login">
                <button className="btn btn-primary btn-lg animated-button">
                    Let's Start
                </button>
            </Link>

            {/* Styles for Button and Container */}
            <style jsx>{`
                .home-container {
                    color: #fff;
                    text-align: center;
                }

                .animated-button {
                    position: relative;
                    overflow: hidden;
                    border: none;
                    background: #1d3557;
                    color: #fff;
                    padding: 15px 30px;
                    font-size: 1.5rem;
                    font-weight: bold;
                    transition: all 0.3s ease;
                    box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
                }

                .animated-button:hover {
                    background: #457b9d;
                    box-shadow: 0px 10px 25px rgba(0, 0, 0, 0.4);
                    transform: scale(1.05);
                }

                .animated-button::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 300%;
                    height: 100%;
                    background: rgba(255, 255, 255, 0.1);
                    transform: skewX(-45deg);
                    transition: all 0.3s ease;
                }

                .animated-button:hover::before {
                    left: 100%;
                }
            `}</style>
        </div>
    );
}
