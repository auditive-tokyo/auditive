/// <reference types="vite/client" />

import React, { useEffect, useRef } from 'react';
import './BackgroundVideo.css';

const BackgroundVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.play().catch((error) => {
        console.error("ビデオの再生に失敗しました:", error);
      });
    }
  }, []);

  return (
    <div className="video-background">
      <video ref={videoRef} autoPlay loop muted playsInline>
      <source src={import.meta.env.BASE_URL + "videos/bg_noise.mp4"} type="video/mp4" />
        お使いのブラウザはビデオタグをサポートしていません。
      </video>
    </div>
  );
};

export default BackgroundVideo;