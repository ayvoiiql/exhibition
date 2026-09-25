import { create } from "zustand";
import type { ArtworkData, RoomId } from "./types";

interface GalleryState {
  started: boolean;
  selectedArtwork: ArtworkData | null;
  focusedArtwork: ArtworkData | null;
  currentRoom: RoomId;
  setStarted: (started: boolean) => void;
  selectArtwork: (artwork: ArtworkData | null) => void;
  setFocusedArtwork: (artwork: ArtworkData | null) => void;
  setCurrentRoom: (roomId: RoomId) => void;
}

export const useGalleryStore = create<GalleryState>((set) => ({
  started: false,
  selectedArtwork: null,
  focusedArtwork: null,
  currentRoom: "A",
  setStarted: (started) => set({ started }),
  selectArtwork: (selectedArtwork) => set({ selectedArtwork }),
  setFocusedArtwork: (focusedArtwork) => set({ focusedArtwork }),
  setCurrentRoom: (currentRoom) => set({ currentRoom }),
}));
