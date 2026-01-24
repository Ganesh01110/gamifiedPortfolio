import * as Phaser from 'phaser';
import backgroundsData from '@/src/data/backgrounds.json';
import projectsData from '@/src/data/projects.json';
import charactersData from '@/src/data/characters.json';
import monstersData from '@/src/data/monsters.json';

export class PreloaderScene extends Phaser.Scene {
    private characterId: string = '1';

    constructor() {
        super({ key: 'PreloaderScene' });
    }

    init(data: { characterId: string }) {
        console.log('[PreloaderScene] Received selection ID:', data.characterId);
        this.characterId = data.characterId || '1';
    }

    preload() {
        // --- VISUAL LOADING BAR ---
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2, 320, 50);

        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 20,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                color: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        const percentText = this.make.text({
            x: width / 2,
            y: height / 2 + 25,
            text: '0%',
            style: {
                font: '18px monospace',
                color: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        const assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 70,
            text: '',
            style: {
                font: '14px monospace',
                color: '#ffffff'
            }
        });
        assetText.setOrigin(0.5, 0.5);

        // --- PROGRESS LISTENERS ---
        this.load.on('progress', (value: number) => {
            percentText.setText(parseInt((value * 100).toString()) + '%');
            progressBar.clear();
            progressBar.fillStyle(0x00ffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 + 10, 300 * value, 30);
        });

        this.load.on('fileprogress', (file: Phaser.Loader.File) => {
            assetText.setText('Loading asset: ' + file.key);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
        });

        // --- ASSET LOADING (From BattleScene) ---

        // Backgrounds
        const isMobile = window.innerWidth < 768;
        backgroundsData.forEach(bg => {
            const key = `bg-level${bg.level}`;
            const url = isMobile ? bg.mobile : bg.desktop;
            this.load.image(key, url);
            this.load.image(`${key}-fallback`, bg.fallback);
        });

        // Particles & UI
        if (!this.textures.exists('slash-effect')) this.load.image('slash-effect', '/assets/slash arc.png');
        if (!this.textures.exists('chest-box')) this.load.image('chest-box', '/assets/chestbox.png');
        if (!this.textures.exists('dramatic-rock')) this.load.image('dramatic-rock', '/assets/dramaticrock.png');

        // Sounds
        this.load.audio('bg-music', '/assets/sounds/background-music-piono.mp3');
        this.load.audio('level-complete', '/assets/sounds/level-complete.mp3');

        // Character & Monster Sounds
        charactersData.forEach(char => {
            if (char.sounds?.attack) this.load.audio(`player-attack-${char.id}`, char.sounds.attack);
            if (char.sounds?.death) this.load.audio(`player-death`, char.sounds.death);
        });

        monstersData.forEach(m => {
            if (m.sounds?.attack) this.load.audio(`monster-attack-${m.id}`, m.sounds.attack);
            if (m.sounds?.roar) this.load.audio(`monster-roar-${m.id}`, m.sounds.roar);
            if (m.sounds?.death) this.load.audio(`monster-death-${m.id}`, m.sounds.death);
        });

        // Project Images
        projectsData.forEach(project => {
            if (project.mockup && !this.textures.exists(project.id)) {
                this.load.image(project.id, project.mockup);
            }
        });

        // GIF FORCING (The key fix for GIF lag)
        // We load them as simple binary blobs to force the browser to cache them.
        // This ensures they are "ready" when the <img> tags in the DOM need them.

        // 1. Preload all Protagonist assets
        charactersData.forEach(char => {
            if (char.assets) {
                Object.values(char.assets).forEach(path => {
                    if (typeof path === 'string' && path.endsWith('.gif')) {
                        this.load.binary(path, path);
                    }
                });
            }
        });

        // 2. Preload all Monster assets
        monstersData.forEach(m => {
            if (m.assets) {
                Object.values(m.assets).forEach(path => {
                    if (typeof path === 'string' && path.endsWith('.gif')) {
                        this.load.binary(path, path);
                    }
                });
            }
        });
    }

    create() {
        // Move to the next scene once everything is cached, passing the character selection
        this.scene.start('BattleScene', { characterId: this.characterId });
    }
}
