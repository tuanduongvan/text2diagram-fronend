import { create } from 'zustand';

type ChangePasswordStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useChangePassword = create<ChangePasswordStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false })
}));
