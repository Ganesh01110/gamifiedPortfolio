import * as Phaser from 'phaser';

export const gameConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#000000',
    // Enable DOM Container to allow HTML elements (like GIFs) to overlay the canvas
    // This is crucial for our hybrid rendering approach (Physics Sprite + DOM Image)
    dom: {
        createContainer: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 300 },
            debug: false,
        },
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720
    },
    audio: {
        disableWebAudio: false
    },
    input: {
        touch: {
            capture: false
        }
    }
};
