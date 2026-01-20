import * as Phaser from 'phaser';
import projectsData from '@/src/data/projects.json';
import charactersData from '@/src/data/characters.json';
import monstersData from '@/src/data/monsters.json';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';

interface Project {
    id: string;
    name: string;
    description: string;
    mockup: string;
    liveLink: string;
    repoLink: string;
}

interface Character {
    id: string;
    sounds?: {
        attack?: string;
        death?: string;
    };
}

interface Monster {
    id: string;
    sounds?: {
        attack?: string;
        roar?: string;
        death?: string;
    };
}

export class BattleScene extends Phaser.Scene {
    private player?: Player;
    private enemies?: Phaser.GameObjects.Group;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private keys?: { [key: string]: Phaser.Input.Keyboard.Key };
    private ground?: Phaser.GameObjects.Rectangle; // Invisible floor

    // Stats
    private characterId: string = '1';
    private currentLevel: number = 1;
    private minionsSpawned: number = 0;
    private minionsKilled: number = 0;
    private totalMinionsThisLevel: number = 3;
    private isLevelClearing: boolean = false;
    private isPaused: boolean = false;
    private projectShown: boolean = false;
    private levelClearPopupShown: boolean = false;

    // UI
    private healthText?: Phaser.GameObjects.Text;
    private levelText?: Phaser.GameObjects.Text;
    private instructionsText?: Phaser.GameObjects.Text;

    // Fixed Gameplay Constants
    // Adjusted for visual ground level
    // Separate ground heights for protagonist and monsters as requested
    private readonly ENEMY_GROUND_Y = 460;
    private readonly PLAYER_GROUND_Y = 440; // Protagonist higher up
    private readonly SPAWN_Y = 400; // Default spawn, gravity will settle them

    private playerGround?: Phaser.GameObjects.Rectangle;
    private enemyGround?: Phaser.GameObjects.Rectangle;

    private bgMusic?: Phaser.Sound.BaseSound;

    constructor() {
        super({ key: 'BattleScene' });
    }

    init(data: { characterId: string }) {
        this.characterId = data.characterId || '1';
        this.currentLevel = 1;
        this.minionsSpawned = 0;
        this.minionsKilled = 0;
        this.isLevelClearing = false;
        this.isPaused = false;
        this.projectShown = false;
        this.levelClearPopupShown = false;
    }

    preload() {
        if (!this.textures.exists('bg-level1')) this.load.image('bg-level1', '/assets/gamebackground.png');
        if (!this.textures.exists('bg-level2')) this.load.image('bg-level2', '/assets/gamebackground3.png');
        if (!this.textures.exists('slash-effect')) this.load.image('slash-effect', '/assets/slash arc.jpg');

        // Sounds
        this.load.audio('bg-music', '/assets/sounds/background-music-piono.mp3');
        this.load.audio('level-complete', '/assets/sounds/level-complete.mp3');

        // Load character specific sounds
        const char = (charactersData as unknown as Character[]).find(c => c.id === this.characterId);
        if (char?.sounds?.attack) {
            this.load.audio(`player-attack-${this.characterId}`, char.sounds.attack);
        }
        if (char?.sounds?.death) {
            this.load.audio(`player-death`, char.sounds.death);
        }

        // Load monster sounds
        (monstersData as unknown as Monster[]).forEach(m => {
            if (m.sounds?.attack) this.load.audio(`monster-attack-${m.id}`, m.sounds.attack);
            if (m.sounds?.roar) this.load.audio(`monster-roar-${m.id}`, m.sounds.roar);
            if (m.sounds?.death) this.load.audio(`monster-death-${m.id}`, m.sounds.death);
        });

        // Note: Actual character assets are loaded via IMG tags in DOM, 
        // but we load placeholders here to avoid Phaser warning if needed.
        if (!this.textures.exists('player-idle')) this.load.image('player-idle', '/assets/characters/hero1/Idle.gif');
        if (!this.textures.exists('monster1-idle')) this.load.image('monster1-idle', '/assets/monsters/minion/Idle.gif');
        if (!this.textures.exists('monster2-idle')) this.load.image('monster2-idle', '/assets/monsters/boss/Idle.gif');

        projectsData.forEach((project: Project) => {
            if (project.mockup && !this.textures.exists(project.id)) {
                this.load.image(project.id, project.mockup);
            }
        });
    }

    create() {
        this.setupLevel();
        this.setupPlayer();
        this.setupControls();
        this.setupUI();

        // Music
        if (!this.bgMusic) {
            const isMuted = !!window.localStorage.getItem('game-muted');
            this.bgMusic = this.sound.add('bg-music', { loop: true, volume: 0.5 });
            this.bgMusic.play();
            if (isMuted) this.bgMusic.pause();
        }

        window.addEventListener('resume-game', () => {
            this.projectShown = true;
            this.resumeGame();
        });

        window.addEventListener('toggle-sound', (e: Event) => {
            const muted = (e as CustomEvent).detail.muted;
            if (this.bgMusic) {
                if (muted) this.bgMusic.pause();
                else if (!this.isPaused) this.bgMusic.resume();
            }
        });
    }

    private setupLevel() {
        this.isLevelClearing = false;
        this.minionsSpawned = 0;
        this.minionsKilled = 0;

        if (this.enemies) this.enemies.clear(true, true);
        this.enemies = this.add.group({ runChildUpdate: true });

        const bgKey = this.currentLevel === 1 ? 'bg-level1' : 'bg-level2';
        const bg = this.add.image(640, 360, bgKey).setDepth(-1);
        bg.setDisplaySize(1280, 720);
        bg.setScrollFactor(0);

        // Ground Logic - Separate grounds for Player and Enemies
        if (this.ground) this.ground.destroy(); // Cleanup old
        if (this.playerGround) this.playerGround.destroy();
        if (this.enemyGround) this.enemyGround.destroy();

        // Player Ground (Higher)
        this.playerGround = this.add.rectangle(640, this.PLAYER_GROUND_Y, 1280, 56, 0x000000, 0);
        this.physics.add.existing(this.playerGround, true);

        // Enemy Ground (Lower/Standard)
        this.enemyGround = this.add.rectangle(640, this.ENEMY_GROUND_Y, 1280, 56, 0x000000, 0);
        this.physics.add.existing(this.enemyGround, true);

        // Spawn Enemies
        const monsterId = this.getMonsterIdForCurrentLevel();
        if (this.currentLevel === 1) {
            this.totalMinionsThisLevel = this.characterId === '1' ? 3 : 3; // Painter has 3, Others have 2+1
            this.spawnWave(monsterId);
        } else {
            this.totalMinionsThisLevel = 2;
            this.spawnLevel2(monsterId);
        }

        // Collisions
        this.physics.add.collider(this.enemies.getChildren(), this.enemyGround);
    }

    private spawnWave(monsterId: string) {
        if (this.minionsSpawned >= this.totalMinionsThisLevel) return;

        // Custom logic for 2xM1 + 1xSpec logic in Level 1
        let currentMonster = monsterId;
        if (this.currentLevel === 1 && this.characterId !== '1') {
            if (this.minionsSpawned < 2) {
                currentMonster = 'monster1';
            } else {
                currentMonster = monsterId; // The special monster (3, 4, or 5)
            }
        }

        const enemy = new Enemy(this, 1200, this.SPAWN_Y, currentMonster, this.currentLevel);
        enemy.on('death', () => this.handleEnemyDeath(enemy, 'minion'));

        this.enemies?.add(enemy);
        this.physics.add.collider(enemy, this.enemyGround!);

        this.minionsSpawned++;

        if (this.minionsSpawned < this.totalMinionsThisLevel) {
            this.time.delayedCall(5000, () => {
                if (!this.isPaused && !this.isLevelClearing) this.spawnWave(monsterId);
            });
        }
    }

    private spawnLevel2(monsterId: string) {
        if (this.minionsSpawned >= this.totalMinionsThisLevel) return;

        const enemy = new Enemy(this, 1100, this.SPAWN_Y, monsterId, this.currentLevel);
        enemy.on('death', () => this.handleEnemyDeath(enemy, 'boss'));

        this.enemies?.add(enemy);
        this.physics.add.collider(enemy, this.enemyGround!);

        this.minionsSpawned++;

        if (this.minionsSpawned < this.totalMinionsThisLevel) {
            this.time.delayedCall(8000, () => {
                if (!this.isPaused && !this.isLevelClearing) this.spawnLevel2(monsterId);
            });
        }
    }

    private getMonsterIdForCurrentLevel(): string {
        if (this.currentLevel === 1) {
            switch (this.characterId) {
                case '1': return 'monster1'; // Painter: 3-monster1
                case '2': return 'monster4'; // Architect: 2-monster1 + 1-monster4
                case '3': return 'monster3'; // DevOps: 2-monster1 + 1-monster3
                case 'generalist':
                case '4': return 'monster5'; // Generalist: 2-monster1 + 1-monster5
                default: return 'monster1';
            }
        } else {
            switch (this.characterId) {
                case '1': return 'monster2'; // Painter: 2-monster2
                case '2': return 'monster4'; // Architect: 2-monster4
                case '3': return 'monster3'; // DevOps: 2-monster3
                case 'generalist':
                case '4': return 'monster5'; // Generalist: 2-monster5
                default: return 'monster2';
            }
        }
    }

    private setupPlayer() {
        if (this.player) {
            this.player.destroy();
            this.player = undefined;
        }

        this.player = new Player(this, 200, this.SPAWN_Y, this.characterId);
        this.physics.add.collider(this.player, this.playerGround!);

        // Restore controls
        if (this.cursors && this.keys) {
            this.player.setupControls(this.cursors, this.keys);
        }

        // Listen for attack hits to deal damage
        this.player.on('attack-hit', (type: 1 | 2) => this.checkPlayerAttackHit(type));
    }

    private setupControls() {
        if (!this.input.keyboard) return;
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            attack2: Phaser.Input.Keyboard.KeyCodes.K,
            dodge: Phaser.Input.Keyboard.KeyCodes.L,
        }) as Record<string, Phaser.Input.Keyboard.Key>;

        if (this.player) {
            this.player.setupControls(this.cursors!, this.keys!);
        }
    }

    private setupUI() {
        this.healthText = this.add.text(20, 20, `HP: 100`, {
            fontSize: '32px', color: '#00ff00', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
        });

        this.levelText = this.add.text(640, 50, `LEVEL ${this.currentLevel}`, {
            fontSize: '48px', color: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5);

        this.instructionsText = this.add.text(20, 80,
            'Controls:\n←→ Move | ↑ Jump\n[SPACE] Attack\n[K] Heavy Smash\n[L] Dodge', {
            fontSize: '16px', color: '#cccccc', backgroundColor: '#00000088', padding: { x: 10, y: 10 }
        });

        this.add.text(1150, 20, '⏸ PAUSE', {
            fontSize: '24px', color: '#ffff00', fontStyle: 'bold', backgroundColor: '#000000'
        })
            .setOrigin(1, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.togglePause());

        this.add.text(1250, 20, '❌ QUIT', {
            fontSize: '24px', color: '#ff0000', fontStyle: 'bold', backgroundColor: '#000000'
        })
            .setOrigin(1, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.game.destroy(true);
                window.location.reload();
            });
    }

    update(time: number) {
        if (this.isPaused) return;

        if (this.player) {
            // Broker update call
            this.player.handleInput(time);
            this.healthText?.setText(`HP: ${this.player.health}`);

            if (this.player.health <= 0) {
                this.showGameOver();
                return;
            }
        }

        // AI Updates
        this.enemies?.children.iterate((child) => {
            const enemy = child as Enemy;
            if (enemy.active && this.player) {
                enemy.setTarget(this.player);
                enemy.updateAI(time);
            }
            return true;
        });

        this.checkGameState();
    }

    private checkPlayerAttackHit(type: 1 | 2) {
        if (!this.player) return;
        const damage = type === 1 ? 25 : 50;
        const range = type === 1 ? 150 : 250;
        const yTolerance = 50; // Allow 30-50px difference in Y (height) per drawing

        this.enemies?.children.iterate((child) => {
            const enemy = child as Enemy;
            if (enemy.active && this.player) {
                // Check X distance
                const dx = Math.abs(this.player.x - enemy.x);
                // Check Y difference (height/ground level diff)
                const dy = Math.abs(this.player.y - enemy.y);

                // Attack hits if within horizontal range AND vertical tolerance
                if (dx < range && dy <= yTolerance) {
                    enemy.takeDamage(damage);
                    this.createHitEffect(enemy.x, enemy.y);
                }
            }
            return true;
        });
    }

    private handleEnemyDeath(enemy: Enemy, type: 'minion' | 'boss') {
        if (type === 'minion') {
            this.minionsKilled++;
        } else if (type === 'boss') {
            // Count boss kills for Level 2
            this.minionsKilled++;
        }
    }

    private createHitEffect(x: number, y: number) {
        const particles = this.add.particles(x, y, 'slash-effect', {
            speed: { min: -100, max: 100 },
            scale: { start: 0.2, end: 0 },
            lifespan: 300,
            quantity: 10,
            blendMode: 'ADD'
        });
        this.time.delayedCall(300, () => particles.destroy());
    }

    private checkGameState() {
        if (this.isLevelClearing || this.isPaused) return;

        // Ensure enemies have been spawned before checking for level completion
        if (this.minionsSpawned === 0) return;

        let levelComplete = false;
        if (this.currentLevel === 1 && this.minionsKilled >= this.totalMinionsThisLevel) {
            levelComplete = true;
        } else if (this.currentLevel === 2) {
            // Level 2: Check if all minions are dead
            if (this.minionsKilled >= this.totalMinionsThisLevel) levelComplete = true;
        }

        if (levelComplete) {
            this.isLevelClearing = true;
            this.isPaused = true;
            this.physics.pause();
            this.sound.play('level-complete');
            this.spawnRewardChest();
        }
    }

    private spawnRewardChest() {
        const bg = this.add.rectangle(640, 360, 1280, 720, 0x0000ff, 0.5).setDepth(3000);
        const title = this.add.text(640, 330, "LEVEL CLEAR!", {
            fontSize: '64px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(3001);

        const chest = this.add.text(640, 500, '📦', { fontSize: '100px' })
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5)
            .setDepth(3005);

        chest.once('pointerdown', () => {
            bg.destroy();
            title.destroy();
            chest.destroy();
            this.projectShown = false;
            this.showProjectDetails();
        });
    }

    private showProjectDetails() {
        const project = projectsData[this.currentLevel - 1];
        window.dispatchEvent(new CustomEvent('open-project-modal', { detail: project }));
    }

    private resumeGame() {
        // Check if we need to show "Start Level 2" button
        if (this.currentLevel === 1 && this.projectShown && !this.levelClearPopupShown) {
            this.showStartLevel2Popup();
            return;
        }

        if (this.currentLevel === 1 && this.levelClearPopupShown) {
            // Transition to Level 2
            this.currentLevel = 2;
            this.projectShown = false;
            this.levelClearPopupShown = false;

            // Keep game paused during transition
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.setupLevel();
                this.setupPlayer();
                this.levelText?.setText(`LEVEL ${this.currentLevel}`);

                // Resume game AFTER setup is complete
                this.isPaused = false;
                this.physics.resume();

                this.cameras.main.fadeIn(1000);
            });
        } else if (this.currentLevel === 2) {
            // Resume after Level 2 project reveal
            this.isPaused = false;
            this.physics.resume();
            this.isLevelClearing = false;

            // Go to Victory Scene
            this.scene.start('RewardScene', { characterId: this.characterId });
        }
    }

    private showStartLevel2Popup() {
        this.levelClearPopupShown = true;

        const bg = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7).setDepth(3000);
        const title = this.add.text(640, 280, "LEVEL 1 COMPLETE!", {
            fontSize: '56px', color: '#00ff00', fontStyle: 'bold', stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(3001);

        const subtitle = this.add.text(640, 360, "Ready for the next challenge?", {
            fontSize: '28px', color: '#ffffff'
        }).setOrigin(0.5).setDepth(3001);

        const startButton = this.add.text(640, 480, '▶ START LEVEL 2', {
            fontSize: '36px',
            color: '#ffffff',
            backgroundColor: '#ff6600',
            padding: { x: 40, y: 20 },
            fontStyle: 'bold'
        })
            .setOrigin(0.5)
            .setDepth(3005)
            .setInteractive({ useHandCursor: true });

        startButton.on('pointerover', () => {
            startButton.setScale(1.1);
            startButton.setStyle({ backgroundColor: '#ff8833' });
        });

        startButton.on('pointerout', () => {
            startButton.setScale(1);
            startButton.setStyle({ backgroundColor: '#ff6600' });
        });

        startButton.once('pointerdown', () => {
            bg.destroy();
            title.destroy();
            subtitle.destroy();
            startButton.destroy();
            this.resumeGame();
        });
    }

    private showGameOver() {
        this.physics.pause();
        this.isPaused = true;
        if (this.bgMusic) this.bgMusic.stop();

        // Dispatch event to GameComponent.tsx to show React Overlay
        // This solves Z-index issues with DOM elements (GIFs) overlaying Canvas
        window.dispatchEvent(new CustomEvent('game-over'));
    }

    public togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.physics.pause();
            if (this.bgMusic) this.bgMusic.pause();
            this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.5).setDepth(4000).setName('pause-overlay');
            this.add.text(640, 360, 'GAME PAUSED', { fontSize: '64px', color: '#ffffff' }).setOrigin(0.5).setDepth(4001).setName('pause-text');
        } else {
            this.physics.resume();
            if (this.bgMusic) this.bgMusic.resume();
            this.children.getByName('pause-overlay')?.destroy();
            this.children.getByName('pause-text')?.destroy();
        }
    }
}
