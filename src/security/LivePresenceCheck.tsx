import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  studentName: string;
  onApprove: () => void;
  onCancel: () => void;
};

const challenges = ["Look at the camera and slowly turn your head left, then right.", "Look at the camera, raise one hand, then lower it.", "Look at the camera and nod once, then look straight ahead."];

export function LivePresenceCheck({ studentName, onApprove, onCancel }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState("Starting camera…");
  const [ready, setReady] = useState(false);
  const challenge = useMemo(() => challenges[Math.floor(Math.random() * challenges.length)], []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let disposed = false;
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
        if (!video.current || disposed) return;
        video.current.srcObject = stream;
        await video.current.play();
        setReady(true);
        setStatus("Camera ready. The teacher should visually confirm the student and the live challenge.");
      } catch {
        setStatus("Camera permission was denied or unavailable. The teacher must use the manual verification option.");
      }
    };
    void start();
    return () => {
      disposed = true;
      stream?.getTracks().forEach(track => track.stop());
      if (video.current) video.current.srcObject = null;
    };
  }, []);

  return <div className="modal-backdrop"><div className="confirm-modal qr-scanner-modal">
    <p className="eyebrow">APEX · LIVE PRESENCE</p>
    <h2>Verify {studentName}</h2>
    <p>This check is deliberately person-focused: the teacher confirms the student is physically in front of the camera. A phone left inside the classroom is not enough.</p>
    <div className="scanner-frame"><video ref={video} autoPlay muted playsInline /></div>
    <div className="send-safety"><strong>Live challenge</strong><span>{challenge}</span></div>
    <div className="scanner-status">{status}</div>
    <div className="modal-actions">
      <button className="button button-secondary" type="button" onClick={onCancel}>Reject / cancel</button>
      <button className="button button-primary" type="button" disabled={!ready} onClick={onApprove}>Teacher confirms presence</button>
    </div>
    <small>No face image or biometric template is stored by this check.</small>
  </div></div>;
}
