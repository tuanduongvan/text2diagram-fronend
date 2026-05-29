import { create } from 'zustand';

type ProjectStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useProject = create<ProjectStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false })
}));
