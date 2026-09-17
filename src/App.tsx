import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { MobileControls } from "./components/MobileControls";
import { ArtworkModal } from "./components/ArtworkModal";
import { useGalleryStore } from "./store";
import type { MoveInput } from "./types";

const GalleryScene = lazy(() =>
  import("./components/GalleryScene").then((module) => ({ default: module.GalleryScene })),
);

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

  const enterGallery = () => {
    setStarted(true);
  };

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.code === "Escape" && selectedArtwork) {
        useGalleryStore.getState().selectArtwork(null);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedArtwork]);

  return (
    <main className="app-shell">
      <Suspense fallback={<div className="scene-loading">전시장을 준비하고 있습니다…</div>}>
        <GalleryScene
          moveInput={moveInput}
          lookInput={lookInput}
          isCoarsePointer={isCoarsePointer}
        />
      </Suspense>

      <div className="top-hud">
        <div>
          <p className="eyebrow">3D ONLINE EXHIBITION · ROOM {currentRoom}</p>
          <h1>ROOM {currentRoom}</h1>
        </div>
        <span className="stage-badge">ROOM {currentRoom} · 8 WORKS</span>
      </div>

      {started && !selectedArtwork && <div className={`reticle ${focusedArtwork ? "is-active" : ""}`} />}
      {started && focusedArtwork && !selectedArtwork && (
        <div className="view-hint">{isCoarsePointer ? "탭 · 작품 보기" : "클릭 또는 E · 작품 보기"}</div>
      )}

      {!started && (
        <section className="entry-panel">
          <p className="eyebrow">딥 네이비 갤러리</p>
          <h2>온라인 가상 전시</h2>
          <p className="entry-description">
            서로 연결된 ROOM A, ROOM B와 ROOM C에서 스물네 점의 작품을 감상해 보세요.
          </p>
          <div className="control-summary">
            <span>{isCoarsePointer ? "왼쪽 조이스틱 · 이동" : "W/S·↑/↓ · 전진/후진"}</span>
            <span>{isCoarsePointer ? "오른쪽 좌우 드래그 · 시점" : "A/D·←/→ · 좌우 회전"}</span>
            {!isCoarsePointer && <span>좌우 드래그 · 시점 회전</span>}
            <span>{isCoarsePointer ? "작품 탭 · 상세 보기" : "클릭/E · 상세 보기"}</span>
          </div>
          <button type="button" className="enter-button" onClick={enterGallery}>
            전시 입장
          </button>
        </section>
      )}

      {started && isCoarsePointer && !selectedArtwork && (
        <MobileControls moveInput={moveInput} lookInput={lookInput} />
      )}

      <ArtworkModal />
    </main>
  );
}
