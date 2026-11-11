import { useRef, useEffect, useState } from "react";
import { sendFrame, verifyFace } from "../api/api";
import './webCapture.css'

export default function VerifyFace({session_id, onClose}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function startWebcam() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = stream;
    }

    startWebcam();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (result === null || result.error) {
        captureFrame()
      }
    }, 2000);

    return () => clearInterval(interval);




  }, []);

  useEffect(() => {
    if (result?.message === 'verified') {
      setSaved(true)
      alert('You are verified')
      onClose()
    }
  }, [result])

  useEffect(() => {
    console.log(result, canvasRef, videoRef)
  }, [result, canvasRef, videoRef]);

  const captureFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64 = canvas.toDataURL("image/jpeg");

    try {
      const res = await verifyFace(base64, session_id);
      console.log(res)
      setResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  return (
  <div className="webcam-container">
    {!saved && (
      <>
        <h2>Let's verify your face</h2>

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </>
    )}

    {result && (
      <div className="result-box">
        {result.error && <div className="error">{result.error}</div>}
        {saved && <div className="success">Your face was saved in our database</div>}
      </div>
    )}
  </div>
);

}
