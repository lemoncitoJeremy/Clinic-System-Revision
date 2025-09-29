import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
const IP = import.meta.env.VITE_SERVER_IP_ADD;

type QueuedCase = {
    case_id: string;
    firstname: string;
    middlename: string;
    lastname: string;
    physician_name: string;
    service_type: string;
    status: string;
    request_date: Date;
  };

const dashKpis = () => {
    const navigate = useNavigate();
    const [totalPatients, setTotalPatients] = useState<number>(0);
    const [totalCasesDone, setTotalCases] = useState<number>(0);
    const [queuedCases, setQueuedCases] = useState<QueuedCase[]>([]);

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

    useEffect(() => {
        const fetchTotalDone = async () => {
        try {
            const res = await fetch(`http://${IP}/total-cases-done`);
            const data = await res.json();
            if (data.success) {
            setTotalCases(data.TotalCasesDone[0].total_cases_done);
            }
        } catch (err) {
            console.error("Error fetching total patients:", err);
        }
        };
        fetchTotalDone();
    }, []);

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
    
  return (
    <div className="kpi-section">
        <div className='hder-add-patient'>
            <h1 id="welcomeMessage">Dashboard</h1>
            <div className='dash-btn'>
                <button id="viewQueueBtn" 
                        onClick={()=>{navigate('/queue')}}>
                        View Queue
                </button> 
                <button id="addPatientBtn"
                        onClick={()=>{navigate('/add-patient')}}>
                        Add Patient
                </button>
            </div> 
        </div>
        <div className="kpi-cards">
            <div className="kpi-card customer-count">
                <p>Total patients Registered</p>
                <h2>{totalPatients}</h2>
            </div>
            <div className="kpi-card customer-count">
                <p>Total Task Done</p>
                <h2>{totalCasesDone}</h2>
            </div>
            <div className="kpi-card task-count">
                <p>Total Tasks in Queue</p>
                <h2>{queuedCases.length}</h2>
            </div>
        </div>
    </div>
  )
}

export default dashKpis