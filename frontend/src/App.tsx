import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login/login";
import Dashboard from "./pages/dashboard/dashboard";
import FormPage from "./pages/form/form_page";
import ProtectedRoute from './components/routeGuard/routeGuard';
import ServicesPage from "./pages/services/services"
import QueuePage from './pages/queue/queue';
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
      </Routes>
    </BrowserRouter>
  )
}

export default App
