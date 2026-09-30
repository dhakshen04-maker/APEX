export type CameraSession = {
  stream: MediaStream;
  stop: () => void;
  snapshot: () => string | null;
};

export async function openCamera(video: HTMLVideoElement): Promise<CameraSession> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 640 }, height: { ideal: 360 }, facingMode: "user" },
    audio: false,
  });
  video.srcObject = stream;
  await video.play();

  const snapshot = () => {
    if (!video.videoWidth || !video.videoHeight) return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.72);
  };

  const stop = () => {
    for (const track of stream.getTracks()) track.stop();
    video.srcObject = null;
  };

  return { stream, stop, snapshot };
}
