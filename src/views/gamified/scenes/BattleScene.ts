import * as Phaser from 'phaser';
import charactersData from '@/src/data/characters.json';
import monstersData from '@/src/data/monsters.json';
import projectsData from '@/src/data/projects.json';

interface Project {
    id: string;
    name: string;
    description: string;
    mockup: string;
    liveLink: string;
    repoLink: string;
}

export class BattleScene extends Phaser.Scene {
    private player?: Phaser.Physics.Arcade.Sprite;
    private enemies?: Phaser.Physics.Arcade.Group;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private keys?: { [key: string]: Phaser.Input.Keyboard.Key };
    private ground?: Phaser.GameObjects.Rectangle; // Invisible floor

    // Stats
    private playerHealth: number = 100;
    private characterId: string = '1';
    private currentLevel: number = 1;
    private waveCount: number = 0;
    private maxWaves: number = 3; // L1 has 3 waves of minions

    // UI
    private healthText?: Phaser.GameObjects.Text;
    private levelText?: Phaser.GameObjects.Text;
    private instructionsText?: Phaser.GameObjects.Text;

    // Combat State
    private isAttacking: boolean = false;
    private isDodging: boolean = false;
    private lastAttackTime: number = 0;
    private lastDodgeTime: number = 0;

    // Mobile/Touch State
    private touchStates = {
        left: false,
        right: false
    };

    constructor() {
        super({ key: 'BattleScene' });
    }

    init(data: { characterId: string }) {
        this.characterId = data.characterId || '1';
        this.currentLevel = 1;
        this.waveCount = 0;
        this.playerHealth = 100;
    }

    preload() {
        // Load backgrounds
        this.load.image('bg-level1', '/assets/gamebackground.png');
        this.load.image('bg-level2', '/assets/gamebackground2.png');

        // Load Character Assets directly from JSON
        const character = charactersData.find(c => c.id === this.characterId);
        if (character && character.assets) {
            this.load.image('player-idle', character.assets.idle);
            this.load.image('player-walk', character.assets.walk); // Simplify to image for now if sprite sheet not available
            this.load.image('player-atk1', character.assets.attack1);
            this.load.image('player-atk2', character.assets.attack2);
            this.load.image('player-dodge', character.assets.dodge);
        }

        // Load Monster Assets
        monstersData.forEach(monster => {
            this.load.image(`${monster.id}-idle`, monster.assets.idle);
            this.load.image(`${monster.id}-walk`, monster.assets.walk);
            this.load.image(`${monster.id}-attack`, monster.assets.attack);
            if (monster.assets.prepare) this.load.image(`${monster.id}-prepare`, monster.assets.prepare);
            if (monster.assets.death) this.load.image(`${monster.id}-death`, monster.assets.death);
        });

        // Load effects
        this.load.image('slash-effect', '/assets/slash arc.jpg');

        // Load project mockups
        projectsData.forEach((project: Project) => {
            if (project.mockup) {
                this.load.image(project.id, project.mockup);
            }
        });
    }

    create() {
        this.setupLevel();
        this.setupPlayer();
        this.setupControls();
        this.setupVirtualControls(); // Add this line
        this.setupUI();
    }

    private setupLevel() {
        // Clear existing enemies if any
        if (this.enemies) {
            this.enemies.clear(true, true);
        }
        this.enemies = this.physics.add.group();

        // Background
        const bgKey = this.currentLevel === 1 ? 'bg-level1' : 'bg-level2';
        const bg = this.add.image(640, 360, bgKey).setDepth(-1);
        bg.setDisplaySize(1280, 720);
        bg.setScrollFactor(0); // Ensure background is static

        // Invisible Ground Logic - Set standing surface to ~672 (48px from bottom)
        if (this.ground) this.ground.destroy();
        this.ground = this.add.rectangle(640, 700, 1280, 56, 0x000000, 0); // Top is at 672
        this.physics.add.existing(this.ground, true); // Static physics body

        // Spawn Enemies
        if (this.currentLevel === 1) {
            this.spawnWave();
        } else {
            this.spawnBoss();
        }

        // Add collisions with ground for enemies (Player collision added in setupPlayer)
        this.physics.add.collider(this.enemies, this.ground);
    }

    private spawnWave() {
        // Spawn 3 minions sequentially
        let spawnedCount = 0;
        const totalToSpawn = 3;
        const monsterData = monstersData.find(m => m.id === 'monster1');

        if (!monsterData) return;

        // Recursive spawning function
        const spawnNext = () => {
            if (spawnedCount >= totalToSpawn) return;

            const x = 1200; // Always spawn from right edge
            const y = 672; // Top of ground surface
            const enemy = this.physics.add.sprite(x, y, 'monster1-idle');

            enemy.setOrigin(0.5, 1);
            enemy.setScale(monsterData.scale || 0.8);
            enemy.setDepth(100); // Ensure on top of background
            enemy.setBodySize(enemy.width * 0.5, enemy.height * 0.8);
            enemy.setOffset(enemy.width * 0.25, enemy.height * 0.2);
            enemy.setData('hp', monsterData.hp);
            enemy.setData('damage', monsterData.damage);
            enemy.setData('speed', monsterData.speed);
            enemy.setData('type', 'minion');
            enemy.setData('state', 'chase');
            enemy.setData('lastAttack', 0);
            enemy.setCollideWorldBounds(true);

            this.enemies?.add(enemy);
            spawnedCount++;

            // Schedule next spawn
            this.time.delayedCall(2000, spawnNext);
        };

        spawnNext();
    }

    private spawnBoss() {
        const monsterData = monstersData.find(m => m.id === 'monster2');
        if (!monsterData) return;

        const enemy = this.physics.add.sprite(1100, 672, 'monster2-idle');
        enemy.setOrigin(0.5, 1);
        enemy.setScale(monsterData.scale || 1.2);
        enemy.setDepth(10);
        enemy.setBodySize(enemy.width * 0.6, enemy.height * 0.9);
        enemy.setOffset(enemy.width * 0.2, enemy.height * 0.1);
        enemy.setData('hp', monsterData.hp);
        enemy.setData('damage', monsterData.damage);
        enemy.setData('speed', monsterData.speed);
        enemy.setData('type', 'boss');
        enemy.setData('state', 'chase');
        enemy.setData('lastAttack', 0);
        enemy.setCollideWorldBounds(true);

        this.enemies?.add(enemy);
    }

    private setupPlayer() {
        if (this.player) this.player.destroy();

        this.player = this.physics.add.sprite(200, 672, 'player-idle');
        this.player.setOrigin(0.5, 1);
        this.player.setScale(0.8); // Increased size as requested
        this.player.setDepth(10);
        this.player.setCollideWorldBounds(true);
        this.player.setBodySize(this.player.width * 0.5, this.player.height * 0.8);

        // Add collision with ground
        if (this.ground) {
            this.physics.add.collider(this.player, this.ground);
        }
    }

    private setupControls() {
        if (!this.input.keyboard) return;
        this.cursors = this.input.keyboard.createCursorKeys();

        // Add WASD + Skills
        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            attack2: Phaser.Input.Keyboard.KeyCodes.K,
            dodge: Phaser.Input.Keyboard.KeyCodes.L,
            shift: Phaser.Input.Keyboard.KeyCodes.SHIFT
        }) as { [key: string]: Phaser.Input.Keyboard.Key };
    }

    private setupUI() {
        this.healthText = this.add.text(20, 20, `HP: ${this.playerHealth}`, {
            fontSize: '32px', color: '#00ff00', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
        });

        this.levelText = this.add.text(640, 50, `LEVEL ${this.currentLevel}`, {
            fontSize: '48px', color: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5);

        this.instructionsText = this.add.text(20, 80,
            'Controls:\n\u2190\u2192 Move\n[SPACE] Attack\n[K] Heavy Smash\n[L] Dodge', {
            fontSize: '16px', color: '#cccccc', backgroundColor: '#00000088', padding: { x: 10, y: 10 }
        });

        // Back/Quit Button
        const quitButton = this.add.text(1250, 20, '❌ QUIT', {
            fontSize: '24px',
            color: '#ff0000',
            fontStyle: 'bold',
            backgroundColor: '#000000'
        })
            .setOrigin(1, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                // Stop this scene and return to selection (managed by React component unmount usually,
                // but here we can just reload or stop scene.
                // Better to trigger a callback if possible, but for now, restart/stop.)
                this.game.destroy(true);
                window.location.reload(); // Simplest way to "Back" in this hybrid setup for now
            });
    }

    update(time: number, delta: number) {
        if (!this.player) return;

        // Player Logic
        this.handlePlayerInput();
        this.handleVirtualControls(); // Add this line

        // Enemy Logic
        this.enemies?.children.iterate((enemy) => {
            const arcadeSprite = enemy as Phaser.Physics.Arcade.Sprite;
            if (arcadeSprite.active) {
                this.updateEnemyAI(arcadeSprite);
            }
            return true;
        });

        // Game State Logic
        this.checkGameState();
    }

    private handlePlayerInput() {
        if (this.isAttacking || !this.player || !this.cursors || !this.keys) return;

        // Movement
        const left = this.cursors.left?.isDown || this.keys.left?.isDown;
        const right = this.cursors.right?.isDown || this.keys.right?.isDown;

        if (left) {
            this.player.setVelocityX(-250);
            this.player.setFlipX(true);
            if (!this.isDodging) this.player.setTexture('player-walk');
        } else if (right) {
            this.player.setVelocityX(250);
            this.player.setFlipX(false);
            if (!this.isDodging) this.player.setTexture('player-walk');
        } else {
            this.player.setVelocityX(0);
            if (!this.isDodging) this.player.setTexture('player-idle');
        }

        if ((this.cursors.up?.isDown || this.keys.up?.isDown) && this.player.body?.touching.down) {
            this.player.setVelocityY(-500);
        }

        // Combat
        const now = this.time.now;

        // Attack 1 (Space)
        if (this.cursors.space && Phaser.Input.Keyboard.JustDown(this.cursors.space) && now > this.lastAttackTime + 500) {
            this.performAttack(1);
        }

        // Attack 2 (K)
        if (this.keys.attack2 && Phaser.Input.Keyboard.JustDown(this.keys.attack2) && now > this.lastAttackTime + 800) {
            this.performAttack(2);
        }

        // Dodge (L)
        if (this.keys.dodge && Phaser.Input.Keyboard.JustDown(this.keys.dodge) && now > this.lastDodgeTime + 1000) {
            this.performDodge();
        }
    }

    private performAttack(type: 1 | 2) {
        if (!this.player) return;
        this.isAttacking = true;
        this.lastAttackTime = this.time.now;

        // Visual
        const texture = type === 1 ? 'player-atk1' : 'player-atk2';
        this.player.setTexture(texture);

        // Camera shake for heavy attack
        if (type === 2) {
            this.cameras.main.shake(100, 0.01);
        }

        // Hitbox logic
        const damage = type === 1 ? 25 : 50;
        const range = type === 1 ? 150 : 250;

        // Check hits
        this.enemies?.children.iterate((enemy) => {
            const arcadeSprite = enemy as Phaser.Physics.Arcade.Sprite;
            if (!arcadeSprite.active) return true;

            const dist = Phaser.Math.Distance.Between(this.player!.x, this.player!.y, arcadeSprite.x, arcadeSprite.y);
            if (dist < range) {
                this.applyDamageToMonster(arcadeSprite, damage, type);
            }
            return true;
        });

        // Reset state (Slower duration for visibility)
        this.time.delayedCall(type === 1 ? 800 : 1200, () => {
            this.isAttacking = false;
        });
    }

    private applyDamageToMonster(enemy: Phaser.Physics.Arcade.Sprite, amount: number, type: 1 | 2) {
        const isDefending = enemy.getData('state') === 'defend';
        const finalDamage = isDefending ? Math.floor(amount * 0.4) : amount;

        const hp = enemy.getData('hp') - finalDamage;
        enemy.setData('hp', hp);

        // Visual feedback
        enemy.setTint(isDefending ? 0x888888 : 0xff0000);
        this.time.delayedCall(150, () => enemy.clearTint());

        // Knockback (Reduced if defending)
        const knockDir = this.player!.x < enemy.x ? 1 : -1;
        const knockPower = isDefending ? 0.3 : 1;
        enemy.setVelocityX(knockDir * (type === 1 ? 200 : 400) * knockPower);
        enemy.setVelocityY(-200 * knockPower);

        if (hp <= 0) {
            this.monsterDeath(enemy);
        }
    }

    private performDodge() {
        if (!this.player) return;
        this.doDodgeAnimation();
    }

    private doDodgeAnimation() {
        if (!this.player) return;
        this.isDodging = true;
        this.lastDodgeTime = this.time.now;

        this.player.setTexture('player-dodge');
        this.player.setAlpha(0.5); // Visual invulnerability
        const dodgeDir = this.player.flipX ? -1 : 1;
        this.player.setVelocityX(dodgeDir * 600); // Dash speed

        this.time.delayedCall(400, () => {
            this.isDodging = false;
            this.player?.setAlpha(1);
        });
    }

    private updateEnemyAI(enemy: Phaser.Physics.Arcade.Sprite) {
        if (!this.player || !enemy.active || enemy.getData('state') === 'death') return;

        const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        const state = enemy.getData('state');
        const monsterId = enemy.texture.key.split('-')[0];
        const mData = monstersData.find(m => m.id === monsterId);
        const now = this.time.now;

        if (state === 'chase') {
            const speed = enemy.getData('speed') || 80;
            const lastAttack = enemy.getData('lastAttack') || 0;

            if (dist > 100) {
                if (enemy.x < this.player.x) {
                    enemy.setVelocityX(speed);
                    enemy.setFlipX(false);
                } else {
                    enemy.setVelocityX(-speed);
                    enemy.setFlipX(true);
                }
                enemy.setTexture(`${monsterId}-walk`);
            } else if (now > lastAttack + 2000) {
                // Within range and cooldown over, prepare attack
                enemy.setVelocityX(0);
                enemy.setData('state', 'prepare');
                enemy.setTexture(`${monsterId}-prepare` || `${monsterId}-idle`);

                this.time.delayedCall(1000, () => {
                    if (enemy.active && enemy.getData('state') === 'prepare') {
                        enemy.setData('state', 'attack');
                        this.performMonsterAttack(enemy, monsterId);
                    }
                });
            } else if (dist < 200 && Phaser.Math.Between(1, 100) < 5) {
                // Occasional defense
                enemy.setVelocityX(0);
                enemy.setData('state', 'defend');
                enemy.setTexture(`${monsterId}-hit` || `${monsterId}-idle`);
                this.time.delayedCall(800, () => {
                    if (enemy.active && enemy.getData('state') === 'defend') {
                        enemy.setData('state', 'chase');
                    }
                });
            } else {
                // In range but on cooldown, stay idle
                enemy.setVelocityX(0);
                enemy.setTexture(`${monsterId}-idle`);
            }
        }
    }

    private performMonsterAttack(enemy: Phaser.Physics.Arcade.Sprite, monsterId: string) {
        if (!enemy.active || !this.player) return;

        const isBoss = enemy.getData('type') === 'boss';
        let attackType = 'attack';

        // Randomly choose between normal attack and special scream for boss
        if (isBoss && Phaser.Math.Between(0, 1) === 1) {
            attackType = 'special';
        }

        enemy.setTexture(`${monsterId}-${attackType}`);

        // Damage timing sync
        this.time.delayedCall(500, () => {
            if (!enemy.active || !this.player) return;

            const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
            const range = attackType === 'special' ? 180 : 120;

            if (dist < range && !this.isDodging) {
                const damage = attackType === 'special' ? 20 : (enemy.getData('damage') || 5);
                this.playerHealth -= damage;
                this.healthText?.setText(`HP: ${this.playerHealth}`);
                this.cameras.main.shake(150, 0.015);
                this.player.setTint(0xff0000);
                this.time.delayedCall(200, () => this.player?.clearTint());

                if (attackType === 'special') {
                    // Scream intimidation: brief alpha change
                    this.player.setAlpha(0.5);
                    this.time.delayedCall(800, () => this.player?.setAlpha(1));
                }
            }

            // Recovery phase
            this.time.delayedCall(800, () => {
                if (enemy.active) {
                    enemy.setData('state', 'chase');
                    enemy.setData('lastAttack', this.time.now);
                }
            });
        });
    }

    private monsterDeath(enemy: Phaser.Physics.Arcade.Sprite) {
        const monsterId = enemy.texture.key.split('-')[0];
        enemy.setData('state', 'death');
        enemy.setVelocity(0, 0);
        enemy.setTexture(`${monsterId}-death`);

        // Scream effect
        this.cameras.main.shake(300, 0.02);
        enemy.setTint(0xff0000);

        this.time.delayedCall(800, () => {
            this.createHitEffect(enemy.x, enemy.y);
            enemy.destroy();
        });
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
        // Lose Condition
        if (this.playerHealth <= 0 && this.scene.isActive()) {
            this.showGameOver();
            return;
        }

        // Level Completion Logic
        const livingEnemies = this.enemies?.countActive(true) || 0;

        if (livingEnemies === 0) {
            if (this.currentLevel === 1) {
                // Wave Logic
                this.waveCount++;
                if (this.waveCount < this.maxWaves) {
                    // Spawn next wave
                    this.time.delayedCall(1000, () => this.spawnWave());
                } else {
                    // Level 1 Complete -> End level with reward
                    this.spawnRewardChest();
                }
            } else if (this.currentLevel === 2) {
                // Boss Defeated -> Victory
                this.spawnRewardChest();
            }
        }
    }

    private spawnRewardChest() {
        if (this.children.list.some(c => c.name === 'chest')) return;

        // Clear previous notifications if any
        this.children.list.filter(c => c.name === 'level-clear-bg' || c.name === 'level-clear-text').forEach(c => c.destroy());

        // Level Clear Notification - Pure blue/white background popup
        const bg = this.add.rectangle(640, 360, 1280, 720, 0x0000ff, 0.5)
            .setDepth(100)
            .setName('level-clear-bg');

        const banner = this.add.rectangle(640, 360, 800, 200, 0xffffff, 1)
            .setStrokeStyle(4, 0x00ffff)
            .setDepth(101)
            .setName('level-clear-text');

        const titleText = this.add.text(640, 330, "LEVEL CLEAR!", {
            fontSize: '64px', color: '#0000ff', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(102).setName('level-clear-text');

        const subText = this.add.text(640, 400, "Touch the Chest to claim your Reward", {
            fontSize: '24px', color: '#333333'
        }).setOrigin(0.5).setDepth(102).setName('level-clear-text');

        // Chest spawn - Moved to center below text and increased depth to be visible on overlay
        const chest = this.add.text(640, 520, '📦', { fontSize: '100px' })
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5)
            .setName('chest')
            .setDepth(200);

        this.physics.add.existing(chest);
        (chest.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);

        // Make chest "clickable" as well
        chest.on('pointerdown', () => {
            bg.destroy();
            banner.destroy();
            titleText.destroy();
            subText.destroy();
            chest.destroy();
            this.showProjectDetails();
        });

        this.physics.add.overlap(this.player!, chest, () => {
            bg.destroy();
            banner.destroy();
            titleText.destroy();
            subText.destroy();
            chest.destroy();
            this.showProjectDetails();
        });
    }

    private showProjectDetails() {
        // Pick a random project or based on level
        const projectIndex = this.currentLevel === 1 ? Phaser.Math.Between(0, 2) : Phaser.Math.Between(3, 5);
        const project = projectsData[projectIndex];

        // Blur background effect
        const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.85).setDepth(200);

        // Knowledge Scroll Motif (Light Parchment color)
        const scroll = this.add.rectangle(640, 360, 900, 600, 0xf5f5dc, 1)
            .setStrokeStyle(8, 0x8b4513) // Brown wood-like border
            .setDepth(201);

        const title = this.add.text(640, 120, project.name.toUpperCase(), {
            fontSize: '40px', color: '#5d4037', fontStyle: 'bold', align: 'center'
        }).setOrigin(0.5).setDepth(202);

        // Project Image (Carousel-like display)
        const img = this.add.image(640, 280, project.id)
            .setDisplaySize(400, 220)
            .setDepth(202);

        const desc = this.add.text(640, 430, project.description, {
            fontSize: '18px', color: '#3e2723', align: 'center', wordWrap: { width: 800 }
        }).setOrigin(0.5).setDepth(202);

        // Interactive Buttons
        const createButton = (x: number, y: number, text: string, url: string) => {
            const btnBg = this.add.rectangle(x, y, 200, 50, 0x5d4037)
                .setInteractive({ useHandCursor: true })
                .setDepth(202);
            const btnText = this.add.text(x, y, text, {
                fontSize: '20px', color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(203);

            btnBg.on('pointerdown', () => window.open(url, '_blank'));
            btnBg.on('pointerover', () => btnBg.setFillStyle(0x795548));
            btnBg.on('pointerout', () => btnBg.setFillStyle(0x5d4037));

            return { btnBg, btnText };
        };

        const liveBtn = createButton(500, 520, "LIVE WEBSITE", project.liveLink || "https://example.com");
        const repoBtn = createButton(780, 520, "VISIT REPO", project.repoLink || "https://github.com");

        const closeText = this.add.text(640, 600, "PRESS [ESC] TO CONTINUE JOURNEY", {
            fontSize: '22px', color: '#8b4513', fontStyle: 'italic'
        }).setOrigin(0.5).setDepth(202);

        const cleanup = () => {
            overlay.destroy();
            scroll.destroy();
            title.destroy();
            img.destroy();
            desc.destroy();
            liveBtn.btnBg.destroy();
            liveBtn.btnText.destroy();
            repoBtn.btnBg.destroy();
            repoBtn.btnText.destroy();
            closeText.destroy();
        };

        this.input.keyboard?.once('keydown-ESC', () => {
            cleanup();
            if (this.currentLevel === 1) {
                this.currentLevel = 2;
                this.waveCount = 0;
                this.setupLevel();
            } else {
                this.scene.start('RewardScene', { characterId: this.characterId });
            }
        });
    }

    private showGameOver() {
        this.physics.pause();
        this.player?.setTint(0xff0000);

        this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.8).setDepth(1000);
        this.add.text(640, 250, 'GAME OVER', {
            fontSize: '80px', color: '#ff0000', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(1001);

        const createBtn = (y: number, text: string, color: number, action: () => void) => {
            const btn = this.add.rectangle(640, y, 300, 60, color)
                .setInteractive({ useHandCursor: true })
                .setDepth(1001);
            this.add.text(640, y, text, { fontSize: '24px', color: '#ffffff' })
                .setOrigin(0.5).setDepth(1002);
            btn.on('pointerdown', action);
        };

        createBtn(400, 'RETRY LEVEL', 0x333333, () => {
            this.scene.restart();
            this.playerHealth = 100;
        });

        createBtn(480, 'QUIT TO MENU', 0x990000, () => {
            window.location.reload();
        });
    }

    private setupVirtualControls() {
        if (!this.sys.game.device.input.touch) return;

        const { width, height } = this.scale;
        const padding = 40;

        // Movement Buttons (Bottom Left)
        const createArrow = (x: number, y: number, label: string, direction: 'left' | 'right') => {
            const btn = this.add.circle(x, y, 50, 0xffffff, 0.2)
                .setScrollFactor(0)
                .setDepth(1000)
                .setInteractive();
            this.add.text(x, y, label, { fontSize: '40px' }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

            btn.on('pointerdown', () => this.touchStates[direction] = true);
            btn.on('pointerup', () => this.touchStates[direction] = false);
            btn.on('pointerout', () => this.touchStates[direction] = false);
        };

        createArrow(padding + 60, height - padding - 60, '←', 'left');
        createArrow(padding + 180, height - padding - 60, '→', 'right');

        // Action Buttons (Bottom Right - Circular Layout)
        const createActionButton = (x: number, y: number, label: string, action: () => void) => {
            const btn = this.add.circle(x, y, 60, 0x00ffff, 0.3)
                .setScrollFactor(0)
                .setDepth(1000)
                .setInteractive();
            this.add.text(x, y, label, { fontSize: '32px' }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

            btn.on('pointerdown', () => {
                btn.setAlpha(0.8);
                action();
            });
            btn.on('pointerup', () => btn.setAlpha(1));
        };

        // Dodge (Top)
        createActionButton(width - padding - 100, height - padding - 180, '💨', () => this.performDodge());
        // Attack 1 (Left)
        createActionButton(width - padding - 200, height - padding - 100, '⚔️', () => this.performAttack(1));
        // Attack 2 (Right)
        createActionButton(width - padding - 60, height - padding - 60, '🔥', () => this.performAttack(2));
    }

    private handleVirtualControls() {
        if (!this.player || !this.sys.game.device.input.touch) return;

        const leftDown = this.touchStates.left;
        const rightDown = this.touchStates.right;

        if (leftDown && !this.isAttacking && !this.isDodging) {
            this.player.setVelocityX(-250);
            this.player.setFlipX(true);
            this.player.setTexture('player-walk');
        } else if (rightDown && !this.isAttacking && !this.isDodging) {
            this.player.setVelocityX(250);
            this.player.setFlipX(false);
            this.player.setTexture('player-walk');
        }
    }
}
