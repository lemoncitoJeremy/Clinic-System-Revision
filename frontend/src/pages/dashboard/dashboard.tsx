import { useEffect, useState } from 'react';
import Navbar from '../../components/navigation bar/navbar';
import './dashboard_styles.css';
import { useNavigate } from 'react-router-dom';
import ArrowIcon from "../../assets/Arrow.png"

const IP = import.meta.env.VITE_SERVER_IP_ADD;

const Dashboard = () => {
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
  const [totalPatients, setTotalPatients] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const fetchQueuedCases = async () => {
      try {
        const res = await fetch(`http://${IP}/queued-cases`);
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

  useEffect(() => {
    const fetchTotalPatients = async () => {
      try {
        const res = await fetch(`http://${IP}/total-patients`);
        const data = await res.json();
        if (data.success) {
          setTotalPatients(data.TotalPatients[0].total_patients);

        }
      } catch (err) {
        console.error("Error fetching total patients:", err);
      }
    };
    fetchTotalPatients();
  }, []);

  // Pagination logic
  const rowsPerPage = 7;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = queuedCases.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(queuedCases.length / rowsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleRowClick = (caseId: string) => {
    navigate(`/patients/reports/${caseId}`);
    
  };

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
                <button id="viewQueueBtn" onClick={()=>{navigate('/queue')}}>View Queue</button> 
                <button id="addPatientBtn" onClick={()=>{navigate('/add-patient')}}>Add Patient</button>
              </div> 
            </div>
            <div className="kpi-cards">
              <div className="kpi-card customer-count">
                <p>Total patients Registered</p>
                <h2>{totalPatients}</h2>
              </div>
              <div className="kpi-card task-count">
                <p>Total tasks in queue</p>
                <h2>{queuedCases.length}</h2>
              </div>
            </div>
          </div>

          <div className="dash-q-task-queue-table">
            <table>
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Date</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Physician</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((caseItem, index) => (
                    <tr key={index}>
                      <td>{`${caseItem.case_id}`}</td>
                      <td>
                        {caseItem.request_date
                          ? new Date(caseItem.request_date).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: '2-digit',
                            })
                          : "-"}
                      </td>
                      <td>{caseItem.service_type}</td>
                      <td>
                        <span className={`q-status-badge ${caseItem.status.toLowerCase()}`}>
                          {caseItem.status}
                        </span>
                      </td>
                      <td>{caseItem.requesting_physician}</td>
                      <td>
                        <a
                          className="arrow-btn"
                          onClick={() => handleRowClick(caseItem.case_id)}
                        >
                          <img src={ArrowIcon} alt="Arrow" className="arrow-icon" style={{ width: '15px', height: '15px' }} />
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>No queued cases found.</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="dash-pagination">
              <button onClick={handlePrevPage} disabled={currentPage === 1}>
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard;
