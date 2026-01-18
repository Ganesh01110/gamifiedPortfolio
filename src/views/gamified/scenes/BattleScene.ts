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
    private playerDom?: Phaser.GameObjects.DOMElement;
    private enemies?: Phaser.Physics.Arcade.Group;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private keys?: { [key: string]: Phaser.Input.Keyboard.Key };
    private ground?: Phaser.GameObjects.Rectangle; // Invisible floor

    // Stats
    private playerHealth: number = 100;
    private characterId: string = '1';
    private currentLevel: number = 1;
    private minionsSpawned: number = 0;
    private minionsKilled: number = 0;
    private totalMinionsPerLevel: number = 3;
    private isLevelClearing: boolean = false;

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

    private isPaused: boolean = false;

    constructor() {
        super({ key: 'BattleScene' });
    }

    init(data: { characterId: string }) {
        this.characterId = data.characterId || '1';
        this.currentLevel = 1;
        this.minionsSpawned = 0;
        this.minionsKilled = 0;
        this.playerHealth = 100;
        this.isLevelClearing = false;
        this.isPaused = false;
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

        // Listen for resume from React
        window.addEventListener('resume-game', () => this.resumeGame());
    }

    private setupLevel() {
        // Reset level-specific flags
        this.isLevelClearing = false;
        this.minionsSpawned = 0;
        this.minionsKilled = 0;

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
        if (this.minionsSpawned >= this.totalMinionsPerLevel) return;
        console.log(`[BattleScene] Spawning minion ${this.minionsSpawned + 1}/${this.totalMinionsPerLevel}`);

        const monsterData = monstersData.find(m => m.id === 'monster1');
        if (!monsterData) return;

        const x = 1200;
        const y = 672;
        const enemy = this.physics.add.sprite(x, y, 'monster1-idle');
        enemy.setVisible(false); // Hide sprite, show DOM

        // Create DOM element for GIF
        const enemyDom = this.add.dom(x, y, 'img', {
            src: monsterData.assets.idle,
            style: 'width: auto; height: auto;'
        });
        enemyDom.setDepth(100);
        enemy.setData('dom', enemyDom);

        enemy.setOrigin(0.5, 1);
        enemy.setScale(monsterData.scale || 0.8);
        enemyDom.setScale(monsterData.scale || 0.8);
        enemyDom.setScale(monsterData.scale || 0.8);
        enemy.setDepth(100);
        enemy.setBodySize(enemy.width * 0.5, enemy.height * 0.8);
        enemy.setOffset(enemy.width * 0.25, enemy.height * 0.2);
        enemy.setData('hp', monsterData.hp);
        enemy.setData('damage', monsterData.damage);
        enemy.setData('damage', monsterData.damage);
        enemy.setData('speed', monsterData.speed);
        enemy.setData('timings', monsterData.timings);
        enemy.setData('type', 'minion');
        enemy.setData('state', 'chase');
        enemy.setData('lastAttack', 0);
        enemy.setCollideWorldBounds(true);

        this.enemies?.add(enemy);
        this.minionsSpawned++;

        // Schedule next spawn only if we haven't reached the limit
        if (this.minionsSpawned < this.totalMinionsPerLevel) {
            this.time.delayedCall(5000, () => {
                if (!this.isPaused && !this.isLevelClearing) {
                    this.spawnWave();
                }
            });
        }
    }

    private spawnBoss() {
        const monsterData = monstersData.find(m => m.id === 'monster2');
        if (!monsterData) return;

        const enemy = this.physics.add.sprite(1100, 672, 'monster2-idle');
        enemy.setVisible(false);

        const enemyDom = this.add.dom(1100, 672, 'img', {
            src: monsterData.assets.idle,
            style: 'width: auto; height: auto;'
        });
        enemyDom.setDepth(10);
        enemy.setData('dom', enemyDom);
        enemy.setOrigin(0.5, 1);
        enemy.setScale(monsterData.scale || 1.2);
        enemyDom.setScale(monsterData.scale || 1.2);
        enemy.setDepth(10);
        enemy.setBodySize(enemy.width * 0.6, enemy.height * 0.9);
        enemy.setOffset(enemy.width * 0.2, enemy.height * 0.1);
        enemy.setData('hp', monsterData.hp);
        enemy.setData('damage', monsterData.damage);
        enemy.setData('damage', monsterData.damage);
        enemy.setData('speed', monsterData.speed);
        enemy.setData('timings', monsterData.timings);
        enemy.setData('type', 'boss');
        enemy.setData('state', 'chase');
        enemy.setData('lastAttack', 0);
        enemy.setCollideWorldBounds(true);

        this.enemies?.add(enemy);
    }

    private setupPlayer() {
        if (this.player) this.player.destroy();

        this.player = this.physics.add.sprite(200, 672, 'player-idle');
        this.player.setVisible(false); // Hide static sprite
        this.player.setOrigin(0.5, 1);
        this.player.setScale(0.8);

        // Create DOM element for Player GIF
        const character = charactersData.find(c => c.id === this.characterId);
        const idleSrc = character?.assets?.idle || '';
        this.playerDom = this.add.dom(200, 672, 'img', {
            src: idleSrc,
            style: 'width: auto; height: auto;'
        });
        this.playerDom.setOrigin(0.5, 1);
        this.playerDom.setScale(0.8);
        this.playerDom.setDepth(10);
        this.player.setCollideWorldBounds(true);
        this.player.setBodySize(this.player.width * 0.5, this.player.height * 0.8);

        // Store character data
        if (character && character.timings) {
            this.player.setData('timings', character.timings);
            this.player.setData('walkSpeed', character.timings.walkSpeed || 250);
        } else {
            // Fallback
            this.player.setData('timings', {
                attack1Duration: 800, attack1HitDelay: 400,
                attack2Duration: 1200, attack2HitDelay: 600,
                dodgeDuration: 600, walkSpeed: 250
            });
            this.player.setData('walkSpeed', 250);
        }

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
        if (!this.player || this.isPaused) return;

        // Player Logic
        this.handlePlayerInput();
        this.handleVirtualControls(); // Add this line

        // Enemy Logic
        // Enemy Logic
        this.enemies?.children.iterate((enemy) => {
            const arcadeSprite = enemy as Phaser.Physics.Arcade.Sprite;
            if (arcadeSprite.active) {
                this.updateEnemyAI(arcadeSprite);

                // Sync DOM position
                const dom = arcadeSprite.getData('dom') as Phaser.GameObjects.DOMElement;
                if (dom) {
                    dom.setPosition(arcadeSprite.x, arcadeSprite.y);
                    // Flip logic for DOM (CSS transform)
                    const isFlipped = arcadeSprite.flipX;
                    (dom.node as HTMLElement).style.transform = isFlipped ? 'scaleX(-1)' : 'scaleX(1)';
                }
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

        const speed = this.player.getData('walkSpeed');

        if (left) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);
            if (!this.isDodging) {
                this.player.setTexture('player-walk');
                this.updatePlayerGif('player-walk');
            }
        } else if (right) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);
            if (!this.isDodging) this.player.setTexture('player-walk');
        } else {
            this.player.setVelocityX(0);
            if (!this.isDodging) {
                this.player.setTexture('player-idle');
                this.updatePlayerGif('player-idle');
            }
        }

        // Sync Player DOM
        if (this.playerDom) {
            this.playerDom.setPosition(this.player.x, this.player.y);
            // We use style transform for flip, but careful not to overwrite scale from setScale if Phaser applies it via style.
            // Phaser DOM setScale applies to the wrapper. We need to flip the image inside or the wrapper.
            // Simplest is to map sprite flip to scaleX(-1) style on the element.
            if (this.player.flipX) {
                (this.playerDom.node as HTMLElement).style.transform = 'scaleX(-1)';
            } else {
                (this.playerDom.node as HTMLElement).style.transform = 'scaleX(1)';
            }
        }

        // Sync Player DOM
        if (this.playerDom) {
            this.playerDom.setPosition(this.player.x, this.player.y);
            // We use style transform for flip, but careful not to overwrite scale from setScale if Phaser applies it via style.
            // Phaser DOM setScale applies to the wrapper. We need to flip the image inside or the wrapper.
            // Simplest is to map sprite flip to scaleX(-1) style on the element.
            if (this.player.flipX) {
                (this.playerDom.node as HTMLElement).style.transform = 'scaleX(-1)';
            } else {
                (this.playerDom.node as HTMLElement).style.transform = 'scaleX(1)';
            }
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

        const timings = this.player.getData('timings');
        const duration = type === 1 ? timings.attack1Duration : timings.attack2Duration;
        const hitDelay = type === 1 ? timings.attack1HitDelay : timings.attack2HitDelay;

        // Visual
        const texture = type === 1 ? 'player-atk1' : 'player-atk2';
        this.player.setTexture(texture);
        this.updatePlayerGif(texture);

        // Camera shake for heavy attack
        if (type === 2) {
            this.cameras.main.shake(100, 0.01);
        }

        // Delay hit logic based on timing
        this.time.delayedCall(hitDelay, () => {
            if (!this.player || !this.isAttacking) return; // Verify state

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
        });

        // Reset state after full duration
        this.time.delayedCall(duration, () => {
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

        const timings = this.player.getData('timings');
        const duration = timings.dodgeDuration || 600;

        this.player.setTexture('player-dodge');
        this.updatePlayerGif('player-dodge');
        this.player.setAlpha(0.5); // Visual invulnerability
        const dodgeDir = this.player.flipX ? -1 : 1;
        this.player.setVelocityX(dodgeDir * 600); // Dash speed

        this.time.delayedCall(duration, () => {
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
                this.updateEnemyGif(enemy, `${monsterId}-walk`);
            } else if (now > lastAttack + 2000) {
                // Within range and cooldown over, prepare attack
                enemy.setVelocityX(0);
                enemy.setData('state', 'prepare');
                enemy.setTexture(`${monsterId}-prepare` || `${monsterId}-idle`);
                this.updateEnemyGif(enemy, `${monsterId}-prepare`);

                const timings = enemy.getData('timings');
                const prepareDuration = timings?.prepareDuration || 1000;

                this.time.delayedCall(prepareDuration, () => {
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
                this.updateEnemyGif(enemy, `${monsterId}-hit`); // Assuming hit state exists
                this.time.delayedCall(800, () => {
                    if (enemy.active && enemy.getData('state') === 'defend') {
                        enemy.setData('state', 'chase');
                    }
                });
            } else {
                // In range but on cooldown, stay idle
                enemy.setVelocityX(0);
                enemy.setTexture(`${monsterId}-idle`);
                this.updateEnemyGif(enemy, `${monsterId}-idle`);
            }
        }
    }

    private performMonsterAttack(enemy: Phaser.Physics.Arcade.Sprite, monsterId: string) {
        if (!enemy.active || !this.player) return;

        const isBoss = enemy.getData('type') === 'boss';
        const timings = enemy.getData('timings');
        let attackType = 'attack';

        // Randomly choose between normal attack and special scream for boss
        if (isBoss && Phaser.Math.Between(0, 1) === 1) {
            attackType = 'special';
        }

        enemy.setTexture(`${monsterId}-${attackType}`);
        this.updateEnemyGif(enemy, `${monsterId}-${attackType}`);

        // Use configured timings or defaults
        const hitDelay = timings?.hitDelay || 500;
        const totalDuration = timings?.attackDuration || 1000;

        // Damage timing sync
        this.time.delayedCall(hitDelay, () => {
            if (!enemy.active || !this.player) return;

            const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
            // Increased ranges slightly for fairness
            const range = attackType === 'special' ? 200 : 150;

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
        });

        // Recovery phase - back to chase after full attack duration
        this.time.delayedCall(totalDuration, () => {
            if (enemy.active) {
                enemy.setData('state', 'chase');
                enemy.setData('lastAttack', this.time.now);
            }
        });
    }

    private monsterDeath(enemy: Phaser.Physics.Arcade.Sprite) {
        if (enemy.getData('state') === 'death') return;

        const monsterId = enemy.texture.key.split('-')[0];
        const timings = enemy.getData('timings');
        const deathDuration = timings?.deathDuration || 800;

        enemy.setData('state', 'death');
        enemy.setVelocity(0, 0);
        enemy.setTexture(`${monsterId}-death`);
        this.updateEnemyGif(enemy, `${monsterId}-death`);

        // Remove DOM on destroy
        const dom = enemy.getData('dom') as Phaser.GameObjects.DOMElement;
        if (dom) {
            this.time.delayedCall(deathDuration, () => dom.destroy());
        }

        // Scream effect
        this.cameras.main.shake(300, 0.02);
        enemy.setTint(0xff0000);

        if (enemy.getData('type') === 'minion') {
            this.minionsKilled++;
            console.log(`[BattleScene] Minion killed! Total: ${this.minionsKilled}/${this.totalMinionsPerLevel}`);
        }

        this.time.delayedCall(deathDuration, () => {
            this.createHitEffect(enemy.x, enemy.y);
            enemy.destroy();
        });
    }

    private updatePlayerGif(key: string) {
        if (!this.playerDom) return;
        const character = charactersData.find(c => c.id === this.characterId);
        if (!character || !character.assets) return;

        // Map key 'player-walk' back to asset url
        // This is a bit indirect but works if we use the same keys map
        let src = '';
        if (key === 'player-idle') src = character.assets.idle;
        if (key === 'player-walk') src = character.assets.walk;
        if (key === 'player-atk1') src = character.assets.attack1;
        if (key === 'player-atk2') src = character.assets.attack2;
        if (key === 'player-dodge') src = character.assets.dodge;

        if (src && (this.playerDom.node as HTMLImageElement).src !== src) { // Only update if different to avoid reloading gif
            (this.playerDom.node as HTMLImageElement).src = src;
        }
    }

    private updateEnemyGif(enemy: Phaser.Physics.Arcade.Sprite, key: string) {
        const dom = enemy.getData('dom') as Phaser.GameObjects.DOMElement;
        if (!dom) return;

        const monsterId = enemy.texture.key.split('-')[0];
        const mData = monstersData.find(m => m.id === monsterId);
        if (!mData) return;

        let src = '';
        // Extract action from key e.g. 'monster1-walk' -> 'walk'
        const action = key.split('-')[1];

        if (action === 'idle') src = mData.assets.idle;
        if (action === 'walk') src = mData.assets.walk;
        if (action === 'attack') src = mData.assets.attack;
        if (action === 'prepare') src = mData.assets.prepare || '';
        if (action === 'death') src = mData.assets.death || '';
        if (action === 'hit') src = mData.assets.hit || ''; // Assuming hit exists or mapped

        // Manual mapping for special if needed
        if (key.includes('special')) src = mData.assets.special || mData.assets.attack;

        if (src && (dom.node as HTMLImageElement).src !== src) {
            (dom.node as HTMLImageElement).src = src;
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

        // Lose Condition
        if (this.playerHealth <= 0 && this.scene.isActive()) {
            this.showGameOver();
            return;
        }

        // Level Completion Logic
        if (this.currentLevel === 1) {
            if (this.minionsKilled >= this.totalMinionsPerLevel) {
                console.log('[BattleScene] Level 1 Complete! Spawning reward.');
                this.isLevelClearing = true;
                this.spawnRewardChest();
            }
        } else if (this.currentLevel === 2) {
            const boss = this.enemies?.getFirstAlive();
            if (!boss) {
                console.log('[BattleScene] Level 2 Complete! Spawning reward.');
                this.isLevelClearing = true;
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
            .setDepth(3000)
            .setName('level-clear-bg');

        const banner = this.add.rectangle(640, 360, 800, 200, 0xffffff, 1)
            .setStrokeStyle(4, 0x00ffff)
            .setDepth(3001)
            .setName('level-clear-text');

        const titleText = this.add.text(640, 330, "LEVEL CLEAR!", {
            fontSize: '64px', color: '#0000ff', fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(3002).setName('level-clear-text');

        const subText = this.add.text(640, 400, "Touch the Chest to claim your Reward", {
            fontSize: '24px', color: '#333333'
        }).setOrigin(0.5).setDepth(3002).setName('level-clear-text');

        // Chest spawn - Moved to center below text and increased depth to be visible on overlay
        const chest = this.add.text(640, 520, '📦', { fontSize: '100px' })
            .setInteractive({ useHandCursor: true })
            .setOrigin(0.5)
            .setName('chest')
            .setDepth(3005);

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
        // Pick a project based on level
        const projectIndex = this.currentLevel === 1 ? Phaser.Math.Between(0, 2) : Phaser.Math.Between(3, 5);
        const project = projectsData[projectIndex];

        this.pauseGame();

        // Dispatch event to show React modal
        window.dispatchEvent(new CustomEvent('show-reward-modal', {
            detail: { project }
        }));
    }

    private pauseGame() {
        this.isPaused = true;
        this.physics.pause();
        this.time.paused = true;

        // Stop any player velocity
        if (this.player) {
            this.player.setVelocity(0, 0);
            this.player.setTexture('player-idle');
        }

        // Stop all enemies
        this.enemies?.children.iterate((enemy) => {
            const arcadeSprite = enemy as Phaser.Physics.Arcade.Sprite;
            arcadeSprite.setVelocity(0, 0);
            return true;
        });
    }

    private resumeGame() {
        this.isPaused = false;
        this.physics.resume();
        this.time.paused = false;

        // Level Transition Logic
        if (this.currentLevel === 1) {
            this.currentLevel = 2;
            this.setupLevel();
        } else {
            this.scene.start('RewardScene', { characterId: this.characterId });
        }
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

        const speed = this.player.getData('walkSpeed');

        if (leftDown && !this.isAttacking && !this.isDodging) {
            this.player.setVelocityX(-speed);
            this.player.setFlipX(true);
            this.player.setTexture('player-walk');
        } else if (rightDown && !this.isAttacking && !this.isDodging) {
            this.player.setVelocityX(speed);
            this.player.setFlipX(false);
            this.player.setTexture('player-walk');
        }
    }
}
