import * as Phaser from 'phaser';
import { BaseEntity } from './BaseEntity';
import monstersData from '@/src/data/monsters.json';
import type { Player } from './Player';

export class Enemy extends BaseEntity {
    public id: string;
    public type: 'minion' | 'boss';
    public spawnLevel: number;

    // Stats
    public hp: number = 100;
    public damage: number = 10;
    private speed: number = 80;
    private monsterData: {
        id: string;
        hp: number;
        damage: number;
        speed?: number;
        assets?: { idle: string; walk?: string; attack?: string; attack2?: string; special?: string;[key: string]: string | undefined };
        timings?: { prepareDuration?: number; hitDelay?: number; attackDuration?: number; deathDuration?: number };
        scale?: number;
        animationScales?: { [key: string]: number | { start: number; end: number } };
        sounds?: { attack?: string; roar?: string; death?: string };
        facing?: 'left' | 'right';
        visualOffset?: { x: number; y: number };
    } | undefined;

    // AI State
    private aiState: 'chase' | 'prepare' | 'attack' | 'defend' | 'death' = 'chase';
    private lastAttackTime: number = 0;
    private target?: Player; // Reference to player for tracking
    private currentAnim: string = '';

    constructor(scene: Phaser.Scene, x: number, y: number, monsterId: string, level: number = 1) {
        // Determine size based on ID
        const isBoss = monsterId === 'monster2' || level === 2;
        const w = isBoss ? 100 : 80;
        const h = isBoss ? 180 : 120;

        super(scene, x, y, `${monsterId}-idle`, w, h);

        this.id = monsterId;
        this.spawnLevel = level;
        this.type = isBoss ? 'boss' : 'minion';
        this.setDepth(isBoss ? 10 : 100);

        this.loadMonsterData(monsterId);
    }

    private loadMonsterData(id: string) {
        this.monsterData = monstersData.find(m => m.id === id) as typeof this.monsterData;
        if (this.monsterData) {
            this.hp = this.monsterData.hp;
            this.damage = this.monsterData.damage;
            this.speed = this.monsterData.speed || 80;

            if (this.monsterData.assets?.idle) {
                const scale = this.monsterData.scale || (this.type === 'boss' ? 1.2 : 0.8);
                this.createDOMElement(this.monsterData.assets.idle, scale);
                // Apply visual offset
                if (this.monsterData.visualOffset) {
                    this.visualOffset = this.monsterData.visualOffset;
                    this.syncDOM();
                }
            }
        }
    }

    public setTarget(player: Player) {
        this.target = player;
    }

    public updateAI(time: number) {
        if (!this.target || !this.active || this.aiState === 'death') return;

        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);

        if (this.aiState === 'chase') {
            // Movement
            if (dist > 100) {
                if (this.x < this.target.x) {
                    this.setVelocityX(this.speed);
                    this.setFlipX(this.monsterData?.facing === 'left');
                } else {
                    this.setVelocityX(-this.speed);
                    this.setFlipX(this.monsterData?.facing !== 'left');
                }
                this.setAnimation('walk');
            } else if (time > this.lastAttackTime + 2000) {
                // Prepare Attack
                this.setVelocityX(0);
                this.aiState = 'prepare';
                this.setAnimation('prepare');

                const prepareDuration = this.monsterData?.timings?.prepareDuration || 1000;
                this.scene.time.delayedCall(prepareDuration, () => {
                    if (this.active && this.aiState === 'prepare') {
                        this.performAttack();
                    }
                });
            } else {
                // Idle (Cooldown)
                this.setVelocityX(0);
                this.setAnimation('idle');
            }
        }
    }

    private performAttack() {
        this.aiState = 'attack';

        // Level 1 restriction: No special/heavy attacks (except for the Painter's specific minion if needed)
        // Architect and DevOps monsters (4 and 3) should only use Attack1 in Level 1
        const canUseSpecial = this.spawnLevel > 1;
        const isSpecial = canUseSpecial && this.type === 'boss' && Phaser.Math.Between(0, 1) === 1;

        let attackKey: 'attack' | 'attack2' | 'special' = 'attack';
        if (isSpecial) {
            attackKey = this.monsterData?.assets?.attack2 ? 'attack2' : 'special';
        }

        this.setAnimation(attackKey as 'attack' | 'attack2');
        // 'special' fallback is handled by setAnimation if needed, or we can add it to the type

        // Audio
        if (this.monsterData?.sounds?.attack) {
            this.scene.sound.play(`monster-attack-${this.id}`);
        }
        if (isSpecial && this.monsterData?.sounds?.roar) {
            this.scene.sound.play(`monster-roar-${this.id}`);
        }

        const timings = this.monsterData?.timings;
        const hitDelay = timings?.hitDelay || 500;
        const duration = timings?.attackDuration || 1000;

        // Hit Logic
        this.scene.time.delayedCall(hitDelay, () => {
            if (!this.active || !this.target) return;

            const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
            const range = isSpecial ? 200 : 150;

            if (dist < range) {
                // Deal Damage
                const dmg = isSpecial ? 20 : this.damage;
                this.target.takeDamage(dmg);
                this.scene.cameras.main.shake(100, 0.01);
            }
        });

        // Reset
        this.scene.time.delayedCall(duration, () => {
            if (this.active && this.aiState !== 'death') {
                this.aiState = 'chase';
                this.lastAttackTime = this.scene.time.now;
            }
        });
    }

    public takeDamage(amount: number) {
        if (this.aiState === 'death') return;

        this.hp -= amount;
        this.setTint(this.aiState === 'defend' ? 0x888888 : 0xff0000);
        this.scene.time.delayedCall(150, () => this.clearTint());

        // Knockback
        const dir = this.flipX ? 1 : -1;
        this.setVelocityX(dir * 200);
        this.setVelocityY(-200);

        if (this.hp <= 0) {
            this.die();
        }
    }

    private die() {
        if (this.aiState === 'death') return;
        this.aiState = 'death';

        // Audio
        if (this.monsterData?.sounds?.death) {
            this.scene.sound.play(`monster-death-${this.id}`);
        }

        this.setVelocity(0, 0);
        this.setAnimation('death');

        const deathDuration = this.monsterData?.timings?.deathDuration || 800;

        this.emit('death', this);

        this.scene.time.delayedCall(deathDuration, () => {
            this.emit('vanished', this);
            this.destroy();
        });
    }

    private setAnimation(key: 'idle' | 'walk' | 'attack' | 'attack2' | 'prepare' | 'death') {
        if (!this.monsterData?.assets || this.currentAnim === key) return;

        let asset = this.monsterData.assets[key];
        if (!asset && key === 'prepare') asset = this.monsterData.assets.idle;
        if (!asset && key === 'attack2') asset = this.monsterData.assets.attack;

        if (asset) {
            this.currentAnim = key;
            this.updateGif(asset);

            // Apply animation-specific scaling
            const animationScaleInfo = this.monsterData.animationScales?.[key];
            const defaultScale = this.monsterData.scale || (this.type === 'boss' ? 1.2 : 0.8);

            if (typeof animationScaleInfo === 'number') {
                this.setBaseScale(defaultScale * animationScaleInfo);
            } else if (animationScaleInfo && typeof animationScaleInfo === 'object') {
                const info = animationScaleInfo as { start: number; end: number };
                const start = info.start || 1.0;
                const end = info.end || 1.0;

                // Determine duration
                let duration = 500; // Default
                if (key === 'attack') duration = this.monsterData.timings?.attackDuration || 1000;
                else if (key === 'attack2') duration = this.monsterData.timings?.attackDuration || 1000;
                else if (key === 'prepare') duration = this.monsterData.timings?.prepareDuration || 1000;
                else if (key === 'death') duration = this.monsterData.timings?.deathDuration || 2000;

                this.tweenBaseScale(defaultScale * start, defaultScale * end, duration);
            } else {
                this.setBaseScale(defaultScale);
            }
        }
    }
}

// import { Player } from './Player';
