import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/login/login";
import Dashboard from "./components/dashboard/dashboard";
import FormPage from "./components/form/form_page";
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
