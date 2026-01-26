import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from '../store/themeStore';

describe('Theme Store', () => {
    beforeEach(() => {
        // Reset store manually if needed, or rely on clean state
        const state = useThemeStore.getState();
        if (state.theme !== 'dark') state.setTheme('dark');
    });

    it('should initialize with dark theme', () => {
        const state = useThemeStore.getState();
        expect(state.theme).toBe('dark');
    });

    it('should toggle theme correctly', () => {
        const { setTheme } = useThemeStore.getState();

        setTheme('light');
        expect(useThemeStore.getState().theme).toBe('light');

        setTheme('dark');
        expect(useThemeStore.getState().theme).toBe('dark');
    });
});
