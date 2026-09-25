import { useEffect, useRef, type TransitionEvent } from "react";
import "./NewIntroLayer.css";

const INTRO_VIDEO_SRC = "/videos/paper-airplane-intro-web.mp4";
const MOBILE_CROP_QUERY = "(pointer: coarse), (max-width: 760px)";
const CROP_UPDATE_INTERVAL_MS = 120;
const LONG_GAP_THRESHOLD_SECONDS = 0.36;
const CROP_SMOOTHING = 0.58;
const INTRO_EDITORIAL_COPY = [
  "기억은 풍경 속에 머물고,",
  "산은 오래된 시간을 품는다.",
];

interface CropKeyframe {
  time: number;
  x: number;
}

export type IntroPhase = "playing" | "transitioning" | "hidden";

interface NewIntroLayerProps {
  phase: IntroPhase;
  onEnter: (videoCurrentTime: number) => void;
  onExitComplete: () => void;
}

const MOBILE_CROP_KEYFRAMES: CropKeyframe[] = [
  { time: 0, x: 45 },
  { time: 0.55, x: 50 },
  { time: 1.25, x: 78 },
  { time: 2.05, x: 90 },
  { time: 2.55, x: 90 },
  { time: 2.85, x: 78 },
  { time: 3.12, x: 45 },
  { time: 4.907, x: 45 },
];

function getMobileCropPosition(currentTime: number) {
  for (let index = 1; index < MOBILE_CROP_KEYFRAMES.length; index += 1) {
    const previous = MOBILE_CROP_KEYFRAMES[index - 1];
    const next = MOBILE_CROP_KEYFRAMES[index];
    if (currentTime > next.time) continue;

    const progress = (currentTime - previous.time) / (next.time - previous.time);
    return previous.x + (next.x - previous.x) * progress;
  }

  return MOBILE_CROP_KEYFRAMES[MOBILE_CROP_KEYFRAMES.length - 1].x;
}

export function NewIntroLayer({ phase, onEnter, onExitComplete }: NewIntroLayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleEnter = () => {
    const currentTime = videoRef.current?.currentTime ?? 0;
    onEnter(currentTime);
  };

  const handleVideoTransitionEnd = (event: TransitionEvent<HTMLVideoElement>) => {
    if (phase === "transitioning" && event.propertyName === "opacity") {
      onExitComplete();
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const mobileQuery = window.matchMedia(MOBILE_CROP_QUERY);
    let cropPosition = 50;
    let previousTime = video.currentTime;
    let updateTimer: number | null = null;

    const updateCrop = () => {
      const currentTime = video.currentTime;
      if (!Number.isFinite(currentTime) || currentTime < 0) return;

      const targetPosition = getMobileCropPosition(currentTime);
      const deltaTime = currentTime - previousTime;
      const videoLooped = currentTime < previousTime;
      const hasLongGap = Number.isFinite(deltaTime) && deltaTime > LONG_GAP_THRESHOLD_SECONDS;

      if (videoLooped || hasLongGap) {
        cropPosition = targetPosition;
      } else {
        cropPosition += (targetPosition - cropPosition) * CROP_SMOOTHING;
      }

      if (Math.abs(targetPosition - cropPosition) < 0.05) cropPosition = targetPosition;
      video.style.setProperty("--intro-object-position-x", `${cropPosition.toFixed(2)}%`);
      previousTime = currentTime;
    };

    const syncCrop = () => {
      const currentTime = video.currentTime;
      if (!mobileQuery.matches || !Number.isFinite(currentTime) || currentTime < 0) return;

      cropPosition = getMobileCropPosition(currentTime);
      previousTime = currentTime;
      video.style.setProperty("--intro-object-position-x", `${cropPosition.toFixed(2)}%`);
    };

    const updateMode = () => {
      if (!mobileQuery.matches) {
        if (updateTimer !== null) window.clearInterval(updateTimer);
        updateTimer = null;
        cropPosition = 50;
        video.style.removeProperty("--intro-object-position-x");
        return;
      }

      syncCrop();
      if (updateTimer === null) {
        updateTimer = window.setInterval(updateCrop, CROP_UPDATE_INTERVAL_MS);
      }
    };

    mobileQuery.addEventListener("change", updateMode);
    updateMode();

    return () => {
      mobileQuery.removeEventListener("change", updateMode);
      if (updateTimer !== null) window.clearInterval(updateTimer);
    };
  }, []);

  return (
    <div className="new-intro-layer" data-phase={phase}>
      <video
        ref={videoRef}
        className="new-intro-video"
        src={INTRO_VIDEO_SRC}
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
        aria-hidden="true"
        onTransitionEnd={handleVideoTransitionEnd}
      />
      <div className="new-intro-poster" aria-hidden={phase === "transitioning"}>
        <div className="new-intro-title-lockup">
          <h1 className="new-intro-title" aria-label="산의 기억">
            <span>산의</span>
            <span>기억</span>
          </h1>
          <span className="new-intro-title-rule" aria-hidden="true" />
          <p className="new-intro-title-en" aria-label="MEMORY OF MOUNTAINS">
            <span>MEMORY</span>
            <span>OF</span>
            <span>MOUNTAINS</span>
          </p>
        </div>

        <aside className="new-intro-editorial" aria-label="전시 소개">
          <span className="new-intro-editorial-rule" aria-hidden="true" />
          <p>
            {INTRO_EDITORIAL_COPY.map((line) => <span key={line}>{line}</span>)}
          </p>
        </aside>

        <div className="new-intro-artist">
          <p>김순이 온라인 개인전</p>
          <p>KIM SOONYEE ONLINE EXHIBITION</p>
        </div>

        <button
          className="new-intro-enter"
          type="button"
          onClick={handleEnter}
          disabled={phase !== "playing"}
        >
          <span>ENTER</span>
          <span aria-hidden="true">↗</span>
        </button>
      </div>

      {phase === "transitioning" && (
        <div className="new-intro-loading" role="status" aria-live="polite">
          <p>전시를 준비하는 중</p>
          <p>PREPARING THE EXHIBITION</p>
          <span className="new-intro-loading-line" aria-hidden="true">
            <span />
          </span>
        </div>
      )}
    </div>
  );
}
