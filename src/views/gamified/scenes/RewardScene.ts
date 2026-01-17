import * as Phaser from 'phaser';
import projectsData from '@/src/data/projects.json';

export class RewardScene extends Phaser.Scene {
    private characterId: string = 'painter';

    constructor() {
        super({ key: 'RewardScene' });
    }

    init(data: { characterId: string }) {
        this.characterId = data.characterId || 'painter';
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
        // Victory text
        this.add.text(640, 100, 'VICTORY!', {
            fontSize: '64px',
            color: '#00ff00',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        this.add.text(640, 180, 'You have defeated the villain!', {
            fontSize: '24px',
            color: '#ffffff',
        }).setOrigin(0.5);

        // Get character-specific projects
        const characterRole = this.getCharacterRole(this.characterId);
        const characterProjects = projectsData.filter(
            (project) => project.category === characterRole || project.category === 'fullstack'
        );

        // Display projects
        this.add.text(640, 250, 'Your Rewards:', {
            fontSize: '32px',
            color: '#ffaa00',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        characterProjects.slice(0, 2).forEach((project, index) => {
            const yPos = 320 + index * 120;

            this.add.text(640, yPos, project.name, {
                fontSize: '24px',
                color: '#ffffff',
                fontStyle: 'bold',
            }).setOrigin(0.5);

            this.add.text(640, yPos + 30, project.description, {
                fontSize: '16px',
                color: '#cccccc',
                wordWrap: { width: 800 },
            }).setOrigin(0.5);

            this.add.text(640, yPos + 70, `Tech: ${project.techStack.join(', ')}`, {
                fontSize: '14px',
                color: '#888888',
            }).setOrigin(0.5);
        });

        // Return button
        const returnButton = this.add.text(640, 650, 'Return to Character Selection', {
            fontSize: '20px',
            color: '#00ffff',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 },
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
