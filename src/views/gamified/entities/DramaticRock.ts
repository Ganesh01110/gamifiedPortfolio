import * as Phaser from 'phaser';

interface BattleSceneLike extends Phaser.Scene {
    currentGroundY: number;
}

export class DramaticRock extends Phaser.Physics.Arcade.Sprite {
    private startY: number;
    private floatTween?: Phaser.Tweens.Tween;
    private isShattering: boolean = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'dramatic-rock');

        this.startY = y;
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setOrigin(0.5, 0.5);
        this.setDepth(200); // Foreground

        // Physics body setup
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(true);
        body.setGravityY(-300); // Suspend
        body.setImmovable(false);
        body.setSize(this.width * 0.6, this.height * 0.6);

        // Visual setup
        this.setScale(Phaser.Math.FloatBetween(0.5, 0.8));

        this.startFloating();
    }

    private startFloating() {
        this.floatTween = this.scene.tweens.add({
            targets: this,
            y: this.startY - 25,
            duration: Phaser.Math.Between(1500, 3000),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    public preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);

        const groundY = (this.scene as BattleSceneLike).currentGroundY || 580;
        if (this.y >= groundY - 20 && !this.isShattering) {
            this.destroyRock(true);
        }
    }

    public takeDamage() {
        this.destroyRock(false);
    }

    private createLightningSplashes(x: number, y: number) {
        const colors = [0x00ff00, 0x00ffff, 0xff0000];
        colors.forEach(color => {
            for (let i = 0; i < 4; i++) {
                const line = this.scene.add.graphics();
                line.lineStyle(3, color, 1);
                const angle = Phaser.Math.Between(0, 360);
                const length = Phaser.Math.Between(50, 150);
                const endX = x + Math.cos(angle * (Math.PI / 180)) * length;
                const endY = y + Math.sin(angle * (Math.PI / 180)) * length;
                const midX = x + (endX - x) * 0.5 + Phaser.Math.Between(-20, 20);
                const midY = y + (endY - y) * 0.5 + Phaser.Math.Between(-20, 20);
                line.beginPath();
                line.moveTo(x, y);
                line.lineTo(midX, midY);
                line.lineTo(endX, endY);
                line.strokePath();
                line.setDepth(1000);
                this.scene.tweens.add({ targets: line, alpha: 0, duration: 200, onComplete: () => line.destroy() });
            }
        });
    }

    public destroyRock(withLightning: boolean = false) {
        if (this.isShattering) return;
        this.isShattering = true;
        if (withLightning) {
            this.createLightningSplashes(this.x, this.y);
            this.scene.cameras.main.shake(200, 0.02);
            const flash = this.scene.add.rectangle(640, 360, 1280, 720, 0xffffff, 0.3).setScrollFactor(0).setDepth(2000);
            this.scene.tweens.add({ targets: flash, alpha: 0, duration: 100, onComplete: () => flash.destroy() });
        }
        if (this.scene.textures.exists('slash-effect')) {
            const particles = this.scene.add.particles(this.x, this.y, 'slash-effect', {
                speed: { min: 150, max: 300 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.15, end: 0 },
                lifespan: 600,
                gravityY: 600,
                quantity: 30,
                tint: 0x666666
            });
            this.scene.time.delayedCall(700, () => particles.destroy());
        }
        if (this.floatTween) this.floatTween.remove();
        this.destroy();
    }
}
