import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, Zap, Image as ImageIcon, Search, Settings } from 'lucide-react';
import { motion } from 'motion/react';

interface CameraViewProps {
  onCapture: (imageSrc: string) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        if (currentStream) {
          currentStream.getTracks().forEach(track => track.stop());
        }
        
        const constraints = {
          video: {
            facingMode: cameraFacingMode,
            width: { ideal: 1080 },
            height: { ideal: 1920 }
          },
          audio: false
        };
        
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        currentStream = mediaStream;
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
        setError('');
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Camera access denied or unavailable.");
      }
    };

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraFacingMode]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Horizontal flip if using front camera to mirror user
        if (cameraFacingMode === 'user') {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageSrc = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(imageSrc);
      }
    }
  };

  const flipCamera = () => {
    setCameraFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="relative h-full w-full bg-black overflow-hidden">
      {error ? (
        <div className="flex h-full items-center justify-center text-center p-6 bg-zinc-900 text-white">
          <div>
            <Camera className="w-12 h-12 mx-auto mb-4 text-zinc-500" />
            <p className="text-zinc-400">{error}</p>
          </div>
        </div>
      ) : (
        <motion.video 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          ref={videoRef}
          className={`absolute top-0 left-0 w-full h-full object-cover ${cameraFacingMode === 'user' ? 'scale-x-[-1]' : ''}`}
          playsInline
          autoPlay
          muted
        />
      )}
      
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Controls */}
      <div className="absolute top-12 left-6 z-10 flex flex-col gap-6">
        <button className="bg-black/20 backdrop-blur-xl p-3 rounded-full text-white border border-white/10 hover:bg-black/40 transition-colors">
            <Search className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute top-12 right-6 z-10 flex flex-col gap-4">
        <button 
            onClick={flipCamera}
            className="bg-black/20 backdrop-blur-xl p-3 rounded-full text-white border border-white/10 hover:bg-black/40 transition-colors">
          <RefreshCw className="w-6 h-6" />
        </button>
        <button className="bg-black/20 backdrop-blur-xl p-3 rounded-full text-white border border-white/10 hover:bg-black/40 transition-colors">
          <Zap className="w-6 h-6" />
        </button>
        <button className="bg-black/20 backdrop-blur-xl p-3 rounded-full text-white border border-white/10 hover:bg-black/40 transition-colors">
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {/* Camera Shutter */}
      <div className="absolute bottom-32 w-full flex justify-center items-center z-20 px-12 gap-12">
        <button className="text-white/80 hover:text-white transition-colors p-3 bg-black/20 backdrop-blur-xl rounded-full border border-white/10">
             <ImageIcon className="w-7 h-7" />
        </button>

        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={takePhoto}
          className="relative w-24 h-24 rounded-full border-[6px] border-white/80 bg-transparent flex items-center justify-center group"
        >
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm group-hover:bg-white/40 transition-colors"></div>
        </motion.button>

        <div className="w-14 h-14"></div> {/* Spacer for balance */}
      </div>
    </div>
  );
};
