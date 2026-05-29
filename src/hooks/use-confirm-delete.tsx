// import { create } from 'zustand';

// type ConfirmDeleteStore = {
//   isOpen: boolean;
//   projectId: string | null;
//   onOpen: () => void;
//   onClose: () => void;
//   confirmDelete: () => void;
// };

// export const useConfirmDelete = create<ConfirmDeleteStore>((set) => ({
//   isOpen: false,
//   projectId: null,
//   onOpen: () => set({ isOpen: true }),
//   onClose: () => set({ isOpen: false }),
//   confirmDelete: () =>
//     set((state) => {
//       if (state.projectId) {
//         console.log(`Deleted project with ID: ${state.projectId}`);
//       }
//       return { isOpen: false, projectId: null };
//     })
// }));

import { create } from 'zustand';

type ConfirmDeleteStore = {
  isOpen: boolean;
  projectId: string | null;
  onOpen: (id: string) => void;
  onClose: () => void;
  reset: () => void;
};

export const useConfirmDelete = create<ConfirmDeleteStore>((set) => ({
  isOpen: false,
  projectId: null,
  onOpen: (id: string) => set({ isOpen: true, projectId: id }),
  onClose: () => set({ isOpen: false, projectId: null }),
  reset: () => set({ isOpen: false, projectId: null })
}));
