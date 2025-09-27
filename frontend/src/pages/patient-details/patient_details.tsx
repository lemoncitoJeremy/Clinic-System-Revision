import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/navigation bar/navbar";
import "./patient_details_styles.css";

const IP = import.meta.env.VITE_SERVER_IP_ADD;

type Patient = {
  firstname: string;
  middlename: string;
  lastname: string;
  patient_id: string;
  birthdate: Date;
  gender: string;
  address: string;
  mobile_number: string;
  email_address: string;
};

type Service = {
  case_id: string;
  exam_type:string;
  request_date: Date;
  requesting_physician: string;
  service_type:string;
  findings?: string;
  status:string;
  
};

const PatientDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const [patient, setPatient] = useState<Patient | null>(null);
  const [patientServices, setPatientServices] = useState<Service[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 3;

  useEffect(() => {
      const fetchPatientbyId = async () => {
      try {
          const res = await fetch(`http://${IP}/patients/${id}`);
          const data = await res.json();
          if (data.success) {
          setPatient(data.RegisteredPatients);
          }
      } catch (err) {
          console.error("Error fetching patients:", err);
      }
      };
      fetchPatientbyId();
  }, [id]);

  useEffect(() => {
      const GetPatientCases = async () => {
      try {
          const res = await fetch(`http://${IP}/patients/${id}/cases`);
          const data = await res.json();
          if (data.success) {
          setPatientServices(data.PatientCases);
          }
      } catch (err) {
          console.error("Error fetching patients:", err);
      }
      };
      GetPatientCases();
  }, [id]);

  const AddPatientService = (id: string) => {
    navigate(`/patients/add-service/${id}`); 
  };

  const HandleViewReport = (id: string) => {
    navigate(`/patients/reports/${id}`);
  }

  const HandleUpdateInfo = (id: string) =>{
     navigate(`/patients/update-info/${id}`);
  }


  if (!patient) return <p>Loading...</p>;

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = patientServices.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(patientServices.length / recordsPerPage);

  return (
    <div className="p-d-container">
      <div className="p-d-navigation">
        <Navbar />
      </div>

      <div className="p-d-content">
        <div className="p-d-header">
          <h1>Patient Details</h1>
          <button className="update-btn" 
                  onClick={() => HandleUpdateInfo(patient.patient_id)}>
                  Update Information</button>
        </div>

        <div className="p-d-details">
          <h2>{`${patient.lastname}, ${patient.firstname} ${patient.middlename}`}</h2>
          <p><strong>Patient ID:</strong> {patient.patient_id}</p>
          <p><strong>Birthdate:</strong> {patient.birthdate
            ? new Date(patient.birthdate).toISOString().split("T")[0]
            : ""}</p>
          <p><strong>Gender:</strong> {patient.gender}</p>
          <p><strong>Address:</strong> {patient.address}</p>
          <p><strong>Mobile Number:</strong> {patient.mobile_number}</p>
          <p><strong>Email:</strong> {patient.email_address}</p>
        </div>

        <div className="p-d-services">
          <div className="service-header">
            <h3>Service History</h3>
            <button className="p-deets-add-btn" 
                    onClick={()=>{AddPatientService(patient.patient_id)}}>
                    Add New Service
            </button>
          </div>

          <div className="service-table">
            <table>
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Exam Type</th>
                  <th>Request Date</th>
                  <th>Physician</th>
                  <th>Service Type</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((s, idx) => (
                  <tr key={idx}>
                    <td>{s.case_id}</td>
                    <td>{s.exam_type}</td>
                    <td>
                      {s.request_date ? new Date(s.request_date).toISOString().split("T")[0] : ""}
                    </td>
                    <td>{s.requesting_physician}</td>
                    <td>{s.service_type}</td>
                    <td>
                      <span className={`service-status-badge ${s.status.toLowerCase()}`}>
                          {s.status}
                      </span>
                    </td>
                    <td>
                        <a onClick={()=>{HandleViewReport(s.case_id)}} 
                        className="view-report">
                        View Report</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}>
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
              disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
