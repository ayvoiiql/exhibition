import { Component, lazy, Suspense, type ReactNode } from "react";
import { exhibition } from "../content/exhibition";
import "./IntroScreen.css";

const IntroScene = lazy(() => import("./IntroScene").then((module) => ({ default: module.IntroScene })));

class SceneFallback extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

export function IntroScreen({ onEnter, loading }: { onEnter: () => void; loading: boolean }) {
  return (
    <section className="intro-screen" aria-labelledby="exhibition-title" aria-busy={loading}>
      <header className="intro-header">
        <a className="intro-brand" href="#exhibition-title" aria-label="온라인 가상 전시">
          <span className="intro-monogram" aria-hidden="true">m.</span>
          <span>THE ONLINE<br />GALLERY</span>
        </a>
        <span className="intro-header-note">예술을 만나는 또 하나의 공간</span>
        <span className="intro-edition">DIGITAL EXHIBITION <span>— 01</span></span>
      </header>

      <div className="intro-content">
        <div className="intro-copy">
          <p className="intro-kicker"><span />{exhibition.subtitle}</p>
          <h1 id="exhibition-title">{exhibition.title[0]}<br /><span>{exhibition.title[1]}</span><i aria-hidden="true">.</i></h1>
          <p className="intro-description">{exhibition.introduction}</p>
          <div className="intro-artist">
            <p className="intro-section-label">THE ARTIST <span>작가 소개</span></p>
            <h2>{exhibition.artistHeading}</h2>
            <p>{exhibition.artistIntroduction}</p>
          </div>
          <button className="intro-enter" onClick={onEnter} disabled={loading}>
            <span>{loading ? "전시장을 준비하고 있습니다" : "전시장 입장하기"}<small>{loading ? "PREPARING YOUR VISIT" : "ENTER THE EXHIBITION"}</small></span>
            <span className={loading ? "intro-spinner" : "intro-arrow"} aria-hidden="true">{loading ? "" : "↗"}</span>
          </button>
          <p className="intro-invitation" role="status">{loading ? "작품을 불러온 뒤 전시장으로 안내합니다." : "당신의 속도로, 천천히 감상하세요."}</p>
          <details className="intro-help">
            <summary>관람 방법</summary>
            <p>컴퓨터: W/S 또는 ↑/↓로 이동 · A/D 또는 ←/→로 회전 · 좌우 드래그로 시점 조절 · 작품 클릭 또는 E로 상세 보기</p>
            <p>모바일: 왼쪽 조이스틱으로 이동 · 오른쪽 좌우 드래그로 회전 · 작품을 탭해 상세 보기</p>
          </details>
        </div>

        <div className="intro-architecture" role="img" aria-label="샴페인 골드 프레임과 네이비 양개문으로 꾸민 갤러리 입구">
          <div className="intro-door-fallback"><span /><span /></div>
          <SceneFallback><Suspense fallback={null}><IntroScene /></Suspense></SceneFallback>
          <div className="intro-architecture-shade" />
          <span className="intro-door-caption">BEYOND THE FRAME</span>
          <div className="intro-architecture-foot"><span>문 너머, 새로운 시선</span><span>01 — 03</span></div>
        </div>
      </div>

      <footer className="intro-footer">
        <span>24 WORKS <i /> 3 ROOMS <i /> ONE JOURNEY</span>
        <span className="intro-room-index">A <b>—</b> B <b>—</b> C</span>
        <span>온라인 가상 전시 <span aria-hidden="true">↗</span></span>
      </footer>
    </section>
  );
}
