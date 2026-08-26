import React, { useEffect, useState } from 'react';

/**
 * ScrollBlurBottom Component
 * 
 * Creates a fixed progressive blur (fog effect) anchored at bottom: 0 across Desktop, Tablet, and Mobile.
 * Uses -webkit-backdrop-filter and backdrop-filter without isolation boundaries.
 */
export default function ScrollBlurBottom() {
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY || window.pageYOffset;
            setIsActive(currentScrollY > 5);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div 
            className={`scroll-blur-bottom ${isActive ? 'active' : ''}`}
            aria-hidden="true"
        >
            <div className="scroll-blur-layer layer-1"></div>
            <div className="scroll-blur-layer layer-2"></div>
            <div className="scroll-blur-layer layer-3"></div>
            <div className="scroll-blur-layer layer-4"></div>
        </div>
    );
}
