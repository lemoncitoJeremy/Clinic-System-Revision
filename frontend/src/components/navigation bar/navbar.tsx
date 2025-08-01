import Logo from '../../assets/logo2.png';
import './styles.css'
import { useNavigate } from 'react-router-dom';

const navbar = () => {
  const navigate = useNavigate();
  const res_dict = sessionStorage.getItem('user');
  const user_session_data = res_dict ? JSON.parse(res_dict)["data"] : null;
  const isAdmin = user_session_data?.role === "admin";

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <nav className="navbar" >
        <img src={Logo} alt="Logo" style={{ width: '150px', height: '150px' }} />
        { isAdmin && (
          <>
            <a  onClick= {()=>navigate("/dashboard")} className="admin-only">My Dashboard</a>
            <a  onClick= {()=>navigate("/records")} className="admin-only">Records</a>
            <a  onClick= {()=>navigate("/logs")} id="nav-logs" className="admin-only">Logs</a> 
          </>
        )}
            <a onClick= {()=>navigate("/forms")}>Forms</a>
            <a onClick= {()=>navigate("/settings")}>Settings</a>
            <a onClick= {handleLogout}>Log Out</a>
    </nav>
  )
}

export default navbar