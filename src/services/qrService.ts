import jsQR from 'jsqr';

export interface QrParseResult {
  rawContent: string;
  extractedCnr?: string;
  isValidCourtQr: boolean;
  courtSource?: string;
  errorMessage?: string;
}

/**
 * Jurislink QR Code Decoder & Validator
 * Decodes eCourts / NJDG QR codes printed on court summons, cause-lists, and certified copies.
 */
export class QrService {
  /**
   * Scan image canvas or video frame for QR Code
   */
  static decodeFromImageData(imageData: ImageData): QrParseResult | null {
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth'
    });

    if (!code || !code.data) return null;

    return this.parseCourtQrContent(code.data);
  }

  /**
   * Parse QR code content (eCourts URL, JSON, or Plain CNR string)
   */
  static parseCourtQrContent(content: string): QrParseResult {
    const trimmed = content.trim();

    // 1. Direct CNR string (e.g. DLHC01-008472-2024 or DLHC010084722024)
    const directCnrMatch = trimmed.match(/\b([A-Z]{4}\d{2}[-\s]?\d{6}[-\s]?\d{4})\b/i);
    if (directCnrMatch) {
      return {
        rawContent: trimmed,
        extractedCnr: directCnrMatch[1].replace(/[\s]/g, '-').toUpperCase(),
        isValidCourtQr: true,
        courtSource: 'Official Court Notice QR'
      };
    }

    // 2. Official eCourts Services URL format (e.g. services.ecourts.gov.in/ecourtindia_v6/?cnr=...)
    try {
      if (trimmed.includes('ecourts.gov.in') || trimmed.includes('njdg.ecourts.gov.in') || trimmed.includes('jurislink.gov.in')) {
        const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
        const cnrParam = url.searchParams.get('cnr') || url.searchParams.get('cno') || url.searchParams.get('case_id');
        
        if (cnrParam) {
          return {
            rawContent: trimmed,
            extractedCnr: cnrParam.toUpperCase(),
            isValidCourtQr: true,
            courtSource: 'eCourts National Judicial Data Grid (NJDG)'
          };
        }
      }
    } catch {
      // Not a valid URL
    }

    // 3. Structured JSON format from modern digital e-Summons
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.cnr || parsed.caseNumber) {
        return {
          rawContent: trimmed,
          extractedCnr: (parsed.cnr || parsed.caseNumber).toUpperCase(),
          isValidCourtQr: true,
          courtSource: 'Digital e-Summons QR'
        };
      }
    } catch {
      // Not JSON
    }

    return {
      rawContent: trimmed,
      isValidCourtQr: false,
      errorMessage: 'QR Code detected, but it does not contain a recognized eCourts or CNR case identifier.'
    };
  }
}
