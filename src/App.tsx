import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { MobileControls } from "./components/MobileControls";
import { ArtworkModal } from "./components/ArtworkModal";
import { ArtistPanel } from "./components/ArtistPanel";
import { NewIntroLayer, type IntroPhase } from "./components/NewIntroLayer";
import { useGalleryStore } from "./store";
import type { MoveInput } from "./types";

const GalleryScene = lazy(() =>
  import("./components/GalleryScene").then((module) => ({ default: module.GalleryScene })),
);

class GalleryLoadBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function useCoarsePointer() {
  const mobileQuery = "(pointer: coarse), (max-width: 760px)";
  const [coarse, setCoarse] = useState(() => window.matchMedia(mobileQuery).matches);

  useEffect(() => {
    const media = window.matchMedia(mobileQuery);
    const update = () => setCoarse(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return coarse;
}

export default function App() {
  const started = useGalleryStore((state) => state.started);
  const setStarted = useGalleryStore((state) => state.setStarted);
  const selectedArtwork = useGalleryStore((state) => state.selectedArtwork);
  const focusedArtwork = useGalleryStore((state) => state.focusedArtwork);
  const currentRoom = useGalleryStore((state) => state.currentRoom);
  const isCoarsePointer = useCoarsePointer();
  const moveInput = useRef<MoveInput>({ x: 0, y: 0 });
  const lookInput = useRef<MoveInput>({ x: 0, y: 0 });
  const artistTrigger = useRef<HTMLButtonElement>(null);
  const enterRequested = useRef(false);
  const [introPhase, setIntroPhase] = useState<IntroPhase>("playing");
  const [galleryRequested, setGalleryRequested] = useState(false);
  const [galleryReady, setGalleryReady] = useState(false);
  const [introExitComplete, setIntroExitComplete] = useState(false);
  const [artistOpen, setArtistOpen] = useState(false);
  const introVisible = introPhase !== "hidden";
  const markGalleryReady = useCallback(() => setGalleryReady(true), []);

  const handleIntroEnter = useCallback((videoCurrentTime: number) => {
    if (introPhase !== "playing" || enterRequested.current) return;
    enterRequested.current = true;

    if (import.meta.env.DEV) {
      console.debug("[NewIntroLayer] ENTER", { videoCurrentTime });
    }

    setGalleryReady(false);
    setIntroExitComplete(false);
    setGalleryRequested(true);
    setIntroPhase("transitioning");
  }, [introPhase]);

  const handleGalleryLoadError = useCallback(() => {
    enterRequested.current = false;
    setGalleryReady(false);
    setIntroExitComplete(false);
    setGalleryRequested(false);
    setIntroPhase("playing");
    setStarted(false);
  }, [setStarted]);

  const openArtistPanel = useCallback(() => {
    useGalleryStore.getState().setFocusedArtwork(null);
    document.body.style.cursor = "default";
    setArtistOpen(true);
  }, []);

  const closeArtistPanel = useCallback(() => {
    setArtistOpen(false);
    window.requestAnimationFrame(() => artistTrigger.current?.focus());
  }, []);

  useEffect(() => {
    if (introPhase !== "transitioning" || !galleryReady || !introExitComplete) return;
    setIntroPhase("hidden");
  }, [galleryReady, introExitComplete, introPhase]);

  useEffect(() => {
    setStarted(galleryReady && !introVisible);
  }, [galleryReady, introVisible, setStarted]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.code !== "Escape") return;
      if (artistOpen) {
        closeArtistPanel();
      } else if (selectedArtwork) {
        useGalleryStore.getState().selectArtwork(null);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [artistOpen, closeArtistPanel, selectedArtwork]);

  return (
    <main className="app-shell" data-gallery-ready={galleryReady}>
      {galleryRequested && (
        <GalleryLoadBoundary onError={handleGalleryLoadError}>
          <Suspense fallback={null}>
            <GalleryScene
              moveInput={moveInput}
              lookInput={lookInput}
              isCoarsePointer={isCoarsePointer}
              isRenderingPaused={introVisible}
              interactionBlocked={artistOpen}
              onReady={markGalleryReady}
            />
          </Suspense>
        </GalleryLoadBoundary>
      )}

      {introVisible && (
        <NewIntroLayer
          phase={introPhase}
          onEnter={handleIntroEnter}
          onExitComplete={() => setIntroExitComplete(true)}
        />
      )}

      {started && <div className="top-hud">
        <div>
          <p className="eyebrow">3D ONLINE EXHIBITION · ROOM {currentRoom}</p>
          <h1>ROOM {currentRoom}</h1>
        </div>
        <button
          ref={artistTrigger}
          className="artist-trigger"
          type="button"
          aria-haspopup="dialog"
          aria-expanded={artistOpen}
          onClick={openArtistPanel}
        >
          <span>작가 소개</span>
          <span>ARTIST ↗</span>
        </button>
      </div>}

      {started && !artistOpen && !selectedArtwork && <div className={`reticle ${focusedArtwork ? "is-active" : ""}`} />}
      {started && !artistOpen && focusedArtwork && !selectedArtwork && (
        <div className="view-hint">{isCoarsePointer ? "탭 · 작품 보기" : "클릭 또는 E · 작품 보기"}</div>
      )}

      {started && !artistOpen && isCoarsePointer && !selectedArtwork && (
        <MobileControls moveInput={moveInput} lookInput={lookInput} />
      )}

      {started && <ArtistPanel open={artistOpen} onClose={closeArtistPanel} />}
      <ArtworkModal />
    </main>
  );
}
