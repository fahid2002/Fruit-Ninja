import { useCallback, useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult,
} from "@mediapipe/tasks-vision";

const WASM_BASE =
  "/mediapipe/wasm";
const MODEL_URL = "/mediapipe/models/hand_landmarker.task";

export type CameraStatus =
  | "idle"
  | "requesting"
  | "loading-model"
  | "tracking"
  | "camera-only"
  | "fallback";

export type HandPoint = {
  x: number;
  y: number;
  visible: boolean;
  confidence: number;
  time: number;
};

type UseHandTrackerOptions = {
  onPoint: (point: HandPoint) => void;
};

type UseHandTrackerResult = {
  videoRef: React.RefObject<HTMLVideoElement>;
  status: CameraStatus;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
};

function mapLandmarkToDisplay(
  video: HTMLVideoElement,
  landmark: { x: number; y: number },
) {
  const elementWidth = video.clientWidth;
  const elementHeight = video.clientHeight;
  const videoWidth = video.videoWidth || elementWidth;
  const videoHeight = video.videoHeight || elementHeight;
  const scale = Math.max(elementWidth / videoWidth, elementHeight / videoHeight);
  const displayedWidth = videoWidth * scale;
  const displayedHeight = videoHeight * scale;
  const offsetX = (elementWidth - displayedWidth) / 2;
  const offsetY = (elementHeight - displayedHeight) / 2;

  return {
    x: landmark.x * displayedWidth + offsetX,
    y: landmark.y * displayedHeight + offsetY,
  };
}

function getPrimaryFinger(result: HandLandmarkerResult) {
  const landmarks = result.landmarks[0];
  if (!landmarks) {
    return null;
  }

  return landmarks[8] ?? null;
}

export function useHandTracker({
  onPoint,
}: UseHandTrackerOptions): UseHandTrackerResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const animationRef = useRef<number | null>(null);
  const callbackRef = useRef(onPoint);
  const runningRef = useRef(false);
  const lastVideoTimeRef = useRef(-1);
  const lastPointRef = useRef<HandPoint | null>(null);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const createLandmarker = useCallback(async () => {
    const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);
    const baseOptions = {
      modelAssetPath: MODEL_URL,
    };

    try {
      return await HandLandmarker.createFromOptions(fileset, {
        baseOptions: {
          ...baseOptions,
          delegate: "GPU",
        },
        minHandDetectionConfidence: 0.48,
        minHandPresenceConfidence: 0.48,
        minTrackingConfidence: 0.48,
        numHands: 1,
        runningMode: "VIDEO",
      });
    } catch {
      return HandLandmarker.createFromOptions(fileset, {
        baseOptions: {
          ...baseOptions,
          delegate: "CPU",
        },
        minHandDetectionConfidence: 0.48,
        minHandPresenceConfidence: 0.48,
        minTrackingConfidence: 0.48,
        numHands: 1,
        runningMode: "VIDEO",
      });
    }
  }, []);

  useEffect(() => {
    callbackRef.current = onPoint;
  }, [onPoint]);

  const stopLoop = useCallback(() => {
    runningRef.current = false;
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    stopLoop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    lastPointRef.current = null;
    lastVideoTimeRef.current = -1;
    setError(null);
    setStatus("idle");
  }, [stopLoop]);

  const runDetection = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;

    if (!runningRef.current || !video || !landmarker) {
      return;
    }

    if (
      video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
      video.currentTime !== lastVideoTimeRef.current
    ) {
      lastVideoTimeRef.current = video.currentTime;
      const now = performance.now();
      const result = landmarker.detectForVideo(video, now);
      const finger = getPrimaryFinger(result);

      if (finger) {
        const mapped = mapLandmarkToDisplay(video, finger);
        const previous = lastPointRef.current;
        const elapsed = Math.max(now - (previous?.time ?? now), 1);
        const blend = previous ? (elapsed > 42 ? 0.78 : 0.62) : 1;
        const filtered = previous
          ? {
              x: previous.x + (mapped.x - previous.x) * blend,
              y: previous.y + (mapped.y - previous.y) * blend,
            }
          : mapped;
        const vx = previous ? (filtered.x - previous.x) / elapsed : 0;
        const vy = previous ? (filtered.y - previous.y) / elapsed : 0;
        const predicted = {
          x: filtered.x + vx * 22,
          y: filtered.y + vy * 22,
        };
        const point = {
          x: predicted.x,
          y: predicted.y,
          visible: true,
          confidence: 1 - Math.min(Math.max(finger.z, -0.25), 0.25),
          time: now,
        };
        lastPointRef.current = point;
        callbackRef.current(point);
      } else {
        lastPointRef.current = null;
        callbackRef.current({
          x: 0,
          y: 0,
          visible: false,
          confidence: 0,
          time: performance.now(),
        });
      }
    }

    animationRef.current = requestAnimationFrame(runDetection);
  }, []);

  const start = useCallback(async () => {
    if (runningRef.current) {
      return;
    }

    const video = videoRef.current;
    if (!video || !navigator.mediaDevices?.getUserMedia) {
      setStatus("fallback");
      setError("Camera is not available in this browser.");
      return;
    }

    try {
      setError(null);
      setStatus(streamRef.current ? "loading-model" : "requesting");
      const stream =
        streamRef.current ??
        (await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: "user",
            width: { ideal: 960 },
            height: { ideal: 540 },
            frameRate: { ideal: 60, min: 30 },
          },
        }));
      streamRef.current = stream;
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();

      if (!landmarkerRef.current) {
        setStatus("loading-model");
        try {
          landmarkerRef.current = await createLandmarker();
        } catch (modelError) {
          setStatus("camera-only");
          setError(
            modelError instanceof Error
              ? `Camera is on, but hand tracking could not load: ${modelError.message}`
              : "Camera is on, but hand tracking could not load.",
          );
          return;
        }
      }

      runningRef.current = true;
      setStatus("tracking");
      animationRef.current = requestAnimationFrame(runDetection);
    } catch (startError) {
      stopLoop();
      if (streamRef.current) {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setStatus("fallback");
      setError(
        startError instanceof Error
          ? startError.message
          : "Camera permission was not granted.",
      );
    }
  }, [createLandmarker, runDetection, stopLoop]);

  useEffect(() => stop, [stop]);

  return {
    videoRef,
    status,
    error,
    start,
    stop,
  };
}
