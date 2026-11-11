import { useRef, useEffect, useState } from "react";
import { checkFaceChange, requestFaceChange, sendFrame } from "../api/api";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from "js-cookie";

import './webCapture.css'

export default function WebcamCapture() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false)
  const user = JSON.parse(Cookies.get('details')?.toString() ?? '');

  const queryClient = useQueryClient();
  const {
    data: isvalid,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['isvalid', user.user_id],
    queryFn: () => checkFaceChange()

  });

  const requestMutation = useMutation({
    mutationFn: () => requestFaceChange(),
    onSuccess: () => {
      queryClient.invalidateQueries(['isvalid', user.user_id]);
    },
  });

  const handleRequest = () => {
    if (window.confirm(`Are you sure ?`)) {
      requestMutation.mutate();
    }
  };

  useEffect(() => {
    if (isvalid?.message !== true) return;
    async function startWebcam() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoRef.current.srcObject = stream;
    }

    startWebcam();
  }, [isvalid]);

  useEffect(() => {
    if (isvalid?.message !== true) return;
    const interval = setInterval(() => {
      if (result === null || result.error) {
        captureFrame()
      }
    }, 2000);

    return () => clearInterval(interval);




  }, [isvalid, result]);

  useEffect(() => {
    if (result?.message === 'encoding saved') {
      setSaved(true)
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
      const res = await sendFrame(base64);
      console.log(res)
      setResult(res);
    } catch (err) {
      console.error(err);
    }
  };
  if (isLoading) {
    return <div className="loading">Checking permissions...</div>;
  }

  if (isvalid?.message === false) {
    return (
      <div className="result-box" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div className="error">You do not have the permission to change your face encoding</div>
        {isvalid.message2 === false && <button
          onClick={() => {
            handleRequest()
          }}
          className="btn-primary"
        >
          <span></span>
          Request to Change Your Face
        </button>}

        {isvalid.message2 === true && <div className="success">You already have a pending request to do so, once it is approved you can change your face encoding. </div>}
      </div>
    )
  }

  return (
    <div className="webcam-container">
      {!saved && (
        <>
          <h2>Let's save your face encoding</h2>

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
