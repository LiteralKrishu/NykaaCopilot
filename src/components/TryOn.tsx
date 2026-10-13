"use client";

import { useEffect, useRef, useState } from "react";
import type { FaceLandmarker, NormalizedLandmark } from "@mediapipe/tasks-vision";
import { MAKEUP_ZONES, type MakeupZone } from "@/lib/types";
import { renderTryOn, type Finish } from "@/lib/tryon-renderer";

type Props = { colors: Partial<Record<MakeupZone, string>>; onSnapshot: (url: string) => void };
const MODEL_URL = "/models/face_landmarker.task";
const WASM_URL = "/mediapipe/wasm";
const FINISHES: { value: Finish; label: string; description: string }[] = [
  { value: "natural", label: "Natural", description: "Soft everyday color" },
  { value: "glow", label: "Glow", description: "Fresh light catching finish" },
  { value: "soft-matte", label: "Soft matte", description: "Velvety color" },
];

export default function TryOn({ colors, onSnapshot }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const frameRef = useRef(0);
  const redrawRef = useRef<(() => void) | null>(null);
  const hasFaceRef = useRef(false);
  const lookRef = useRef({ colors, intensity: .65, finish: "natural" as Finish, before: false });
  const [mode, setMode] = useState<"idle" | "camera" | "photo">("idle");
  const [status, setStatus] = useState("Choose live camera or a selfie to start.");
  const [ready, setReady] = useState(false);
  const [intensity, setIntensity] = useState(.65);
  const [finish, setFinish] = useState<Finish>("natural");
  const [before, setBefore] = useState(false);
  const [enabled, setEnabled] = useState<MakeupZone[]>([...MAKEUP_ZONES]);
  const [selfie, setSelfie] = useState<string | null>(null);

  lookRef.current = {
    colors: Object.fromEntries(Object.entries(colors).filter(([zone]) => enabled.includes(zone as MakeupZone))),
    intensity,
    finish,
    before,
  };

  useEffect(() => {
    let cancelled = false;
    async function start() {
      if (mode === "idle") return;
      try {
        setReady(false);
        setStatus("Loading face tracking…");
        const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
        const vision = await FilesetResolver.forVisionTasks(WASM_URL);
        const options = {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" as const },
          runningMode: mode === "camera" ? "VIDEO" as const : "IMAGE" as const,
          numFaces: 1,
        };
        let landmarker: FaceLandmarker;
        try {
          landmarker = await FaceLandmarker.createFromOptions(vision, options);
        } catch {
          landmarker = await FaceLandmarker.createFromOptions(vision, {
            ...options, baseOptions: { modelAssetPath: MODEL_URL, delegate: "CPU" },
          });
        }
        if (cancelled) { landmarker.close(); return; }
        landmarkerRef.current = landmarker;

        if (mode === "camera") {
          setStatus("Requesting camera permission…");
          const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: "user", width: { ideal: 960 } } });
          if (cancelled) { stream.getTracks().forEach((track) => track.stop()); return; }
          streamRef.current = stream;
          const video = videoRef.current!;
          video.srcObject = stream;
          await video.play();
          if (cancelled) return;
          setStatus("Move your face into the frame.");
          let lastInference = 0;
          const draw = (timestamp: number) => {
            if (cancelled) return;
            if (timestamp - lastInference >= 65 && video.readyState >= 2) {
              lastInference = timestamp;
              const canvas = canvasRef.current!;
              const size = Math.min(1, 960 / video.videoWidth);
              const w = Math.round(video.videoWidth * size);
              const h = Math.round(video.videoHeight * size);
              if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
              const result = landmarker.detectForVideo(video, timestamp);
              const landmarks = result.faceLandmarks[0] ?? null;
              if (Boolean(landmarks) !== hasFaceRef.current) {
                hasFaceRef.current = Boolean(landmarks);
                setReady(Boolean(landmarks));
                setStatus(landmarks ? "Face tracked. Choose a finish, then hold Before to compare." : "Move your face into the frame.");
              }
              drawComposite(canvas, video, landmarks, lookRef.current);
            }
            frameRef.current = requestAnimationFrame(draw);
          };
          frameRef.current = requestAnimationFrame(draw);
        } else if (selfie) {
          const image = imageRef.current!;
          await image.decode();
          if (cancelled) return;
          const canvas = canvasRef.current!;
          const size = Math.min(1, 1280 / Math.max(image.naturalWidth, image.naturalHeight));
          canvas.width = Math.round(image.naturalWidth * size);
          canvas.height = Math.round(image.naturalHeight * size);
          const result = landmarker.detect(image);
          const landmarks = result.faceLandmarks[0] ?? null;
          redrawRef.current = () => drawComposite(canvas, image, landmarks, lookRef.current);
          redrawRef.current();
          if (landmarks) {
            setReady(true);
            setStatus("Face tracked. Choose a finish, then hold Before to compare.");
          } else {
            setStatus("No face found. Try a clear front-facing selfie.");
          }
        }
      } catch (error) {
        if (!cancelled) {
          setReady(false);
          setStatus(error instanceof Error ? error.message : "Camera or face tracking could not start.");
        }
      }
    }
    void start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frameRef.current);
      redrawRef.current = null;
      hasFaceRef.current = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
      if (mode === "photo" && selfie) URL.revokeObjectURL(selfie);
    };
  }, [mode, selfie]);

  useEffect(() => { redrawRef.current?.(); }, [colors, intensity, finish, before, enabled]);

  function stop() {
    setMode("idle");
    setSelfie(null);
    setReady(false);
    setBefore(false);
    setStatus("Choose live camera or a selfie to start.");
  }
  function uploadSelfie(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setStatus("Choose an image file."); return; }
    setReady(false);
    setSelfie(URL.createObjectURL(file));
    setMode("photo");
  }
  function snapshot() {
    const layer = canvasRef.current;
    if (!layer || !layer.width || !ready) return;
    const output = document.createElement("canvas");
    output.width = layer.width;
    output.height = layer.height;
    const ctx = output.getContext("2d")!;
    if (mode === "camera") { ctx.translate(output.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(layer, 0, 0);
    onSnapshot(output.toDataURL("image/png"));
    setStatus("Snapshot saved to your look review.");
  }

  return <div className="tryon-grid">
    <div className="tryon-preview-column">
      <div className={`camera-stage ${mode === "camera" ? "mirrored" : ""}`}>
        {mode === "camera" && <video className="source-feed" ref={videoRef} playsInline muted autoPlay />}
        {mode === "photo" && selfie && <img className="source-feed" ref={imageRef} src={selfie} alt="Your uploaded selfie" />}
        <canvas ref={canvasRef} aria-label="Your face with virtual makeup" />
        {mode === "idle" && <div className="camera-empty"><span className="camera-empty-icon">✦</span><strong>See the look on you</strong><span>Start your camera or add a front-facing selfie.</span></div>}
        {ready && <><span className="tryon-live-badge">✦ Virtual makeup</span><button className="tryon-before" type="button" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setBefore(true); }} onPointerUp={() => setBefore(false)} onPointerCancel={() => setBefore(false)} onLostPointerCapture={() => setBefore(false)} onKeyDown={(event) => { if (event.key === " " || event.key === "Enter") setBefore(true); }} onKeyUp={() => setBefore(false)} aria-label="Hold to see the original face">{before ? "Before" : "Hold for before"}</button></>}
      </div>
      <p className="status-text" role="status">{status}</p>
      <div className="button-row tryon-actions"><button type="button" onClick={() => { stop(); setMode("camera"); }}>Start camera</button><label className="buttonlike">Upload selfie<input type="file" accept="image/*" hidden onChange={(event) => { uploadSelfie(event.target.files?.[0]); event.target.value = ""; }} /></label><button type="button" onClick={snapshot} disabled={!ready}>Save snapshot</button>{mode !== "idle" && <button type="button" onClick={stop}>Stop</button>}</div>
    </div>
    <div className="tryon-controls">
      <span className="tryon-kicker">YOUR BEAUTY STUDIO</span>
      <h3>Make the look yours</h3>
      <p>Color follows your features and blends with the light and texture in your photo.</p>
      <div className="tryon-control-section"><strong>Finish</strong><div className="tryon-finish-list">{FINISHES.map((option) => <button key={option.value} className={finish === option.value ? "active" : ""} type="button" onClick={() => setFinish(option.value)} aria-pressed={finish === option.value}><span>{option.label}</span><small>{option.description}</small></button>)}</div></div>
      <div className="tryon-control-section"><label className="range-label" htmlFor="tryon-intensity"><span>Makeup strength</span><strong>{Math.round(intensity * 100)}%</strong></label><input id="tryon-intensity" className="tryon-range" type="range" min="0" max="1" step="0.05" value={intensity} onChange={(event) => setIntensity(Number(event.target.value))} /></div>
      <div className="tryon-control-section"><strong>Makeup areas</strong><div className="zone-toggle-grid">{MAKEUP_ZONES.map((zone) => <label key={zone} className={`zone-toggle ${enabled.includes(zone) ? "active" : ""}`}><input type="checkbox" checked={enabled.includes(zone)} onChange={(event) => setEnabled((current) => event.target.checked ? [...current, zone] : current.filter((item) => item !== zone))} /><span className="swatch" style={{ background: colors[zone] ?? "#ddd" }} />{zone}</label>)}</div></div>
      <p className="muted tryon-note">Virtual color is a preview. Camera lighting and screen settings can change how a product looks in person.</p>
    </div>
  </div>;
}

function drawComposite(canvas: HTMLCanvasElement, source: CanvasImageSource, landmarks: NormalizedLandmark[] | null, look: { colors: Partial<Record<MakeupZone, string>>; intensity: number; finish: Finish; before: boolean }) {
  const ctx = canvas.getContext("2d")!;
  renderTryOn(ctx, source, landmarks, look.colors, look.intensity, look.finish, look.before, canvas.width, canvas.height);
}
