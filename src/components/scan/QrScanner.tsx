import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Camera, RefreshCw, AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import { QrService, QrParseResult } from '../../services/qrService';
import { useLanguage } from '../../context/LanguageContext';

interface QrScannerProps {
  onCnrFound: (cnr: string) => void;
}

export const QrScanner: React.FC<QrScannerProps> = ({ onCnrFound }) => {
  const { t } = useLanguage();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<QrParseResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        setIsCameraActive(true);
        scanFrame();
      }
    } catch (err: any) {
      console.warn('Camera access error or restricted in this environment:', err);
      setErrorMsg('Camera permission not granted or device camera unavailable. You can upload a QR image or select sample QR below.');
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result = QrService.decodeFromImageData(imgData);
        if (result && result.extractedCnr) {
          setScannedResult(result);
          stopCamera();
          onCnrFound(result.extractedCnr);
          return;
        }
      }
    }
    animationFrameRef.current = requestAnimationFrame(scanFrame);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();
    reader.onload = (event) => {
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, img.width, img.height);
          const res = QrService.decodeFromImageData(imgData);
          if (res && res.extractedCnr) {
            setScannedResult(res);
            onCnrFound(res.extractedCnr);
          } else {
            setErrorMsg('No valid eCourts QR code found in the uploaded image.');
          }
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const loadSampleQr = (cnr: string) => {
    const res = QrService.parseCourtQrContent(`https://services.ecourts.gov.in/ecourtindia_v6/?cnr=${cnr}`);
    setScannedResult(res);
    if (res.extractedCnr) {
      onCnrFound(res.extractedCnr);
    }
  };

  return (
    <div className="card-elevated" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: '#e0f2fe',
          color: '#0369a1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <QrCode size={22} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {t.scanQr}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Instant scan of eCourts QR codes printed on court summons or certified orders
          </p>
        </div>
      </div>

      {/* Video Viewport */}
      <div style={{
        background: '#0f172a',
        borderRadius: 'var(--radius-md)',
        minHeight: '220px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {isCameraActive ? (
          <>
            <video ref={videoRef} style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
            {/* Target Reticle */}
            <div style={{
              position: 'absolute',
              width: '180px',
              height: '180px',
              border: '3px solid #f59e0b',
              borderRadius: '16px',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
            }} />
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
            <QrCode size={48} color="#f59e0b" style={{ margin: '0 auto 10px auto' }} />
            <div style={{ fontWeight: 700, color: '#ffffff' }}>Point camera at the Notice QR Code</div>
            <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Found on top-right of official summons</div>
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* Scanner Controls */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {!isCameraActive ? (
          <button
            onClick={startCamera}
            style={{
              flex: 1,
              background: '#0284c7',
              color: '#ffffff',
              padding: '0 16px',
              fontWeight: 700
            }}
          >
            <Camera size={18} />
            <span>Open QR Camera</span>
          </button>
        ) : (
          <button
            onClick={stopCamera}
            style={{
              flex: 1,
              background: '#ef4444',
              color: '#ffffff',
              padding: '0 16px',
              fontWeight: 700
            }}
          >
            Stop Camera
          </button>
        )}

        <label style={{
          flex: 1,
          background: '#f1f5f9',
          color: '#334155',
          border: '1px solid #cbd5e1',
          borderRadius: 'var(--radius-md)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          minHeight: '48px',
          padding: '0 16px',
          cursor: 'pointer',
          fontWeight: 700
        }}>
          <Upload size={18} />
          <span>Upload QR Image</span>
          <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
        </label>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div style={{
          background: '#fff1f2',
          border: '1px solid #fecdd3',
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '0.85rem',
          color: '#9f1239'
        }}>
          {errorMsg}
        </div>
      )}

      {/* Sample QR presets for instant testing */}
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '8px' }}>
          ⚡ QUICK DEMO QR CODE SIMULATION:
        </span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => loadSampleQr('DLHC01-008472-2024')}
            style={{ background: '#f1f5f9', color: '#334155', padding: '6px 12px', fontSize: '0.8rem', minHeight: '34px' }}
          >
            📲 Simulate Delhi HC Summons QR
          </button>
          <button
            onClick={() => loadSampleQr('TNCH02-014589-2024')}
            style={{ background: '#f1f5f9', color: '#334155', padding: '6px 12px', fontSize: '0.8rem', minHeight: '34px' }}
          >
            📲 Simulate Madras HC Stay QR
          </button>
        </div>
      </div>
    </div>
  );
};
