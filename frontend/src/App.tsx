import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login/login";
import Dashboard from "./pages/dashboard/dashboard";
import FormPage from "./pages/form/form_page";
import ProtectedRoute from './components/routeGuard/routeGuard';
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
      </Routes>
    </BrowserRouter>
  )
}

export default App
