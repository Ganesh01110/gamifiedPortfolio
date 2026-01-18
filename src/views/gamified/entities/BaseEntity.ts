import * as Phaser from 'phaser';

export class BaseEntity extends Phaser.Physics.Arcade.Sprite {
    protected domElement?: Phaser.GameObjects.DOMElement;
    protected fixedBodyWidth: number;
    protected fixedBodyHeight: number;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        fixedBodyWidth: number,
        fixedBodyHeight: number
    ) {
        super(scene, x, y, texture);

        this.scene = scene;
        this.fixedBodyWidth = fixedBodyWidth;
        this.fixedBodyHeight = fixedBodyHeight;

        // Add to scene and physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Standard setup
        this.setOrigin(0.5, 1);
        this.setVisible(false); // Hide sprite, show DOM
        this.setCollideWorldBounds(true);

        // Apply Fixed Physics Body
        this.ignoreDestroy = false;
        this.refreshBodySize();
    }

    protected createDOMElement(src: string, scale: number = 1) {
        if (this.domElement) this.domElement.destroy();

        const img = document.createElement('img');
        img.src = src;
        img.style.width = 'auto';
        img.style.height = 'auto';
        // Debug border can be removed later, kept optional if needed
        // img.style.border = '1px solid lime'; 

        this.domElement = this.scene.add.dom(this.x, this.y, img);
        this.domElement.setOrigin(0.5, 1);
        this.domElement.setScale(scale);
        this.domElement.setDepth(this.depth);

        // Initial sync
        this.syncDOM();
    }

    public refreshBodySize() {
        if (this.body) {
            this.setBodySize(this.fixedBodyWidth, this.fixedBodyHeight);
            // Height-based offset to align feet to bottom
            this.setOffset(
                (this.width - this.fixedBodyWidth) * 0.5,
                this.height - this.fixedBodyHeight
            );
        }
    }

    public syncDOM() {
        if (this.domElement && this.active) {
            this.domElement.setPosition(this.x, this.y);
            this.domElement.setDepth(this.depth);

            // Sync Flip
            const isFlipped = this.flipX;
            (this.domElement.node as HTMLElement).style.transform = isFlipped ? 'scaleX(-1)' : 'scaleX(1)';
        }
    }

    public updateGif(src: string) {
        if (this.domElement) {
            const img = this.domElement.node as HTMLImageElement;
            if (img.src !== src) {
                img.src = src;
                // Re-enforce physics after texture change might imply size change
                this.refreshBodySize();
            }
        }
    }

    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
        this.syncDOM();
    }

    destroy(fromScene?: boolean) {
        if (this.domElement) {
            this.domElement.destroy();
        }
        super.destroy(fromScene);
    }
}
