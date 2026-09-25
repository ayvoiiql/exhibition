import { useEffect, useRef } from "react";

interface ArtistPanelProps {
  open: boolean;
  onClose: () => void;
}

const EXHIBITION_PLACEHOLDERS = Array.from({ length: 12 }, (_, index) => ({
  year: "20XX",
  title: `전시명 Placeholder ${String(index + 1).padStart(2, "0")}`,
  venue: "전시장 / 도시 Placeholder",
}));

export function ArtistPanel({ open, onClose }: ArtistPanelProps) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    panel.current?.scrollTo({ top: 0 });
    closeButton.current?.focus();
  }, [open]);

  return (
    <div
      className={`artist-overlay ${open ? "is-open" : ""}`}
      aria-hidden={!open}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        ref={panel}
        className="artist-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="artist-panel-title"
      >
        <header className="artist-panel-header">
          <p className="artist-kicker">ARTIST</p>
          <button
            ref={closeButton}
            className="artist-close"
            type="button"
            aria-label="작가 소개 닫기"
            tabIndex={open ? 0 : -1}
            onClick={onClose}
          >
            <span>CLOSE</span>
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="artist-identity">
          <h2 id="artist-panel-title">김순이</h2>
          <p>KIM SOONYEE</p>
        </div>

        <section className="artist-section" aria-labelledby="artist-about-heading">
          <div className="artist-section-heading">
            <span>01</span>
            <h3 id="artist-about-heading">
              작가 소개
              <small>ABOUT THE ARTIST</small>
            </h3>
          </div>
          <div className="artist-about-copy">
            <p>
              작가 소개문 Placeholder입니다. 작품 세계와 주요한 조형적 관심을 설명하는
              문장이 이곳에 들어갑니다. 실제 원고가 확정되면 이 문단을 교체합니다.
            </p>
            <p>
              작가 소개문 Placeholder입니다. 작업의 재료와 제작 과정, 전시를 관통하는
              주제를 소개하는 두 번째 문단을 위한 영역입니다.
            </p>
            <p>
              작가 소개문 Placeholder입니다. 현재 전시와 작가의 최근 작업을 연결하는
              짧은 맺음말이 이곳에 들어갑니다.
            </p>
          </div>
        </section>

        <section className="artist-section artist-exhibitions" aria-labelledby="artist-exhibitions-heading">
          <div className="artist-section-heading">
            <span>02</span>
            <h3 id="artist-exhibitions-heading">
              주요 전시
              <small>SELECTED EXHIBITIONS</small>
            </h3>
          </div>
          <div className="artist-exhibition-grid">
            {EXHIBITION_PLACEHOLDERS.map((exhibition, index) => (
              <article className="artist-exhibition-item" key={index}>
                <time>{exhibition.year}</time>
                <div>
                  <h4>{exhibition.title}</h4>
                  <p>{exhibition.venue}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
