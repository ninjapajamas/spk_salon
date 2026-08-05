import { useEffect, useRef, useState } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';
import { Camera, CheckCircle2, Keyboard, QrCode, ScanLine, XCircle } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';

export default function QrScanner({ onLogout, onScanReservation }) {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const controlsRef = useRef(null);
  const isReadingRef = useRef(false);
  const [code, setCode] = useState('');
  const [cameraMessage, setCameraMessage] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const stopCamera = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    isReadingRef.current = false;
    if (videoRef.current) videoRef.current.srcObject = null;
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

  const startCamera = async () => {
    setResult(null);
    setCameraMessage('');
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraMessage('Browser belum memberi akses kamera. Gunakan Chrome/Edge terbaru atau input manual.');
        return;
      }

      scannerRef.current = scannerRef.current || new BrowserQRCodeReader();
      setIsCameraActive(true);
      controlsRef.current = await scannerRef.current.decodeFromConstraints(
        { video: { facingMode: { ideal: 'environment' } }, audio: false },
        videoRef.current,
        async (scanResult, error, controls) => {
          if (!scanResult || isReadingRef.current) return;
          isReadingRef.current = true;
          controls.stop();
          controlsRef.current = null;
          await validateCode(scanResult.getText());
        }
      );
    } catch (error) {
      const permissionDenied = error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError';
      setCameraMessage(
        permissionDenied
          ? 'Akses kamera ditolak. Izinkan kamera di browser, lalu aktifkan lagi.'
          : 'Kamera tidak dapat dibuka. Pastikan halaman memakai localhost/HTTPS atau gunakan kode manual.'
      );
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
