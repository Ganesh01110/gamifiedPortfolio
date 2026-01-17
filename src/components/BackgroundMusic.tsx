'use client';

import React from 'react';

export const BackgroundMusic = () => {
    return (
        <audio autoPlay loop style={{ display: 'none' }}>
            {/* <source src="/assets/background-music.mp3" type="audio/mpeg" /> */}
        </audio>
    );
};
