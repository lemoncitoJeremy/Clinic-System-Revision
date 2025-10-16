import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login/login";
import Dashboard from "./pages/dashboard/dashboard";
import ProtectedRoute from './components/routeGuard/routeGuard';
import QueuePage from './pages/queue/queue';
import AddPatient from './pages/add-patient/add_patient';
import Records from './pages/patient-records/patient_records'; 
import PatientDetails from './pages/patient-details/patient_details';
import AddService from './pages/add-service/add_service';
import ServiceRecord from './pages/service-record/service_record';
import UpdateInfo from './pages/update-info/update-info';
import Analytics from './pages/analytics/analytics';
import ServiceOffers from './pages/service-offers/service_offers';
import MedicalStaff from './pages/medical-staff/medical_staff';
function App() {

  return (
   <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<Login/>} />
        <Route path="/dashboard" element={
            <ProtectedRoute> 
              <Dashboard/> 
            </ProtectedRoute>} 
        />
        <Route path="/queue" element={
            <ProtectedRoute> 
            <QueuePage/>
            </ProtectedRoute>} 
        />
        <Route path="/add-patient" element={
            <ProtectedRoute> 
            <AddPatient/>
            </ProtectedRoute>} 
        />
        <Route path="/p-records" element={
            <ProtectedRoute> 
            <Records/>
            </ProtectedRoute>} 
        />
        <Route path="/patients/:id" element={
            <ProtectedRoute>
              <PatientDetails />
            </ProtectedRoute>} 
        />
        <Route path="/patients/add-service/:id" element={
            <ProtectedRoute>
              <AddService />
            </ProtectedRoute>} 
        />
        <Route path="/patients/reports/:id" element={
            <ProtectedRoute>
              <ServiceRecord />
            </ProtectedRoute>} 
        />
        <Route path="/patients/update-info/:id" element={
            <ProtectedRoute>
              <UpdateInfo />
            </ProtectedRoute>} 
        />
        <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>} 
        />
        <Route path="/serviceOffers" element={
            <ProtectedRoute>
              <ServiceOffers />
            </ProtectedRoute>} 
        />
        <Route path="/medicalStaff" element={
            <ProtectedRoute>
              <MedicalStaff />
            </ProtectedRoute>} 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
