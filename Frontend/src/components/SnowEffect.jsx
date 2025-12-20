import React, { useEffect, useState } from 'react';

const SnowEffect = () => {
    const [snowflakes, setSnowflakes] = useState([]);

    useEffect(() => {
        const count = 50;
        const newSnowflakes = Array.from({ length: count }).map((_, i) => ({
            id: i,
            left: Math.random() * 100 + '%',
            animationDuration: Math.random() * 3 + 2 + 's',
            animationDelay: Math.random() * 2 + 's',
            opacity: Math.random(),
            size: Math.random() * 5 + 5 + 'px'
        }));
        setSnowflakes(newSnowflakes);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            <style>
                {`
          @keyframes snowfall {
            0% {
              transform: translateY(-10vh) translateX(0);
            }
            100% {
              transform: translateY(100vh) translateX(20px);
            }
          }
        `}
            </style>
            {snowflakes.map((flake) => (
                <div
                    key={flake.id}
                    className="absolute bg-white rounded-full"
                    style={{
                        left: flake.left,
                        top: -20,
                        width: flake.size,
                        height: flake.size,
                        opacity: flake.opacity,
                        animation: `snowfall ${flake.animationDuration} linear infinite`,
                        animationDelay: flake.animationDelay,
                    }}
                />
            ))}
        </div>
    );
};

export default SnowEffect;
