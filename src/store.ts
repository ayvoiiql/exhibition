import { create } from "zustand";
import type { ArtworkData } from "./types";

interface GalleryState {
  started: boolean;
  selectedArtwork: ArtworkData | null;
  focusedArtwork: ArtworkData | null;
  setStarted: (started: boolean) => void;
  selectArtwork: (artwork: ArtworkData | null) => void;
  setFocusedArtwork: (artwork: ArtworkData | null) => void;
}

export const useGalleryStore = create<GalleryState>((set) => ({
  started: false,
  selectedArtwork: null,
  focusedArtwork: null,
  setStarted: (started) => set({ started }),
  selectArtwork: (selectedArtwork) => set({ selectedArtwork }),
  setFocusedArtwork: (focusedArtwork) => set({ focusedArtwork }),
}));
