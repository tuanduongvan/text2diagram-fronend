import { create } from 'zustand';

type ChangeNameStore = {
  isOpen: boolean;
  projectId: string | null;
  projectName: string;
  onOpen: (id: string, name: string) => void;
  onClose: () => void;
  setProjectName: (name: string) => void;
};

export const useChangeName = create<ChangeNameStore>((set) => ({
  isOpen: false,
  projectName: '',
  projectId: null,
  onOpen: (id: string, name: string) =>
    set({ isOpen: true, projectId: id, projectName: name }),
  onClose: () =>
    set({ isOpen: false, projectId: null, projectName: 'Untitled' }),
  setProjectName: (name) => set({ projectName: name })
}));
