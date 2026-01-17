import { create } from 'zustand';

export type ViewType = 'landing' | 'normal' | 'gamified';

interface ViewState {
    currentView: ViewType;
    selectedCharacter: string | null;
    setView: (view: ViewType) => void;
    setSelectedCharacter: (characterId: string | null) => void;
}

export const useViewStore = create<ViewState>((set) => ({
    currentView: 'landing',
    selectedCharacter: null,
    setView: (view) => set({ currentView: view }),
    setSelectedCharacter: (characterId) => set({ selectedCharacter: characterId }),
}));
