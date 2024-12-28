"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const AuthHeader = () => {
    const [dropdownOpen, setDropdownOpen] = useState(null);

    const handleDropdownToggle = (menu) => {
        setDropdownOpen(dropdownOpen === menu ? null : menu);
    };

    return (
        <header className="d-flex align-items-center justify-content-between p-3 bg-dark text-white">
            {/* Left Section: Logo and Navigation */}
            <div className="d-flex align-items-center gap-4">
                <Link href="/">
                    <Image
                        src="/assets/logo.png"
                        alt="Logo"
                        width={32}
                        height={32}
                        className="logo"
                    />
                </Link>
                <nav className="d-flex gap-4 align-items-center">
                    <div className="nav-item">
                        <Link href="/" className="nav-link dropdown-toggle">
                            Home
                        </Link>
                    </div>
                    <div className="nav-item dropdown">
                        <button
                            onClick={() => handleDropdownToggle("features")}
                            className="nav-link dropdown-toggle"
                        >
                            Features
                        </button>
                        {dropdownOpen === "features" && (
                            <div className="dropdown-menu">
                                <Link href="/features/feature1" className="dropdown-item">
                                    Feature 1
                                </Link>
                                <Link href="/features/feature2" className="dropdown-item">
                                    Feature 2
                                </Link>
                            </div>
                        )}
                    </div>
                    <div className="nav-item dropdown">
                        <button
                            onClick={() => handleDropdownToggle("about")}
                            className="nav-link dropdown-toggle"
                        >
                            About Us
                        </button>
                        {dropdownOpen === "about" && (
                            <div className="dropdown-menu">
                                <Link href="/about/team" className="dropdown-item">
                                    Team
                                </Link>
                                <Link href="/about/careers" className="dropdown-item">
                                    Careers
                                </Link>
                            </div>
                        )}
                    </div>
                </nav>
            </div>

            {/* Right Section: Login and Register */}
            <div className="d-flex align-items-center gap-2">
                <Link href="/auth/login" className="btn btn-outline-light btn-sm">
                    Sign in
                </Link>
                <Link href="/auth/register" className="btn btn-light btn-sm">
                    Sign up
                </Link>
            </div>

            {/* Custom Styles */}
            <style jsx>{`
                header {
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
                }

                .logo {
                    cursor: pointer;
                }

                .nav-link {
                    color: #fff;
                    text-decoration: none;
                    font-weight: 600;
                    padding: 0.5rem;
                    cursor: pointer;
                    transition: color 0.3s ease;
                }

                .nav-link:hover,
                .dropdown-toggle:hover {
                    color: #6c757d;
                }

                .btn-sm {
                    font-size: 0.875rem;
                }

                .btn-outline-light {
                    border: 1px solid #6c757d;
                }

                .btn-outline-light:hover {
                    background-color: #6c757d;
                    color: #fff;
                }

                .dropdown-menu {
                    position: absolute;
                    background-color: #343a40;
                    border: 1px solid #6c757d;
                    padding: 0.5rem;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                    z-index: 10;
                }

                .dropdown-item {
                    display: block;
                    color: #ffffff;
                    text-decoration: none;
                    padding: 0.5rem 1rem;
                    font-size: 0.9rem;
                }

                .dropdown-item:hover {
                    background-color: #495057;
                }
            `}</style>
        </header>
    );
};

export default AuthHeader;
