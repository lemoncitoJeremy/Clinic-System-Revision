import { useEffect, useState } from "react";
import Navbar from "../../components/navigation bar/navbar";
import PenIcon from "../../assets/Pen.png";
import "./patient_records_styles.css";
import { useNavigate } from "react-router-dom";

type Patient = {
  firstname?: string;
  middlename?: string;
  lastname?: string;
  birthdate: Date;
  gender: string;
  patient_id: string;
};

const PatientRecords = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegisteredPatients = async () => {
      try {
        const res = await fetch("http://localhost:3000/patients");
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

  const goToDetails = (id: string) => {
    navigate(`/patients/${id}`); 
  };
  
  return (
    <div className="records-container">
      <div className="p-r-navigation">
        <Navbar />
      </div>
      <div className="p-r-content">
        <div className="p-r-header">
          <h1>Patient Records</h1>
          <div className="p-r-tools">
            <input type="text" placeholder="Search"></input>
            <button className="add-btn" onClick={()=>{navigate('/add-patient')}}>+ Add New Patient</button>
          </div>
        </div>

        <div className="p-r-table">
          <table>
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>birthdate</th>
                <th>Gender</th>
                <th>Patient ID</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p, idx) => (
                <tr key={idx}>
                  <td>{`${p.firstname} ${p.middlename || ""}, ${p.lastname}`}</td>
                  <td>{p.birthdate instanceof Date ? p.birthdate.toLocaleDateString() : new Date(p.birthdate).toLocaleDateString()}</td>
                  <td>{p.gender}</td>
                  <td>{p.patient_id}</td>
                  <td>
                    <button className="edit-btn"
                      onClick={() => goToDetails(p.patient_id)}><img src={PenIcon} alt="Logout" className="nav-" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-r-pagination">
            <button>{'<'}</button>
            <button>{'>'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientRecords;
