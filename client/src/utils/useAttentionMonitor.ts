import { useEffect, useRef, useState } from "react";

type MonitorState = {
  isReady: boolean;
  isRunning: boolean;
  lookAwayCount: number;
  faceVisibleRatio: number;
  lastWarning: string;
};

type FaceLandmarkerResult = {
  faceLandmarks?: Array<Array<{ x: number; y: number; z: number }>>;
};

export function useAttentionMonitor(active: boolean) {
  const [state, setState] = useState<MonitorState>({
    isReady: false,
    isRunning: false,
    lookAwayCount: 0,
    faceVisibleRatio: 1,
    lastWarning: "",
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const checksRef = useRef({ total: 0, visible: 0, lookAway: 0 });

  useEffect(() => {
    if (!active) {
      stopMonitor();
      return;
    }

    let cancelled = false;

    async function startMonitor() {
      try {
        const visionModule = (await new Function(
          "return import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/+esm')",
        )()) as {
          FaceLandmarker: {
            createFromOptions: (...args: unknown[]) => Promise<{
              detectForVideo: (video: HTMLVideoElement, time: number) => FaceLandmarkerResult;
            }>;
          };
          FilesetResolver: {
            forVisionTasks: (url: string) => Promise<unknown>;
          };
        };
        const { FaceLandmarker, FilesetResolver } = visionModule;

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
        );

        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          },
          runningMode: "VIDEO",
          numFaces: 1,
        });

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        const video = document.createElement("video");
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;
        video.srcObject = stream;
        await video.play();
        videoRef.current = video;

        setState((current) => ({ ...current, isReady: true, isRunning: true }));

        const tick = () => {
          if (!videoRef.current) {
            return;
          }

          const result = faceLandmarker.detectForVideo(videoRef.current, performance.now()) as FaceLandmarkerResult;
          checksRef.current.total += 1;

          if (result.faceLandmarks?.length) {
            checksRef.current.visible += 1;

            const landmarks = result.faceLandmarks[0];
            const leftEye = landmarks[33];
            const rightEye = landmarks[263];
            const nose = landmarks[1];
            const midpointX = (leftEye.x + rightEye.x) / 2;
            const offset = Math.abs(nose.x - midpointX);

            if (offset > 0.06) {
              checksRef.current.lookAway += 1;
              setState((current) => ({
                ...current,
                lastWarning: "Head rotation suggests the player is looking away.",
              }));
            }
          } else {
            checksRef.current.lookAway += 1;
            setState((current) => ({
              ...current,
              lastWarning: "Face not detected in frame.",
            }));
          }

          setState((current) => ({
            ...current,
            lookAwayCount: checksRef.current.lookAway,
            faceVisibleRatio:
              checksRef.current.total > 0
                ? checksRef.current.visible / checksRef.current.total
                : current.faceVisibleRatio,
          }));

          animationFrameRef.current = window.requestAnimationFrame(tick);
        };

        animationFrameRef.current = window.requestAnimationFrame(tick);
      } catch {
        setState((current) => ({
          ...current,
          isReady: false,
          isRunning: false,
          lastWarning: "MediaPipe camera attention monitor could not start.",
        }));
      }
    }

    void startMonitor();

    return () => {
      cancelled = true;
      stopMonitor();
    };
  }, [active]);

  function stopMonitor() {
    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    videoRef.current = null;
  }

  return state;
}


