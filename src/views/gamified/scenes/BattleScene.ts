import * as Phaser from 'phaser';
import projectsData from '@/src/data/projects.json';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { DramaticRock } from '../entities/DramaticRock';



export class BattleScene extends Phaser.Scene {
    private player?: Player;
    private enemies?: Phaser.GameObjects.Group;
    private rocks?: Phaser.GameObjects.Group;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private keys?: { [key: string]: Phaser.Input.Keyboard.Key };


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

    // Bound Event Handlers for Cleanup
    private handleResumeGame = () => {
        if (!this.scene.isActive()) return;
        this.projectShown = true;
        this.resumeGame();
    };

    private handleToggleSound = (e: Event) => {
        if (!this.sound) return;
        const muted = (e as CustomEvent).detail.muted;
        this.sound.mute = muted;
        if (this.bgMusic) {
            if (muted) this.bgMusic.pause();
            else if (!this.isPaused) this.bgMusic.resume();
        }
    };

    // Fixed Gameplay Constants
    // Unified Ground Level as per diagram analysis
    // private readonly MASTER_GROUND_Y = 430;

    // // Spawn Y: High enough to fall onto ground.
    // private readonly SPAWN_Y = 350;

    // private ground?: Phaser.GameObjects.Rectangle;

    // private bgMusic?: Phaser.Sound.BaseSound;

    ///// CHANGED: Removed MASTER_GROUND_Y constant to allow per-level flexibility /////
    public currentGroundY: number = 430;
    private readonly SPAWN_Y = 300; // Spawn slightly higher to fall onto ground

    private ground?: Phaser.GameObjects.Rectangle;
    private bgMusic?: Phaser.Sound.BaseSound;

    constructor() {
        super({ key: 'BattleScene' });
    }

    init(data: { characterId: string }) {
        console.log('[BattleScene] Initializing with protagonist ID:', data.characterId);
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
        // Assets are now managed by PreloaderScene
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
            if (isMuted) {
                this.bgMusic.pause();
                this.sound.mute = true;
            }
        }

        window.addEventListener('resume-game', this.handleResumeGame);
        window.addEventListener('toggle-sound', this.handleToggleSound);

        // Cleanup on Shutdown
        this.events.once('shutdown', () => {
            window.removeEventListener('resume-game', this.handleResumeGame);
            window.removeEventListener('toggle-sound', this.handleToggleSound);
        });
    }

    private setupLevel() {
        this.isLevelClearing = false;
        this.minionsSpawned = 0;
        this.minionsKilled = 0;

        ///// CHANGED: Dynamic Ground Y based on Level Background /////
        // Level 2 artwork has a lower "horizon" grid than Level 1
        this.currentGroundY = this.currentLevel === 1 ? 430 : 580; /////

        if (this.enemies) this.enemies.clear(true, true);
        this.enemies = this.add.group({ runChildUpdate: true });

        if (this.rocks) this.rocks.clear(true, true);
        this.rocks = this.add.group({ runChildUpdate: true });

        const bgKey = `bg-level${this.currentLevel}`;
        let textureToUse = bgKey;

        // Check if the dynamic texture loaded successfully
        // if (!this.textures.exists(bgKey)) {
        //     console.warn(`Background ${bgKey} failed to load, utilizing fallback.`);
        //     textureToUse = `${bgKey}-fallback`;
        // } else {
        //     // Also check if it's a valid texture (not a missing image placeholder if Phaser does that)
        //     const texture = this.textures.get(bgKey);
        //     if (texture.key === '__MISSING') {
        //         textureToUse = `${bgKey}-fallback`;
        //     }
        // }

        if (!this.textures.exists(bgKey)) {
            textureToUse = `${bgKey}-fallback`;
        }

        const bg = this.add.image(640, 360, textureToUse).setDepth(-1);
        bg.setDisplaySize(1280, 720);
        bg.setScrollFactor(0);

        // Ground Logic - Unified for all characters
        if (this.ground) this.ground.destroy();

        // Single Invisible Ground Line
        // x=640 (center), y=MASTER_GROUND_Y, width=1280, height=40
        // Offset y by height/2 because default origin is center (0.5), but we want top of box at MASTER_GROUND_Y?
        // Actually easiest is to place rect center at y = MASTER_GROUND_Y + height/2.
        // So the "Top" of the rect is at MASTER_GROUND_Y.
        // const groundHeight = 40;
        // this.ground = this.add.rectangle(640, this.MASTER_GROUND_Y + (groundHeight / 2), 1280, groundHeight, 0x000000, 0);
        // this.physics.add.existing(this.ground, true); // true = Static body

        ///// CHANGED: Ground rectangle now sits exactly at currentGroundY /////
        const groundHeight = 20;
        this.ground = this.add.rectangle(640, this.currentGroundY + (groundHeight / 2), 1280, groundHeight, 0x00ffff, 0);
        this.physics.add.existing(this.ground, true);

        // Spawn Enemies
        const monsterId = this.getMonsterIdForCurrentLevel();
        if (this.currentLevel === 1) {
            this.totalMinionsThisLevel = this.characterId === '1' ? 3 : 3;
            this.spawnWave(monsterId);
        } else {
            this.totalMinionsThisLevel = 2;
            this.spawnLevel2(monsterId);
        }

        // Collisions
        this.physics.add.collider(this.enemies.getChildren(), this.ground);
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
        enemy.on('vanished', () => this.handleEnemyDeath(enemy, 'minion'));

        this.enemies?.add(enemy);
        this.physics.add.collider(enemy, this.ground!);

        this.minionsSpawned++;

        if (this.minionsSpawned < this.totalMinionsThisLevel) {
            this.time.delayedCall(5000, () => {
                if (!this.isPaused && !this.isLevelClearing) this.spawnWave(monsterId);
            });
        }
    }
    ///// NEW: Helper to fix Monster Hitbox Sync /////
    private syncEnemyHitbox(enemy: Enemy) {
        enemy.setOrigin(0.5, 1); // Feet anchor
        const body = enemy.body as Phaser.Physics.Arcade.Body;

        // This is the fix for Level 2: 
        // Force the physics body to align with the visual bottom
        body.updateFromGameObject(); /////
        this.physics.add.collider(enemy, this.ground!); /////
    }

    private spawnLevel2(monsterId: string) {
        if (this.minionsSpawned >= this.totalMinionsThisLevel) return;

        // const enemy = new Enemy(this, 1100, this.SPAWN_Y, monsterId, this.currentLevel);/
        ///// CHANGED: Force spawn at currentGroundY /////
        const enemy = new Enemy(this, 1100, this.currentGroundY, monsterId, this.currentLevel);
        this.syncEnemyHitbox(enemy); // Apply the fix /////
        enemy.on('vanished', () => this.handleEnemyDeath(enemy, 'boss'));

        this.enemies?.add(enemy);
        // this.physics.add.collider(enemy, this.enemyGround!);

        this.minionsSpawned++;

        if (this.minionsSpawned < this.totalMinionsThisLevel) {
            this.time.delayedCall(8000, () => {
                if (!this.isPaused && !this.isLevelClearing) this.spawnLevel2(monsterId);
            });
        }

        // Randomly spawn a Dramatic Rock (Higher probability for Level 2)
        if (Phaser.Math.Between(0, 100) > 30) { // 70% chance
            const rockX = Phaser.Math.Between(100, 1100);
            // Spawn closer to ground (between 100 and 300px above ground)
            const rockY = this.currentGroundY - Phaser.Math.Between(100, 300);
            const rock = new DramaticRock(this, rockX, rockY);
            rock.setScrollFactor(1);
            this.rocks?.add(rock);
            this.physics.add.collider(rock, this.ground!, () => {
                rock.destroyRock(true);
            });
        }
    }

    private getMonsterIdForCurrentLevel(): string {
        if (this.currentLevel === 1) {
            switch (this.characterId) {
                case '1': return 'monster1'; // Painter: 3-monster1
                case '2': return 'monster4'; // Architect: 2-monster1 + 1-monster4
                case '3': return 'monster3'; // DevOps: 2-monster1 + 1-monster3
                // case 'generalist':
                case '4': return 'monster5'; // Generalist: 2-monster1 + 1-monster5
                default: return 'monster1';
            }
        } else {
            switch (this.characterId) {
                case '1': return 'monster2'; // Painter: 2-monster2
                case '2': return 'monster4'; // Architect: 2-monster4
                case '3': return 'monster3'; // DevOps: 2-monster3
                // case 'generalist':
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
        ///// CHANGED: Force Bottom-Center Origin for Player /////
        this.player.setOrigin(0.5, 1); /////
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        body.setCollideWorldBounds(true);
        // Ensure the physics body matches the bottom origin
        body.setOffset(0, 0); /////
        this.physics.add.collider(this.player, this.ground!);

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

        this.add.text(1100, 20, '⏸ PAUSE', {
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
        // this.renderDebug(); // Commented out for deployment; uncomment for hitbox debugging
    }

    private debugGraphics?: Phaser.GameObjects.Graphics;

    /**
     * DEBUG RENDERER (BOXES)
     * Used for future debugging of hitboxes and ground alignment.
     * To toggle off, remove call in update() or check currentGroundY logic.
     */
    private renderDebug() {
        if (!this.debugGraphics) {
            this.debugGraphics = this.add.graphics().setDepth(9999);
        }
        this.debugGraphics.clear();

        // 1. Imaginary Ground Line (Cyan)
        this.debugGraphics.lineStyle(2, 0x00ffff, 1);
        // this.debugGraphics.lineBetween(0, this.MASTER_GROUND_Y, 1280, this.MASTER_GROUND_Y);
        this.debugGraphics.lineBetween(0, this.currentGroundY, 1280, this.currentGroundY); /////

        // 2. Player Hitbox (Green)
        if (this.player && this.player.active) {
            this.debugGraphics.lineStyle(2, 0x00ff00, 1);
            // Height is approx 120, Width 60
            // this.debugGraphics.strokeRect(this.player.x - 30, this.player.y - 120, 60, 120);
            const body = this.player.body as Phaser.Physics.Arcade.Body;
            ///// CHANGED: Draw from feet up using bottom-alignment logic /////
            this.debugGraphics.strokeRect(body.x, body.y, body.width, body.height); /////
        }

        // 3. Enemy Hitboxes (Red)
        // this.enemies?.children.iterate((child) => {
        //     const enemy = child as Enemy;
        //     if (enemy.active) {
        //         this.debugGraphics!.lineStyle(2, 0xff0000, 1);
        //         const w = (enemy.body as Phaser.Physics.Arcade.Body).width || 80;
        //         const h = (enemy.body as Phaser.Physics.Arcade.Body).height || 120;
        //         // Bodies are anchored at center-bottom usually? No, Phaser default is center.
        //         // But simplified for visual check:
        //         this.debugGraphics!.strokeRect(enemy.x - w / 2, enemy.y - h / 2, w, h);
        //     }
        //     return true;
        // });/

        // Enemy Hitboxes (Red)
        this.enemies?.children.iterate((child) => {
            const enemy = child as Enemy;
            if (enemy.active) {
                this.debugGraphics!.lineStyle(2, 0xff0000, 1);
                const body = enemy.body as Phaser.Physics.Arcade.Body;
                ///// CHANGED: Phaser Physics Bodies should now sit on ground /////
                this.debugGraphics!.strokeRect(body.x, body.y, body.width, body.height); /////
            }
            return true;
        });

        // 4. Console Log positions (Throttled)
        if (this.game.loop.frame % 60 === 0) {
            console.log(`[DEBUG] Level ${this.currentLevel}`);
            if (this.player) console.log(`Player Y: ${Math.round(this.player.y)} | Ground: ${this.currentGroundY}`);
            this.enemies?.children.iterate((child) => {
                const enemy = child as Enemy;
                console.log(`Enemy ${enemy.id} Y: ${Math.round(enemy.y)} | Ground: ${this.currentGroundY}`);
                return true;
            });
        }
    }

    private checkPlayerAttackHit(type: 1 | 2) {
        if (!this.player) return;
        const damage = type === 1 ? 25 : 50;
        const range = type === 1 ? 150 : 250;
        // const yTolerance = 50; // Allow 30-50px difference in Y (height) per drawing
        ///// CHANGED: Lowered yTolerance because they are now on same ground /////
        const yTolerance = 80; // Handles height variation of sprites /////

        this.enemies?.children.iterate((child) => {
            const enemy = child as Enemy;
            if (enemy.active && this.player) {
                // Check X distance
                const dx = Math.abs(this.player.x - enemy.x);
                // Check Y difference (height/ground level diff)
                const dy = Math.abs(this.player.y - enemy.y);

                // Attack hits if within horizontal range AND vertical tolerance
                // if (dx < range && dy <= yTolerance) {
                //     enemy.takeDamage(damage);
                //     this.createHitEffect(enemy.x, enemy.y);
                // }
                if (dx < range && dy <= yTolerance) {
                    enemy.takeDamage(damage);
                    this.createHitEffect(enemy.x, enemy.y - (enemy.height / 2));
                }
            }
            return true;
        });

        // Check Rock Hits
        this.rocks?.children.iterate((child) => {
            const rock = child as DramaticRock;
            if (rock.active && this.player) {
                const dx = Math.abs(this.player.x - rock.x);
                const dy = Math.abs(this.player.y - rock.y);

                // Rock is usually high up (parallax), so hit box might be tricky.
                // Assuming wide range for now since it's a "screen effect" object or give it a bigger hitbox
                if (dx < 100 && dy < 400) { // Allow hitting even if high up for dramatic effect
                    rock.takeDamage();
                    this.createHitEffect(rock.x, rock.y);
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

        const chest = this.add.image(640, 500, 'chest-box')
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5)
            .setDepth(3005)
            .setScale(0.5); // Adjust scale as needed based on image size

        const chestHint = this.add.text(640, 580, "Click on box for reward", {
            fontSize: '24px', color: '#ffffff', fontStyle: 'bold italic'
        }).setOrigin(0.5).setDepth(3001);

        chest.once('pointerdown', () => {
            bg.destroy();
            title.destroy();
            chest.destroy();
            chestHint.destroy();
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
            this.physics?.resume();
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
