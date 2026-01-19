import * as Phaser from 'phaser';
import { BaseEntity } from './BaseEntity';
import charactersData from '@/src/data/characters.json';

export class Player extends BaseEntity {
    private isAttacking: boolean = false;
    private isDodging: boolean = false;
    private lastAttackTime: number = 0;
    private lastDodgeTime: number = 0;

    // Stats
    public health: number = 100;
    private walkSpeed: number = 250;
    private currentAnim: string = 'idle'; // Track current animation state
    private character: { id: string; assets?: { idle: string; walk: string; attack1: string; attack2: string; dodge: string }; timings?: { walkSpeed: number; attack1Duration: number; attack2Duration: number; attack1HitDelay: number; attack2HitDelay: number; dodgeDuration: number }; sounds?: { attack: string; death: string } } | undefined;

    private mobileMoveDir: 'left' | 'right' | 'none' = 'none';
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private keys?: { [key: string]: Phaser.Input.Keyboard.Key };

    constructor(scene: Phaser.Scene, x: number, y: number, characterId: string) {
        // Player Fixed Size: 60x120
        super(scene, x, y, 'player-idle', 60, 120);

        this.setDepth(100);
        this.loadCharacterData(characterId);
        this.setupMobileControls();
    }

    private setupMobileControls() {
        // Mobile jump
        window.addEventListener('mobile-jump', () => {
            if (this.body?.touching.down) {
                this.setVelocityY(-500);
            }
        });

        // Mobile movement
        window.addEventListener('mobile-move', ((e: CustomEvent) => {
            const { direction, active } = e.detail;
            if (active) {
                this.mobileMoveDir = direction as 'left' | 'right';
            } else {
                this.mobileMoveDir = 'none';
            }
        }) as EventListener);

        // Mobile attack
        window.addEventListener('mobile-attack', ((e: CustomEvent) => {
            const { type } = e.detail;
            const time = this.scene.time.now;
            if (type === 1 && time > this.lastAttackTime + 500) {
                this.performAttack(1, time);
            } else if (type === 2 && time > this.lastAttackTime + 800) {
                this.performAttack(2, time);
            }
        }) as EventListener);

        // Mobile dodge
        window.addEventListener('mobile-dodge', () => {
            const time = this.scene.time.now;
            if (time > this.lastDodgeTime + 1000) {
                this.performDodge(time);
            }
        });
    }

    private loadCharacterData(id: string) {
        this.character = charactersData.find(c => c.id === id);
        if (this.character) {
            // Initialize DOM with Idle asset
            if (this.character.assets?.idle) {
                this.createDOMElement(this.character.assets.idle, 0.8);
            }

            // Set stats
            if (this.character.timings?.walkSpeed) {
                this.walkSpeed = this.character.timings.walkSpeed;
            }
        }
    }

    public setupControls(cursors: Phaser.Types.Input.Keyboard.CursorKeys, keys: { [key: string]: Phaser.Input.Keyboard.Key }) {
        this.cursors = cursors;
        this.keys = keys;
    }

    public handleInput(time: number) {
        if (this.isAttacking || !this.cursors || !this.keys) return;

        // --- Movement ---
        const left = this.cursors.left?.isDown || this.keys.left?.isDown || this.mobileMoveDir === 'left';
        const right = this.cursors.right?.isDown || this.keys.right?.isDown || this.mobileMoveDir === 'right';
        const up = this.cursors.up?.isDown || this.keys.up?.isDown;

        if (left) {
            this.setVelocityX(-this.walkSpeed);
            this.setFlipX(true);
            if (!this.isDodging) this.setAnimation('walk');
        } else if (right) {
            this.setVelocityX(this.walkSpeed);
            this.setFlipX(false);
            if (!this.isDodging) this.setAnimation('walk');
        } else {
            this.setVelocityX(0);
            if (!this.isDodging) this.setAnimation('idle');
        }

        // Jump (only if on floor)
        if (up && this.body?.touching.down) {
            this.setVelocityY(-500);
        }

        // --- Combat actions ---
        // Attack 1 (Space)
        if (this.cursors.space && Phaser.Input.Keyboard.JustDown(this.cursors.space) && time > this.lastAttackTime + 500) {
            this.performAttack(1, time);
        }

        // Attack 2 (K)
        if (this.keys.attack2 && Phaser.Input.Keyboard.JustDown(this.keys.attack2) && time > this.lastAttackTime + 800) {
            this.performAttack(2, time);
        }

        // Dodge (L)
        if (this.keys.dodge && Phaser.Input.Keyboard.JustDown(this.keys.dodge) && time > this.lastDodgeTime + 1000) {
            this.performDodge(time);
        }
    }

    private setAnimation(key: 'idle' | 'walk' | 'atk1' | 'atk2' | 'dodge') {
        if (!this.character?.assets) return;
        if (this.currentAnim === key) return; // Prevent restarting same animation

        this.currentAnim = key; // Update state

        let asset = this.character.assets.idle;
        if (key === 'walk') asset = this.character.assets.walk;
        if (key === 'atk1') asset = this.character.assets.attack1;
        if (key === 'atk2') asset = this.character.assets.attack2;
        if (key === 'dodge') asset = this.character.assets.dodge;

        this.updateGif(asset);

        // Also update Phaser texture key for reference (optional but good for debugging)
        // this.setTexture(`player-${key}`); 
    }

    private performAttack(type: 1 | 2, time: number) {
        this.isAttacking = true;
        this.lastAttackTime = time;

        const timings = this.character?.timings || {
            attack1Duration: 1200,
            attack2Duration: 1200,
            walkSpeed: 250,
            attack1HitDelay: 400,
            attack2HitDelay: 600,
            dodgeDuration: 600
        };
        const duration = type === 1 ? timings.attack1Duration : timings.attack2Duration;
        const hitDelay = type === 1 ? timings.attack1HitDelay : timings.attack2HitDelay;

        // Debug: Log duration to help user tune characters.json
        // console.log(`Performing Attack ${type} for ${this.character?.name || 'Unknown'}: Duration ${duration}ms`);

        this.setAnimation(type === 1 ? 'atk1' : 'atk2');

        // Audio
        if (this.character?.sounds?.attack) {
            this.scene.sound.play(`player-attack-${this.character.id}`);
        }

        // Camera shake
        if (type === 2) {
            this.scene.cameras.main.shake(100, 0.01);
        }

        // Callback for damage deal (handled by scene or event)
        this.scene.time.delayedCall(hitDelay, () => {
            if (!this.active || !this.isAttacking) return;
            this.emit('attack-hit', type); // Emit event for scene to handle damage
        });

        // Reset
        this.scene.time.delayedCall(duration, () => {
            this.isAttacking = false;
            this.setAnimation('idle');
        });
    }

    private performDodge(time: number) {
        this.isDodging = true;
        this.lastDodgeTime = time;
        const duration = this.character?.timings?.dodgeDuration || 600;

        this.setAnimation('dodge');
        this.setAlpha(0.5); // Visual invulnerability

        const dodgeDir = this.flipX ? -1 : 1;
        this.setVelocityX(dodgeDir * 600);

        this.scene.time.delayedCall(duration, () => {
            this.isDodging = false;
            this.setAlpha(1);
            this.setAnimation('idle');
        });
    }

    public takeDamage(amount: number) {
        if (this.isDodging) return; // Invulnerable
        this.health -= amount;
        this.setTint(0xff0000);
        this.scene.time.delayedCall(200, () => this.clearTint());

        if (this.health <= 0) {
            this.scene.sound.play('player-death');
        }
    }
}
