import { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, Keyboard, QrCode, ScanLine, XCircle } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';

export default function QrScanner({ onLogout, onScanReservation }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const detectorRef = useRef(null);
  const scanningRef = useRef(false);
  const [code, setCode] = useState('');
  const [cameraMessage, setCameraMessage] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const stopCamera = () => {
    scanningRef.current = false;
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraActive(false);
  };

  useEffect(() => stopCamera, []);

  const validateCode = async (rawCode) => {
    const normalized = String(rawCode || '').trim();
    if (!normalized || isSubmitting) return;
    try {
      setIsSubmitting(true);
      setResult(null);
      const response = await onScanReservation(normalized);
      setResult({ ok: true, ...response });
      setCode(response.reservation?.reservationCode || normalized.replace(/^JHARMY:/i, ''));
      stopCamera();
    } catch (error) {
      setResult({ ok: false, message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scanFrame = async () => {
    if (!scanningRef.current || !videoRef.current || !detectorRef.current) return;
    try {
      if (videoRef.current.readyState >= 2) {
        const codes = await detectorRef.current.detect(videoRef.current);
        if (codes[0]?.rawValue) {
          await validateCode(codes[0].rawValue);
          return;
        }
      }
    } catch {
      setCameraMessage('QR belum terbaca. Arahkan kamera lebih dekat dan pastikan pencahayaan cukup.');
    }
    animationRef.current = requestAnimationFrame(scanFrame);
  };

  const startCamera = async () => {
    setResult(null);
    setCameraMessage('');
    if (!('BarcodeDetector' in window)) {
      setCameraMessage('Browser ini belum mendukung pemindai QR. Gunakan input kode manual.');
      return;
    }
    try {
      const formats = await window.BarcodeDetector.getSupportedFormats();
      if (!formats.includes('qr_code')) {
        setCameraMessage('Pemindaian QR tidak didukung browser ini. Gunakan input kode manual.');
        return;
      }
      detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      scanningRef.current = true;
      setIsCameraActive(true);
      animationRef.current = requestAnimationFrame(scanFrame);
    } catch {
      setCameraMessage('Kamera tidak dapat dibuka. Izinkan akses kamera atau gunakan kode manual.');
      stopCamera();
    }
  };

  const submitManual = (event) => {
    event.preventDefault();
    validateCode(code);
  };

  return (
    <div className="admin-shell">
      <AdminSidebar onLogout={onLogout} />
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <p className="eyebrow">Validasi kedatangan</p>
            <h1>Scan QR Reservasi</h1>
            <p>Scan QR pelanggan untuk memvalidasi reservasi dan menyelesaikan perawatan secara otomatis.</p>
          </div>
          <div className="admin-avatar"><ScanLine size={24} /></div>
        </header>

        <div className="scanner-layout">
          <section className="admin-card scanner-card">
            <div className="admin-card-heading">
              <div>
                <h2><Camera size={20} /> Kamera Pemindai</h2>
                <p>Arahkan QR reservasi pelanggan ke area kamera.</p>
              </div>
            </div>
            <div className={isCameraActive ? 'camera-frame active' : 'camera-frame'}>
              <video ref={videoRef} muted playsInline />
              <div className="scan-corners" aria-hidden="true" />
              {!isCameraActive && (
                <div className="camera-placeholder">
                  <QrCode size={48} />
                  <p>Kamera belum aktif</p>
                </div>
              )}
            </div>
            <div className="button-row">
              {!isCameraActive ? (
                <button type="button" className="btn-primary" onClick={startCamera}>
                  <Camera size={18} />
                  Aktifkan Kamera
                </button>
              ) : (
                <button type="button" className="btn-secondary" onClick={stopCamera}>
                  Matikan Kamera
                </button>
              )}
            </div>
            {cameraMessage && <p className="form-hint warning">{cameraMessage}</p>}
          </section>

          <section className="admin-card scanner-card">
            <div className="admin-card-heading">
              <div>
                <h2><Keyboard size={20} /> Input Manual</h2>
                <p>Masukkan kode di bawah QR jika kamera tidak tersedia.</p>
              </div>
            </div>
            <form className="manual-scan-form" onSubmit={submitManual}>
              <label className="field">
                <span>Kode reservasi</span>
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="Contoh: JHS-12AB34CD56EF"
                  required
                />
              </label>
              <button type="submit" className="btn-primary wide-button" disabled={isSubmitting}>
                <ScanLine size={18} />
                {isSubmitting ? 'Memvalidasi...' : 'Validasi Reservasi'}
              </button>
            </form>

            {result && (
              <div className={result.ok ? 'scan-result success' : 'scan-result error'}>
                {result.ok ? <CheckCircle2 size={30} /> : <XCircle size={30} />}
                <div>
                  <h3>{result.ok ? 'QR Reservasi Valid' : 'QR Tidak Valid'}</h3>
                  <p>{result.message}</p>
                  {result.reservation && (
                    <dl className="scan-detail">
                      <div><dt>Pelanggan</dt><dd>{result.reservation.customer.name}</dd></div>
                      <div><dt>Jadwal</dt><dd>{result.reservation.customer.visitDate}, {result.reservation.customer.visitTime}</dd></div>
                      <div><dt>Status</dt><dd>{result.reservation.status}</dd></div>
                    </dl>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
