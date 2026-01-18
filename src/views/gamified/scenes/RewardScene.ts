import * as Phaser from 'phaser';
import projectsData from '@/src/data/projects.json';

export class RewardScene extends Phaser.Scene {
    private characterId: string = 'painter';

    constructor() {
        super({ key: 'RewardScene' });
    }

    init(data: { characterId: string }) {
        this.characterId = data.characterId;
    }

    create() {
        // Add background
        this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.9);

        // Chest placeholder
        const chest = this.add.text(640, 360, '🎁 OPEN CHEST', {
            fontSize: '48px',
            color: '#ffff00',
            backgroundColor: '#333300',
            padding: { x: 40, y: 20 },
        }).setOrigin(0.5).setInteractive();

        // Instructional Text
        const instruction = this.add.text(640, 450, 'Click to claim your rewards!', {
            fontSize: '24px',
            color: '#aaaaaa',
        }).setOrigin(0.5);

        chest.on('pointerdown', () => {
            // Shake effect
            this.cameras.main.shake(100, 0.005);

            // "Open" animation (simulate by changing text/removing)
            chest.destroy();
            instruction.destroy();
            this.showRewards();
        });

        chest.on('pointerover', () => chest.setStyle({ color: '#ffffff' }));
        chest.on('pointerout', () => chest.setStyle({ color: '#ffff00' }));
    }

    private showRewards() {
        // Detect if mobile viewport
        const isMobile = window.innerWidth < 768;
        const titleSize = isMobile ? '48px' : '64px';
        const subtitleSize = isMobile ? '18px' : '24px';
        const headingSize = isMobile ? '24px' : '32px';
        const projectNameSize = isMobile ? '20px' : '24px';
        const descSize = isMobile ? '14px' : '16px';
        const techSize = isMobile ? '12px' : '14px';
        const buttonSize = isMobile ? '18px' : '20px';

        // Victory text
        this.add.text(640, 100, 'VICTORY!', {
            fontSize: titleSize,
            color: '#00ff00',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        this.add.text(640, isMobile ? 160 : 180, 'You have defeated the villain!', {
            fontSize: subtitleSize,
            color: '#ffffff',
        }).setOrigin(0.5);

        // Get character-specific projects
        const characterRole = this.getCharacterRole(this.characterId);
        const characterProjects = projectsData.filter(
            (project) => project.category === characterRole || project.category === 'fullstack'
        );

        // Display projects
        this.add.text(640, isMobile ? 210 : 250, 'Your Rewards:', {
            fontSize: headingSize,
            color: '#ffaa00',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        const startY = isMobile ? 260 : 320;
        const spacing = isMobile ? 100 : 120;
        const wrapWidth = isMobile ? 600 : 800;

        characterProjects.slice(0, 2).forEach((project, index) => {
            const yPos = startY + index * spacing;

            this.add.text(640, yPos, project.name, {
                fontSize: projectNameSize,
                color: '#ffffff',
                fontStyle: 'bold',
            }).setOrigin(0.5);

            this.add.text(640, yPos + 30, project.description, {
                fontSize: descSize,
                color: '#cccccc',
                wordWrap: { width: wrapWidth },
            }).setOrigin(0.5);

            this.add.text(640, yPos + (isMobile ? 60 : 70), `Tech: ${project.techStack.join(', ')}`, {
                fontSize: techSize,
                color: '#888888',
                wordWrap: { width: wrapWidth },
            }).setOrigin(0.5);
        });

        // Return button - positioned lower on mobile
        const buttonY = isMobile ? 600 : 650;
        const returnButton = this.add.text(640, buttonY, 'Return to Character Selection', {
            fontSize: buttonSize,
            color: '#00ffff',
            backgroundColor: '#333333',
            padding: { x: isMobile ? 15 : 20, y: isMobile ? 8 : 10 },
        }).setOrigin(0.5).setInteractive();

        returnButton.on('pointerdown', () => {
            // This will be handled by the Game component to return to React
            window.dispatchEvent(new CustomEvent('return-to-selection'));
        });

        returnButton.on('pointerover', () => returnButton.setStyle({ backgroundColor: '#555555' }));
        returnButton.on('pointerout', () => returnButton.setStyle({ backgroundColor: '#333333' }));
    }

    private getCharacterRole(characterId: string): string {
        const roleMap: { [key: string]: string } = {
            '1': 'frontend',
            '2': 'backend',
            '3': 'devops',
            'painter': 'frontend',
            'architect': 'backend',
            'wizard': 'devops',
        };
        return roleMap[characterId] || 'frontend';
    }
}
