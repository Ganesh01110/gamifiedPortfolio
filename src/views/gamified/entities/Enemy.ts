import * as Phaser from 'phaser';
import { BaseEntity } from './BaseEntity';
import monstersData from '@/src/data/monsters.json';

export class Enemy extends BaseEntity {
    public id: string;
    public type: 'minion' | 'boss';

    // Stats
    public hp: number = 100;
    public damage: number = 10;
    private speed: number = 80;
    private monsterData: {
        id: string;
        hp: number;
        damage: number;
        speed?: number;
        assets?: { idle: string; walk?: string; attack?: string; special?: string;[key: string]: string | undefined };
        timings?: { prepareDuration?: number; hitDelay?: number; attackDuration?: number; deathDuration?: number };
        scale?: number;
    } | undefined;

    // AI State
    private aiState: 'chase' | 'prepare' | 'attack' | 'defend' | 'death' = 'chase';
    private lastAttackTime: number = 0;
    private target?: Player; // Reference to player for tracking

    constructor(scene: Phaser.Scene, x: number, y: number, monsterId: string) {
        // Determine size based on ID
        const isBoss = monsterId === 'monster2'; // simplistic check
        const w = isBoss ? 100 : 80;
        const h = isBoss ? 180 : 120;

        super(scene, x, y, `${monsterId}-idle`, w, h);

        this.id = monsterId;
        this.type = isBoss ? 'boss' : 'minion';
        this.setDepth(isBoss ? 10 : 100);

        this.loadMonsterData(monsterId);
    }

    private loadMonsterData(id: string) {
        this.monsterData = monstersData.find(m => m.id === id);
        if (this.monsterData) {
            this.hp = this.monsterData.hp;
            this.damage = this.monsterData.damage;
            this.speed = this.monsterData.speed || 80;

            if (this.monsterData.assets?.idle) {
                const scale = this.monsterData.scale || (this.type === 'boss' ? 1.2 : 0.8);
                this.createDOMElement(this.monsterData.assets.idle, scale);
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
                    this.setFlipX(false);
                } else {
                    this.setVelocityX(-this.speed);
                    this.setFlipX(true);
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
        const isSpecial = this.type === 'boss' && Phaser.Math.Between(0, 1) === 1;
        const attackKey = isSpecial ? 'special' : 'attack'; // Need asset mapping

        this.setAnimation(attackKey as 'attack' | 'prepare' | 'idle' | 'walk' | 'death');

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
                // Camera shake handled by scene usually, but can do here
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
        const dir = this.flipX ? 1 : -1; // Push back opposite to facing? simple logic
        this.setVelocityX(dir * 200);
        this.setVelocityY(-200);

        if (this.hp <= 0) {
            this.die();
        }
    }

    private die() {
        if (this.aiState === 'death') return;
        this.aiState = 'death';
        this.setVelocity(0, 0);
        this.setAnimation('death');

        const deathDuration = this.monsterData?.timings?.deathDuration || 800;

        // Immediate visual feedback + cleanup
        this.emit('death', this); // Notify scene

        this.scene.time.delayedCall(deathDuration, () => {
            this.destroy(); // BaseEntity cleans up DOM
        });
    }

    private setAnimation(key: 'idle' | 'walk' | 'attack' | 'prepare' | 'death') {
        if (!this.monsterData?.assets) return;

        // Simple mapping
        let asset = this.monsterData.assets[key];
        // Fallbacks
        if (!asset && key === 'prepare') asset = this.monsterData.assets.idle;

        if (asset) {
            this.updateGif(asset);
        }
    }
}

// Circular dependency fix helper logic if needed, but here simple types
import { Player } from './Player';
