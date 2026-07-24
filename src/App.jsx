import { useCallback, useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import CustomerDashboard from './pages/CustomerDashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import ProfileQuiz from './pages/ProfileQuiz';
import Recommendations from './pages/Recommendations';
import Reserve from './pages/Reserve';
import Treatments from './pages/Treatments';
import AdminAttributes from './pages/admin/Attributes';
import AdminCustomers from './pages/admin/Customers';
import AdminDashboard from './pages/admin/Dashboard';
import AdminInventory from './pages/admin/Inventory';
import AdminQrScanner from './pages/admin/QrScanner';
import { api } from './services/api';
import { attributeCatalog as seedAttributes, treatments as seedTreatments } from './utils/recommendationEngine';

const STORAGE_KEYS = {
  activeConsultationId: 'jharmySalon.activeConsultationId.v3',
  currentUser: 'jharmySalon.currentUser.v3',
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value) {
  return uuidPattern.test(String(value || ''));
}

function readStorage(key, fallback) {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function PublicPage({ children, hasConsultation, currentUser, onLogout }) {
  return (
    <>
      <Navbar
        currentUser={currentUser}
        hasConsultation={hasConsultation}
        onLogout={onLogout}
      />
      {children}
    </>
  );
}

function RequireAdmin({ currentUser, children }) {
  if (currentUser?.role !== 'admin') {
    return <Navigate to="/login?role=admin" replace />;
  }

  return children;
}

function upsertById(items, item) {
  const exists = items.some((current) => current.id === item.id);
  return exists
    ? items.map((current) => (current.id === item.id ? item : current))
    : [item, ...items];
}

function App() {
  const [treatmentItems, setTreatmentItems] = useState(seedTreatments);
  const [attributeItems, setAttributeItems] = useState(seedAttributes);
  const [consultations, setConsultations] = useState([]);
  const [activeConsultationId, setActiveConsultationId] = useState(() => {
    const stored = readStorage(STORAGE_KEYS.activeConsultationId, null);
    return isUuid(stored) ? stored : null;
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = readStorage(STORAGE_KEYS.currentUser, null);
    return stored?.id && isUuid(stored.id) ? stored : null;
  });
  const [apiError, setApiError] = useState('');

  const refreshCatalog = useCallback(async () => {
    try {
      setApiError('');
      const [treatments, attributes] = await Promise.all([
        api.getTreatments(),
        api.getAttributes(),
      ]);
      setTreatmentItems(treatments);
      setAttributeItems(attributes);
    } catch (error) {
      setApiError(error.message);
    }
  }, []);

  const refreshConsultations = useCallback(async () => {
    try {
      setApiError('');

      if (currentUser?.role === 'admin') {
        setConsultations(await api.getConsultations());
        return;
      }

      if (currentUser?.role === 'customer') {
        setConsultations(await api.getConsultations(currentUser.id));
        return;
      }

      if (isUuid(activeConsultationId)) {
        setConsultations([await api.getConsultation(activeConsultationId)]);
        return;
      }

      setConsultations([]);
    } catch (error) {
      setApiError(error.message);
      setConsultations([]);
    }
  }, [activeConsultationId, currentUser]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshCatalog();
  }, [refreshCatalog]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshConsultations();
  }, [refreshConsultations]);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEYS.activeConsultationId,
      JSON.stringify(activeConsultationId)
    );
  }, [activeConsultationId]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(currentUser));
  }, [currentUser]);

  const activeConsultation = useMemo(() => {
    return consultations.find((consultation) => consultation.id === activeConsultationId) || null;
  }, [activeConsultationId, consultations]);

  const customerConsultations = useMemo(() => {
    if (currentUser?.role !== 'customer') return [];
    return consultations.filter((consultation) => consultation.userId === currentUser.id);
  }, [consultations, currentUser]);

  const handleLogin = async ({ email, password, role }) => {
    try {
      const { user } = await api.login({ email, password, role });
      setCurrentUser(user);
      if (role === 'admin') setActiveConsultationId(null);
      return { ok: true, user };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  const handleRegisterCustomer = async (payload) => {
    try {
      const { user } = await api.registerCustomer(payload);
      setCurrentUser(user);
      setActiveConsultationId(null);
      return { ok: true, user };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveConsultationId(null);
    setConsultations([]);
  };

  const handleUpdateAccount = async (payload) => {
    const user = await api.updateCustomer(currentUser.id, payload);
    setCurrentUser(user);
    return user;
  };

  const handleCreateConsultation = async (payload) => {
    const consultation = await api.createConsultation({
      ...payload,
      userId: currentUser?.role === 'customer' ? currentUser.id : null,
    });

    setConsultations((current) => upsertById(current, consultation));
    setActiveConsultationId(consultation.id);
    return consultation;
  };

  const handleCreateReservation = async (payload) => {
    const reservation = await api.createReservation(payload);
    setConsultations((current) => upsertById(current, reservation));
    setActiveConsultationId(reservation.id);
    return reservation;
  };

  const handleUpdateConsultationStatus = async (consultationId, status) => {
    const consultation = await api.updateConsultationStatus(consultationId, status);
    setConsultations((current) => upsertById(current, consultation));
  };

  const handleDeleteConsultation = async (consultationId) => {
    await api.deleteConsultation(consultationId);
    setConsultations((current) =>
      current.filter((consultation) => consultation.id !== consultationId)
    );
    if (activeConsultationId === consultationId) setActiveConsultationId(null);
  };

  const handleSaveSalonNote = async (consultationId, note) => {
    const consultation = await api.updateSalonNote(consultationId, note);
    setConsultations((current) => upsertById(current, consultation));
    return consultation;
  };

  const handleScanReservation = async (code) => {
    const result = await api.scanReservation(code);
    if (result.reservation) {
      setConsultations((current) => upsertById(current, result.reservation));
    }
    return result;
  };

  const handleSaveTreatment = async (payload) => {
    const normalized = {
      ...payload,
      attributes: Array.from(new Set([payload.category, ...payload.attributes].filter(Boolean))),
    };
    const treatment = await api.saveTreatment(normalized);
    setTreatmentItems((current) => upsertById(current, treatment));
    await refreshCatalog();
  };

  const handleDeleteTreatment = async (treatmentId) => {
    await api.deleteTreatment(treatmentId);
    setTreatmentItems((current) =>
      current.filter((treatment) => treatment.id !== treatmentId)
    );
  };

  const handleSaveAttribute = async (payload) => {
    await api.saveAttribute(payload);
    await refreshCatalog();
  };

  const handleDeleteAttribute = async (code) => {
    await api.deleteAttribute(code);
    await refreshCatalog();
  };

  const handleSelectConsultation = (consultationId) => {
    setActiveConsultationId(consultationId);
  };

  const hasConsultation = Boolean(activeConsultation);
  const publicPageProps = { hasConsultation, currentUser, onLogout: handleLogout };

  return (
    <BrowserRouter>
      {apiError && <div className="api-banner">{apiError}</div>}
      <Routes>
        <Route
          path="/"
          element={
            <PublicPage {...publicPageProps}>
              <Home currentUser={currentUser} treatments={treatmentItems} />
            </PublicPage>
          }
        />
        <Route
          path="/treatments"
          element={
            <PublicPage {...publicPageProps}>
              <Treatments treatments={treatmentItems} currentUser={currentUser} />
            </PublicPage>
          }
        />
        <Route
          path="/login"
          element={
            <PublicPage {...publicPageProps}>
              <Login
                currentUser={currentUser}
                onLogin={handleLogin}
                onRegisterCustomer={handleRegisterCustomer}
              />
            </PublicPage>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PublicPage {...publicPageProps}>
              <CustomerDashboard
                currentUser={currentUser}
                consultations={customerConsultations}
                treatments={treatmentItems}
                onSelectConsultation={handleSelectConsultation}
                onUpdateAccount={handleUpdateAccount}
              />
            </PublicPage>
          }
        />
        <Route
          path="/quiz"
          element={
            <PublicPage {...publicPageProps}>
              <ProfileQuiz
                currentUser={currentUser}
                onCreateConsultation={handleCreateConsultation}
              />
            </PublicPage>
          }
        />
        <Route
          path="/recommendations"
          element={
            <PublicPage {...publicPageProps}>
              <Recommendations
                consultation={activeConsultation}
                treatments={treatmentItems}
                currentUser={currentUser}
              />
            </PublicPage>
          }
        />
        <Route
          path="/reserve/:treatmentId"
          element={
            <PublicPage {...publicPageProps}>
              <Reserve
                currentUser={currentUser}
                treatments={treatmentItems}
                onCreateReservation={handleCreateReservation}
              />
            </PublicPage>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAdmin currentUser={currentUser}>
              <AdminDashboard
                treatments={treatmentItems}
                consultations={consultations}
                onLogout={handleLogout}
              />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <RequireAdmin currentUser={currentUser}>
              <AdminInventory
                attributes={attributeItems}
                treatments={treatmentItems}
                onSaveTreatment={handleSaveTreatment}
                onDeleteTreatment={handleDeleteTreatment}
                onLogout={handleLogout}
              />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/attributes"
          element={
            <RequireAdmin currentUser={currentUser}>
              <AdminAttributes
                attributes={attributeItems}
                treatments={treatmentItems}
                onSaveAttribute={handleSaveAttribute}
                onDeleteAttribute={handleDeleteAttribute}
                onLogout={handleLogout}
              />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireAdmin currentUser={currentUser}>
              <AdminCustomers
                treatments={treatmentItems}
                consultations={consultations}
                onUpdateStatus={handleUpdateConsultationStatus}
                onSaveSalonNote={handleSaveSalonNote}
                onDeleteConsultation={handleDeleteConsultation}
                onLogout={handleLogout}
              />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/scan"
          element={
            <RequireAdmin currentUser={currentUser}>
              <AdminQrScanner
                onLogout={handleLogout}
                onScanReservation={handleScanReservation}
              />
            </RequireAdmin>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
