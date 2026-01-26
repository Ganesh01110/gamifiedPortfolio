import { describe, it, expect } from 'vitest';
import projectsData from '../data/projects.json';
import charactersData from '../data/characters.json';

describe('Data Integrity Tests', () => {
    describe('Projects Data', () => {
        it('should have all required fields for each project', () => {
            projectsData.forEach(project => {
                expect(project.id).toBeDefined();
                expect(project.name).toBeDefined();
                expect(typeof project.mockup).toBe('string');
                expect(project.mockup.length).toBeGreaterThan(0);
            });
        });

        it('should have unique project IDs', () => {
            const ids = projectsData.map(p => p.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });
    });

    describe('Characters Data', () => {
        it('should have valid animation sequences', () => {
            charactersData.forEach(char => {
                expect(char.assets).toBeDefined();
                expect(char.assets.idle).toContain('.gif');
                expect(char.assets.attack1).toContain('.gif');
            });
        });

        it('should have unique character IDs', () => {
            const ids = charactersData.map(c => c.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });
    });
});
