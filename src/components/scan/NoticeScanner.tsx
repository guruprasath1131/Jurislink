import React, { useState, useRef } from 'react';
import { Camera, Upload, RefreshCw, FileText, CheckCircle2, Image as ImageIcon, Sliders } from 'lucide-react';
import { OcrService } from '../../services/ocrService';
import { ExtractedNoticeData } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { ConfirmationModal } from './ConfirmationModal';

interface NoticeScannerProps {
  onCaseExtracted: (data: ExtractedNoticeData) => void;
}

export const NoticeScanner: React.FC<NoticeScannerProps> = ({ onCaseExtracted }) => {
  const { t } = useLanguage();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processedPreview, setProcessedPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [extractedData, setExtractedData] = useState<ExtractedNoticeData | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image MIME
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);
      processNoticeImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const processNoticeImage = async (dataUrl: string) => {
    setIsProcessing(true);
    setProgressStatus('Pre-processing image for high clarity...');

    try {
      // Create image element for canvas pre-processing
      const img = new Image();
      img.src = dataUrl;
      await new Promise(r => { img.onload = r; });

      // Apply contrast enhancement & thresholding
      const enhancedDataUrl = await OcrService.preprocessImage(img);
      setProcessedPreview(enhancedDataUrl);

      // Perform OCR
      const result = await OcrService.extractFromImage(enhancedDataUrl, (progress, status) => {
        setProgressStatus(status);
      });

      setExtractedData(result);
      setShowConfirmModal(true);
    } catch (err) {
      console.error('Notice OCR failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmed = (confirmed: ExtractedNoticeData) => {
    setShowConfirmModal(false);
    onCaseExtracted(confirmed);
  };

  const [customNoticeText, setCustomNoticeText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  // Sample Notice template buttons for instant testing with Groq AI
  const loadSampleNotice = async (scenarioType: 'delhi' | 'bombay' | 'blurry') => {
    let mockNotice = '';
    if (scenarioType === 'delhi') {
      mockNotice = `HIGH COURT OF DELHI AT NEW DELHI
CNR: DLHC01-008472-2024
CASE NO: WP(C) 1402/2024
RAMESHWAR DAYAL VS DELHI DEVELOPMENT AUTHORITY
NEXT HEARING: 08-09-2026
COURT ROOM: 14`;
    } else if (scenarioType === 'bombay') {
      mockNotice = `HIGH COURT OF JUDICATURE AT BOMBAY
CNR: MCHC01-003921-2023
CASE NO: CA 512/2023
SUNITA TUKARAM SHINDE VS MCGM
NEXT HEARING: 24-09-2026
COURT ROOM: 07`;
    } else {
      mockNotice = `CITY CIVIL COURT CALCUTTA
WBCC01-007812-2024
CS 440/2024
BENGAL AGRO VS DEBABRATA GHOSH`;
    }

    setIsProcessing(true);
    setProgressStatus('Extracting parameters using Groq AI (qwen/qwen3.8-27b)...');

    try {
      const parsed = await OcrService.extractFromText(mockNotice);
      setExtractedData(parsed);
      setShowConfirmModal(true);
    } catch {
      const parsed = OcrService.parseExtractedText(mockNotice, scenarioType === 'blurry' ? 62 : 95);
      setExtractedData(parsed);
      setShowConfirmModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCustomTextExtract = async () => {
    if (!customNoticeText.trim()) return;
    setIsProcessing(true);
    setProgressStatus('Analyzing custom notice with Groq AI...');

    try {
      const parsed = await OcrService.extractFromText(customNoticeText.trim());
      setExtractedData(parsed);
      setShowConfirmModal(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card-elevated">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: '#fef3c7',
            color: '#d97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Camera size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {t.navScanNotice}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Photograph or upload any court summons, cause-list paper, or judicial notice
            </p>
          </div>
        </div>

        {/* Upload & Camera Buttons */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '16px' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: '#0f172a',
              color: '#ffffff',
              padding: '16px',
              flexDirection: 'column',
              minHeight: '90px',
              gap: '6px'
            }}
          >
            <Camera size={28} color="#f59e0b" />
            <span style={{ fontWeight: 800 }}>{t.takePhoto}</span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Camera Capture</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: '#ffffff',
              border: '2px solid var(--border-color)',
              color: '#0f172a',
              padding: '16px',
              flexDirection: 'column',
              minHeight: '90px',
              gap: '6px'
            }}
          >
            <Upload size={28} color="#0284c7" />
            <span style={{ fontWeight: 800 }}>{t.uploadNotice}</span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Gallery / File Upload</span>
          </button>
        </div>

        {/* Sample Demo Notices for quick evaluation */}
        <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '8px' }}>
            ⚡ TEST WITH SAMPLE COURT NOTICE PHOTO PRESETS:
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => loadSampleNotice('delhi')}
              style={{
                background: '#f1f5f9',
                color: '#334155',
                padding: '6px 12px',
                minHeight: '34px',
                fontSize: '0.8rem'
              }}
            >
              📄 Sample Delhi HC Notice
            </button>

            <button
              onClick={() => loadSampleNotice('bombay')}
              style={{
                background: '#f1f5f9',
                color: '#334155',
                padding: '6px 12px',
                minHeight: '34px',
                fontSize: '0.8rem'
              }}
            >
              📄 Sample Bombay HC Appeal
            </button>

            <button
              onClick={() => loadSampleNotice('blurry')}
              style={{
                background: '#fee2e2',
                color: '#991b1b',
                padding: '6px 12px',
                minHeight: '34px',
                fontSize: '0.8rem'
              }}
            >
              ⚠️ Sample Blurry Notice (Low Confidence)
            </button>

            <button
              onClick={() => setShowTextInput(!showTextInput)}
              style={{
                background: '#0f172a',
                color: '#38bdf8',
                padding: '6px 12px',
                minHeight: '34px',
                fontSize: '0.8rem',
                fontWeight: 700
              }}
            >
              📝 {showTextInput ? 'Hide Text Box' : 'Paste Raw Notice Text (Groq AI)'}
            </button>
          </div>
        </div>

        {/* Custom Notice Textarea */}
        {showTextInput && (
          <div style={{ marginTop: '16px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
              PASTE ANY INDIAN COURT NOTICE / ORDER TEXT FOR GROQ AI EXTRACTION:
            </label>
            <textarea
              rows={4}
              value={customNoticeText}
              onChange={(e) => setCustomNoticeText(e.target.value)}
              placeholder="e.g. HIGH COURT OF DELHI ... WP(C) 1402/2024 ... CNR: DLHC01-008472-2024 ... NEXT HEARING: 08-09-2026"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #94a3b8',
                fontSize: '0.88rem',
                fontFamily: 'monospace'
              }}
            />
            <button
              onClick={handleCustomTextExtract}
              disabled={isProcessing || !customNoticeText.trim()}
              style={{
                marginTop: '8px',
                background: '#f59e0b',
                color: '#0f172a',
                fontWeight: 800,
                padding: '8px 18px'
              }}
            >
              ⚡ Extract Case with Groq AI (qwen/qwen3.8-27b)
            </button>
          </div>
        )}

        {/* OCR Progress State */}
        {isProcessing && (
          <div style={{
            marginTop: '20px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}>
            <RefreshCw size={28} color="#0284c7" className="anim-pulse" />
            <div style={{ fontWeight: 800, color: '#1e40af' }}>{progressStatus}</div>
            <div style={{ fontSize: '0.8rem', color: '#60a5fa' }}>
              Enhancing contrast, binarizing legal text & reading CNR number...
            </div>
          </div>
        )}

        {/* Image Previews */}
        {imagePreview && !isProcessing && (
          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '4px' }}>ORIGINAL NOTICE PHOTO</span>
              <img
                src={imagePreview}
                alt="Notice Original"
                style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
            </div>

            {processedPreview && (
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 700, display: 'block', marginBottom: '4px' }}>ENHANCED OCR BINARIZATION</span>
                <img
                  src={processedPreview}
                  alt="Notice Enhanced"
                  style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #0284c7' }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {extractedData && (
        <ConfirmationModal
          data={extractedData}
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmed}
        />
      )}
    </div>
  );
};
