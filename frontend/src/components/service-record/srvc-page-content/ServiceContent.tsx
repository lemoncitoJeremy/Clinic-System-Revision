import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import ServiceDtls from "../service-details/ServiceDtls";
import UploadExport from "../upload-export/UploadExport";
import ArrowDown from "../../../assets/ArrowDown.png";

const IP = import.meta.env.VITE_SERVER_IP_ADD;

type Props = { id: string | undefined };

type Case = {
  patient_id: string;
  patient_source: string;
  request_date: Date;
  exam_type: string;
  service_type: string;
  requesting_physician: string;
  notes: string;
};

type CaseStatus = { case_status: string | null };

const ServiceContent = ({ id }: Props) => {
    const navigate = useNavigate();
    const [patient, setPatient] = useState<Case | null>(null);
    const [caseStatus, setCaseStatus] = useState<CaseStatus | null>(null);
    const [radiology, setRadiology] = useState<any>(null);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    useEffect(() => {
        const fetchPatientbyId = async () => {
        try {
            const res = await fetch(`http://${IP}/patients/${id}/s-rec`);
            const data = await res.json();
            if (data.success) setPatient(data.RegisteredPatients);
        } catch (err) {
            console.error("Error fetching patient:", err);
        }
        };
        if (id) fetchPatientbyId();
    }, [id]);

    useEffect(() => {
        const checkCaseStatus = async () => {
        try {
            const res = await fetch(`http://${IP}/patients/${id}/cases/status`);
            const data = await res.json();
            if (data.success) setCaseStatus({ case_status: data.case_status });
        } catch (err) {
            console.error("Error checking case status:", err);
        }
        };
        if (id) checkCaseStatus();
    }, [id]);

    useEffect(() => {
        if (!isDropdownOpen) return;
        const handleDropdownData = async () => {
        try {
            const res = await axios.get(`http://${IP}/radiology`);
            setRadiology(res.data);
        } catch (error) {
            console.error("Error fetching radiology:", error);
        }
        };
        handleDropdownData();
    }, [isDropdownOpen]);

    async function handleCancelRequest() {
        try {
        const res = await axios.post(`http://${IP}/patients/${id}/cases/status-update`, {
            case_Id: id,
            status: "Cancelled",
        });
        setModalMessage(res.data.success
            ? "Request has been cancelled successfully!"
            : "Failed to cancel the request."
        );
        } catch (err) {
        console.error("Error cancelling request:", err);
        setModalMessage("An error occurred while cancelling the request.");
        }
        setShowCancelConfirm(false);
    }

    function closeModal() {
        if (
        modalMessage === "Findings uploaded successfully!" ||
        modalMessage === "Request has been cancelled successfully!"
        ) {
        navigate(`/patients/${patient?.patient_id}`);
        }
        setModalMessage(null);
    }

  return (
    <div className="s-r-content">
      <div className="record-header">
        <h1>Service Record</h1>
        <span className="patient-id">Patient ID: {patient?.patient_id}</span>
      </div>

      <ServiceDtls
        id={id}
        patient={patient}
        caseStatus={caseStatus}
        onCancel={() => setShowCancelConfirm(true)}/>

      <UploadExport
        id={id}
        caseStatus={caseStatus}
        radiology={radiology}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        setModalMessage={setModalMessage}/>

      {caseStatus?.case_status === "Done" && (
        <div className="findings">
          <div  
            className="findings-header"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <h3>Export PDF</h3>
                <span className={`arrow ${isDropdownOpen ? "open" : ""}`}>
                <img src={ArrowDown} alt="Expand" />
                </span>
          </div>

          {isDropdownOpen && (
            <div className="file-export">
                <p className="file-label">Case Report Export File:</p>
                <a
                    className="file-link"
                    href={`http://${IP}/reports/${id}_report.pdf`}
                    target="_blank"
                    rel="noopener noreferrer">
                    {id}_Report.pdf
                </a>
            </div>
          )}
        </div>
      )}

      {showCancelConfirm && (
        <div className="cancel-modal-overlay">
            <div className="cancel-modal-box">
                <h3>Cancel Service Request</h3>
                <p>Are you sure you want to cancel this request?</p>
                <p><strong>Patient:</strong> {patient?.patient_id}</p>
                <p><strong>Case ID:</strong> {id}</p>
                <p><strong>Service Type:</strong> {patient?.service_type}</p>
                <div className="cancel-modal-actions">
                    <button 
                        className="cancel-btn" 
                        onClick={handleCancelRequest}>
                            Yes Cancel
                    </button>
                    <button 
                        className="keep-btn" 
                        onClick={() => setShowCancelConfirm(false)}>
                            Keep Request
                    </button>
                </div>
            </div>
        </div>
      )}

      {modalMessage && (
        <div className="modal-overlay">
          <div className="modal-box">
            <p>{modalMessage}</p>
            <button onClick={closeModal}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceContent;
