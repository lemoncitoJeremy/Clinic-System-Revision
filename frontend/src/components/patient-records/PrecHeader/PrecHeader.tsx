import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PrecTable from "../PatientRecTable/PrecTable"
const IP = import.meta.env.VITE_SERVER_IP_ADD;

type Patient = {
  firstname?: string;
  middlename?: string;
  lastname?: string;
  birthdate: Date;
  gender: string;
  patient_id: string;
};


const PrecHeader = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchInput, setSearchInput] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    useEffect(() => {
        const fetchRegisteredPatients = async () => {
        try {
            const res = await fetch(`http://${IP}/patients`);
            const data = await res.json();
            if (data.success) {
            setPatients(data.RegisteredPatients);
            }
        } catch (err) {
            console.error("Error fetching patients:", err);
        }
        };
        fetchRegisteredPatients();
    }, []);

    const handleSearch = async () => {
        try {
        const res = await fetch(`http://${IP}/search?Input=${searchInput}`);
        const data = await res.json();
        if (data.success) {
            setPatients(data.RegisteredPatients);
            setCurrentPage(1);
        }
        } catch (err) {
        console.error("Error searching patients:", err);
        }
    };
    

  return (
    <div className="p-r-content">
        <div className="p-r-header">
          <div className="p-r-heading-inp">
            <h1>Patient Records</h1>
            <input type="text" 
                   placeholder="Search" 
                   value={searchInput}
                   onChange={(e) => setSearchInput(e.target.value)}
                   onKeyDown={(e) => e.key === "Enter" && handleSearch()}/>
          </div>
          
          <div className="p-r-tools">
            <button className="add-btn" 
                      onClick={() => navigate('/add-patient')}>
                      Add New Patient
            </button>
          </div>
        </div>
        <PrecTable patients={patients} currentPage={currentPage}/>
    </div>
  )
}

export default PrecHeader