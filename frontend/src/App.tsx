import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login/login";
import Dashboard from "./pages/dashboard/dashboard";
import FormPage from "./pages/form/form_page";
import ProtectedRoute from './components/routeGuard/routeGuard';
import ServicesPage from "./pages/services/services"
import QueuePage from './pages/queue/queue';
import AddPatient from './pages/add-patient/add_patient';
import Records from './pages/patient-records/patient_records'; 
import PatientDetails from './pages/patient-details/patient_details';
import AddService from './pages/add-service/add_service';
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
        <Route path="/forms" element={
            <ProtectedRoute> 
            <FormPage/>
            </ProtectedRoute>} 
        />
        <Route path="/services" element={
            <ProtectedRoute> 
            <ServicesPage/>
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
      </Routes>
    </BrowserRouter>
  )
}

export default App
