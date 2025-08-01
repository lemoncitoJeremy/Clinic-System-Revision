import Navbar from '../../components/navigation bar/navbar';
import './dashboard_styles.css';

const dashboard = () => {

    const res_dict = sessionStorage.getItem('user');
    const user_session_data = res_dict ? JSON.parse(res_dict)["data"] : null;  
    
  return (
        <div className="dash-container">
            <div className="content-section">
                <div className='navigation-panel'>
                    <Navbar/>
                </div>
                <div className="divider">
                    <div className="main-content">
                        <h1 id="welcomeMessage">
                             Welcome{user_session_data ? `, ${user_session_data.username}!` : '!'}
                        </h1>
                        <p> doctor's schedule, price list, list  of services per specialization</p>
                    </div>
                    <div className="sub-content">
                        <div className="container-2">
                        </div>
                        <div className="container-3">
                        </div>
                    </div>
                </div>
                <div className="container-4"></div>
            </div>
        </div>
  )
}

export default dashboard