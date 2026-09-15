import { useRef, useState } from "react";
import type { MoveInput } from "../types";
import { useGalleryStore } from "../store";

interface MobileControlsProps {
  moveInput: React.RefObject<MoveInput>;
  lookInput: React.RefObject<MoveInput>;
}

export function MobileControls({ moveInput, lookInput }: MobileControlsProps) {
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const joystickPointer = useRef<number | null>(null);
  const lookPointer = useRef<number | null>(null);
  const joystickOrigin = useRef({ x: 0, y: 0 });
  const lastLook = useRef({ x: 0, y: 0 });
  const lookStart = useRef({ x: 0, y: 0, time: 0 });

  const updateJoystick = (clientX: number, clientY: number) => {
    const max = 42;
    const dx = clientX - joystickOrigin.current.x;
    const dy = clientY - joystickOrigin.current.y;
    const length = Math.hypot(dx, dy) || 1;
    const scale = Math.min(1, max / length);
    const x = dx * scale;
    const y = dy * scale;
    setKnob({ x, y });
    moveInput.current.x = x / max;
    moveInput.current.y = -y / max;
  };

  return (
    <div className="mobile-controls" aria-label="모바일 관람 조작">
      <div
        className="joystick-zone"
        onPointerDown={(event) => {
          joystickPointer.current = event.pointerId;
          joystickOrigin.current = { x: event.clientX, y: event.clientY };
          event.currentTarget.setPointerCapture(event.pointerId);
          updateJoystick(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          if (joystickPointer.current === event.pointerId) updateJoystick(event.clientX, event.clientY);
        }}
        onPointerUp={(event) => {
          if (joystickPointer.current !== event.pointerId) return;
          joystickPointer.current = null;
          moveInput.current.x = 0;
          moveInput.current.y = 0;
          setKnob({ x: 0, y: 0 });
        }}
        onPointerCancel={() => {
          joystickPointer.current = null;
          moveInput.current.x = 0;
          moveInput.current.y = 0;
          setKnob({ x: 0, y: 0 });
        }}
      >
        <div className="joystick-base">
          <div className="joystick-knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
        </div>
      </div>

      <div
        className="look-zone"
        onPointerDown={(event) => {
          lookPointer.current = event.pointerId;
          lastLook.current = { x: event.clientX, y: event.clientY };
          lookStart.current = { x: event.clientX, y: event.clientY, time: performance.now() };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (lookPointer.current !== event.pointerId) return;
          lookInput.current.x += event.clientX - lastLook.current.x;
          lastLook.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerUp={(event) => {
          if (lookPointer.current !== event.pointerId) return;
          const distance = Math.hypot(
            event.clientX - lookStart.current.x,
            event.clientY - lookStart.current.y,
          );
          if (distance < 8 && performance.now() - lookStart.current.time < 350) {
            const state = useGalleryStore.getState();
            if (state.focusedArtwork) state.selectArtwork(state.focusedArtwork);
          }
          lookPointer.current = null;
        }}
        onPointerCancel={() => {
          lookPointer.current = null;
        }}
      />
    </div>
  );
}
