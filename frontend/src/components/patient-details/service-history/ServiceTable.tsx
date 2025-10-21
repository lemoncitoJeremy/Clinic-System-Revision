import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
const IP = import.meta.env.VITE_SERVER_IP_ADD;

type Service = {
  case_id: string;
  exam_type:string;
  request_date: Date;
  requesting_physician: string;
  service_type:string;
  findings?: string;
  status:string;
  
};

type Props = {
  patientId: string;
};

const ServiceTable = ({ patientId }: Props) => {
    const navigate = useNavigate();
    const { id } = useParams(); 
    const [patientServices, setPatientServices] = useState<Service[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    const recordsPerPage = 3;
    const indexOfLastRecord = currentPage * recordsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    const currentRecords = patientServices.slice(indexOfFirstRecord, indexOfLastRecord);
    const totalPages = Math.ceil(patientServices.length / recordsPerPage);

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
  return (
    <div className="p-d-services">
        <div className="service-header">
            <h3>Service History</h3>
            <button className="p-deets-add-btn" 
                    onClick={()=>{AddPatientService(patientId)}}>
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
                        {s.request_date ? new Date(
                        s.request_date).toISOString().split("T")[0] : ""}
                    </td>
                    <td>{s.requesting_physician}</td>
                    <td>{s.service_type}</td>
                    <td>
                        <span 
                            className={`service-status-badge ${s.status.toLowerCase()}`}>
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
  )
}

export default ServiceTable