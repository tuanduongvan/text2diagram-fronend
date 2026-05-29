// import { create } from 'zustand';

// type ChangeThumbnailStore = {
//   isOpen: boolean;
//   selectedThumbnail: string | null;
//   onOpen: () => void;
//   onClose: () => void;
//   setSelectedThumbnail: (icon: string) => void;
//   uploadCustomThumbnail: (file: File) => void;
// };

// export const useChangeThumbnail = create<ChangeThumbnailStore>((set) => ({
//   isOpen: false,
//   selectedThumbnail: null,
//   onOpen: () => set({ isOpen: true }),
//   onClose: () => set({ isOpen: false }),
//   setSelectedThumbnail: (icon) => set({ selectedThumbnail: icon }),
//   uploadCustomThumbnail: (file) => {
//     console.log('Uploading file:', file);
//   }
// }));

import { create } from 'zustand';

type ChangeThumbnailStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  selectedThumbnail: string | null;
  setThumbnail: (icon: string) => void;
  clearThumbnail: () => void;
};

export const useChangeThumbnail = create<ChangeThumbnailStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
  selectedThumbnail: null,
  setThumbnail: (icon) => set({ selectedThumbnail: icon }),
  clearThumbnail: () => set({ selectedThumbnail: null })
}));
