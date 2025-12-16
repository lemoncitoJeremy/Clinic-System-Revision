import Logo from '../../assets/Logo3.png';
import DashboardIcon from '../../assets/dashboard.png';
import PatientsIcon from '../../assets/patient-records.png';
import QueueIcon from '../../assets/tast-queue.png';
import SettingsIcon from '../../assets/settings.png';
import SupportIcon from '../../assets/support.png';
import UpdateIcon from '../../assets/refresh-cw.png';
import PricingIcon from '../../assets/clipboard.png';
import AnalyticsIcon from '../../assets/trending-up.png';
import LogoutIcon from '../../assets/log-out.png';
import './nav_styles.css';
import { useNavigate } from 'react-router-dom';
import StethoscopeIcon from '../../assets/stethoscope_light.png'

const Navbar = () => {
  const navigate = useNavigate();
  const res_dict = sessionStorage.getItem('user');
  const user_session_data = res_dict ? JSON.parse(res_dict)["data"] : null;
  const isAdmin = user_session_data?.role === "admin";

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="nav-options">
        <div className="logo">
          <img src={Logo} alt="Logo" style={{ width: '180px', height: '180px', marginBottom:'30px' }} />
        </div>
            <a onClick={() => navigate("/dashboard")} className="admin-only">
              <img src={DashboardIcon} alt="Dashboard" className="nav-icon" />
              <span>Dashboard</span>
            </a>
            <a onClick={() => navigate("/p-records")} className="admin-only">
              <img src={PatientsIcon} alt="Patients" className="nav-icon" />
              <span>Patient Records</span>
            </a>
            <a onClick={() => navigate("/queue")}>
              <img src={QueueIcon} alt="Queue" className="nav-icon" />
              <span>Task Queue</span>
            </a>
        {isAdmin && (
          <>
            <a onClick={() => navigate("/analytics")}>
              <img src={AnalyticsIcon} alt="Analytics" className="nav-icon" />
              <span>Analytics</span>
            </a>
            {/* <a onClick={() => navigate("/serviceOffers")}>
              <img src={PricingIcon} alt="ServiceOffers" className="nav-icon" />
              <span>Service Offers</span>
            </a>
            <a onClick={() => navigate("/medicalStaff")}>
              <img src={StethoscopeIcon} alt="MedicalStaff" className="nav-icon" />
              <span>Staff</span>
            </a> */}
          </>
        )} 
      </div>

      <div className="bottom-portion">
        {/* <a onClick={() => navigate("/settings")}>
          <img src={SettingsIcon} alt="Settings" className="nav-icon" />
          <span>Settings</span>
        </a>

        <a onClick={() => navigate("/support")}>
          <img src={SupportIcon} alt="Support" className="nav-icon" />
          <span>Support</span>
        </a> */}
        
        <a onClick={handleLogout}>
          <img src={LogoutIcon} alt="Logout" className="nav-icon" />
          <span>Log Out</span>
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
