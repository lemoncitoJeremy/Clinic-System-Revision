import { useNavigate, useParams } from "react-router-dom";
import ServiceTable from "../service-history/ServiceTable"
import { useEffect, useState } from "react";
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

const PatientInfo = () => {
    const navigate = useNavigate();
    const { id } = useParams(); 
    const [patient, setPatient] = useState<Patient | null>(null);

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

    const HandleUpdateInfo = (id: string) =>{
        navigate(`/patients/update-info/${id}`);
    }

    if (!patient) return <p>Loading...</p>;

  return (
    <div className="p-d-content">
        <div className="p-d-header">
            <h1>Patient Details</h1>
            <button className="update-btn" 
                    onClick={() => HandleUpdateInfo(patient.patient_id)}>
                    Update Information
            </button>
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
        
        <ServiceTable patientId={patient.patient_id}/>

    </div>
  )
}

export default PatientInfo