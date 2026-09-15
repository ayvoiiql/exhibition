import { useEffect } from "react";
import { useGalleryStore } from "../store";

export function ArtworkModal() {
  const artwork = useGalleryStore((state) => state.selectedArtwork);
  const selectArtwork = useGalleryStore((state) => state.selectArtwork);

  useEffect(() => {
    if (artwork && document.pointerLockElement) document.exitPointerLock();
  }, [artwork]);

  if (!artwork) return null;

  return (
    <div className="modal-backdrop" role="presentation" onPointerDown={() => selectArtwork(null)}>
      <section
        className="artwork-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="artwork-title"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" aria-label="작품 정보 닫기" onClick={() => selectArtwork(null)}>
          ×
        </button>
        <img src={artwork.image} alt={artwork.title} />
        <div className="modal-copy">
          <p className="eyebrow">ROOM {artwork.roomId}</p>
          <h2 id="artwork-title">{artwork.title}</h2>
          <p>{artwork.description}</p>
        </div>
      </section>
    </div>
  );
}
