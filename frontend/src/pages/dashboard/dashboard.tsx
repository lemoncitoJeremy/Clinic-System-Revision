import Navbar from '../../components/navigation bar/navbar';
import './dashboard_styles.css';
import DashTable from '../../components/dash/table/DashTable';
import DashKpis from '../../components/dash/kpis/DashKpis';
const IP = import.meta.env.VITE_SERVER_IP_ADD;

const Dashboard = () => {
  const res_dict = sessionStorage.getItem('user');
  const user_session_data = res_dict ? JSON.parse(res_dict)["data"] : null;  

  return (
    <div className="dash-container">
      <div className="content-section">
        <div className='navigation-panel'>
          <Navbar/>
        </div>
        <div className="divider">
          <DashKpis/>
          <DashTable/>
        </div>
      </div>
    </div>
  )
}

export default Dashboard;
