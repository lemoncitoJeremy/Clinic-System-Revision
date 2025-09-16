import { use, useEffect, useState } from 'react';
import Navbar from '../../components/navigation bar/navbar';
import './dashboard_styles.css';
import { useNavigate } from 'react-router-dom';

const dashboard = () => {

    const res_dict = sessionStorage.getItem('user');
    const navigate = useNavigate();
    const user_session_data = res_dict ? JSON.parse(res_dict)["data"] : null;  

    type QueuedCase = {
        case_id: string;
        firstname: string;
        middlename: string;
        lastname: string;
        requesting_physician: string;
        service_type: string;
        status: string;
        request_date: Date;
        };

    const [queuedCases, setQueuedCases] = useState<QueuedCase[]>([]);
    
      useEffect(() => {
        const fetchQueuedCases = async () => {
          try {
            const res = await fetch("http://localhost:3000/queued-cases");
            const data = await res.json();
            if (data.success) {
              setQueuedCases(data.queuedCases);
            }
          } catch (err) {
            console.error("Error fetching queued cases:", err);
          }
        };
        fetchQueuedCases();
      }, []);

      console.log(queuedCases);
    
  return (
        <div className="dash-container">
            <div className="content-section">
                <div className='navigation-panel'>
                    <Navbar/>
                </div>
                <div className="divider">
                    <div className="kpi-section">
                        <div className='hder-add-patient'>
                            <h1 id="welcomeMessage">Dashboard</h1>
                            <div className='dash-btn'>
                                <button id="viewQueueBtn">View Queue</button> 
                                <button id="addPatientBtn" onClick={()=>{navigate('/add-patient')}}>Add Patient</button>
                            </div> 
                        </div>
                        <div className="kpi-cards">
                            <div className="kpi-card customer-count">
                            <p>Total patients</p>
                            <h2>120</h2>
                            </div>
                            <div className="kpi-card task-count">
                            <p>Total tasks in queue</p>
                            <h2>{queuedCases.length}</h2>
                            </div>
                        </div>
                    </div>
                    <div className='task-queue-table'>
                        <table>
                            <thead>
                                <tr>
                                    <th>Case ID</th>
                                    <th>Requesting Physician</th>
                                    <th>Service Type</th>
                                    <th>Status</th>
                                    <th>Request Date</th>
                                </tr>
                            </thead>
                             <tbody>
                                {queuedCases.length > 0 ? (
                                    queuedCases.map((caseItem, index) => (
                                    <tr key={index}>
                                        <td>{caseItem.case_id}</td>
                                        <td>{caseItem.requesting_physician}</td>
                                        <td>{caseItem.service_type}</td>
                                        <td>
                                            <span className={`status-badge ${caseItem.status.toLowerCase()}`}>
                                                {caseItem.status}
                                            </span>
                                        </td>
                                        <td>
                                        {caseItem.request_date
                                            ? new Date(caseItem.request_date).toLocaleDateString()
                                            : "-"}
                                        </td>
                                    </tr>
                                    ))
                                ) : (
                                    <tr>
                                    <td colSpan={8}>No queued cases found.</td>
                                    </tr>
                                )}
                                </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
  )
}

export default dashboard