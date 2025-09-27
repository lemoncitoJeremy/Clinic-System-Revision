import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/navigation bar/navbar";
import "./service_record_styles.css";
import ArrowDown from '../../assets/ArrowDown.png'
import { useEffect, useState } from "react";
import axios from "axios";

const IP = import.meta.env.VITE_SERVER_IP_ADD;

type Case = {
  patient_id: string;
  patient_source: string;
  request_date: Date;
  exam_type: string;
  service_type: string;
  requesting_physician: string;
  notes: string;
};

type CaseStatus = {
  case_status: string | null;
}

const ServiceRecord = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    case_Id: id || "",
    radiologist: "",
    radio_technologist: "",
    radiographic_findings:"",
    radiographic_impressions:"",
    status: 'Done'
  });

  const [radiology, setRadiology] = useState<any>(null);
  const [patient, setPatient] = useState<Case | null>(null);
  const [caseStatus, setCaseStatus] = useState<CaseStatus | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
          const fetchPatientbyId = async () => {
          try {
              const res = await fetch(`http://${IP}/patients/${id}/s-rec`);
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
    const checkCaseStatus = async () => {
      try {
        const res = await fetch(`http://${IP}/patients/${id}/cases/status`);
        const data = await res.json();
        if (data.success) {
          setCaseStatus({ case_status: data.case_status });

        }
      } catch (err) {
        console.error("Error checking case status:", err);
      }
    };
    checkCaseStatus();
  }, [id]);


  useEffect(() => {
  if (isDropdownOpen) {
      handleDropdownData();
    }
  }, [isDropdownOpen]);

  const handleDropdownData = async () => {
        try {
        const res = await axios.get(`http://${IP}/radiology`);
        const data = res.data;
        setRadiology(data);
        } catch (error) {
        console.error("Error fetching data:", error);
        }
  };

  async function handleSubmit(event: any) {
        event.preventDefault();
        try {
            const res = await axios.post(`http://${IP}/upload/findings`, {
                ...formValues
            });

            if (res.data.success) {
                setModalMessage("Findings uploaded successfully!");
                
            } else {
                setModalMessage("Failed to Upload Findings.");
            }
        } catch (err) {
            console.error(err);
            setModalMessage("An error occurred while Uploading the Findings.");
        }
    }

  const handleInput = (event: any) => {
    setFormValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  async function handleCancelRequest() {
    try {
      const res = await axios.post(`http://${IP}/patients/${id}/cases/status-update`, {
        case_Id: id,
        status: "Cancelled",
      });

      if (res.data.success) {
        setModalMessage("Request has been cancelled successfully!");
      } else {
        setModalMessage("Failed to cancel the request.");
      }
    } catch (err) {
      console.error("Error cancelling request:", err);
      setModalMessage("An error occurred while cancelling the request.");
    }
    setShowCancelConfirm(false);
  }

  function closeModal() {
        if (modalMessage === "Findings uploaded successfully!" ||
            modalMessage === "Request has been cancelled successfully!") {
            navigate(`/patients/${patient?.patient_id}`);
        }
        setModalMessage(null);
    }
    
  const requestDate = patient?.request_date ? new Date(patient.request_date).toLocaleDateString() : ""  
  const Radiologist = radiology?.radiologist?.map((radiologist: { radiologist_name: string }) => 
                      radiologist.radiologist_name) || [];
  const RadioTech = radiology?.radiotech?.map((radio_technologist: { radio_tech_name: string }) => 
                    radio_technologist.radio_tech_name) || [];

 return (
  <div className="s-r-container">
    <div className="s-r-navigation">
      <Navbar />
    </div>

    <div className="s-r-content">
      <div className="record-header">
        <h1>Service Record</h1>
        <span className="patient-id">Patient ID: {patient?.patient_id}</span>
      </div>

      <section className="service-request">
        <div className="service-request-header">
          <h3>Service Request</h3>
          {caseStatus?.case_status !== "Done" && caseStatus?.case_status !== "Cancelled" && (
            <button
              className="cancel-request-btn"
              onClick={() => setShowCancelConfirm(true)}
            >
              Cancel Request
            </button>
          )}
        </div>

        <table className="request-table">
          <tbody>
            <tr>
              <td>Case ID:</td>
              <td>{id}</td>
            </tr>
            <tr>
              <td>Source:</td>
              <td>{patient?.patient_source}</td>
            </tr>
            <tr>
              <td>Exam Type:</td>
              <td>{patient?.exam_type}</td>
            </tr>
            <tr>
              <td>Date of Request:</td>
              <td>{requestDate}</td>
            </tr>
            <tr>
              <td>Service Type:</td>
              <td>{patient?.service_type}</td>
            </tr>
            <tr>
              <td>Requesting Physician:</td>
              <td>{patient?.requesting_physician}</td>
            </tr>
            <tr>
              <td>Notes:</td>
              <td>{patient?.notes}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {caseStatus?.case_status !== "Done" && caseStatus?.case_status !== "Cancelled" && (
        <div className="findings">
          <div
            className="findings-header"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <h3>Upload Findings</h3>
            <span className={`arrow ${isDropdownOpen ? "open" : ""}`}>
              <img src={ArrowDown} alt="Edit" />
            </span>
          </div>

          {isDropdownOpen && (
            <form className="findings-form" onSubmit={handleSubmit}>
              <div className="s-r-form-section">
                <label>Select Radiologist</label>
                <select
                  name="radiologist"
                  value={formValues.radiologist}
                  onChange={handleInput}
                  required
                >
                  <option value="">-- Select an Option --</option>
                  {Radiologist.map((r: string, idx: number) => (
                    <option key={idx} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="s-r-form-section">
                <label>Select Radio Technologist</label>
                <select
                  name="radio_technologist"
                  value={formValues.radio_technologist}
                  onChange={handleInput}
                  required
                >
                  <option value="">-- Select an Option --</option>
                  {RadioTech.map((t: any, idx: number) => (
                    <option key={idx} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="s-r-form-section notes-section">
                <label>Radiographic Findings</label>
                <textarea
                  name="radiographic_findings"
                  value={formValues.radiographic_findings}
                  onChange={handleInput}
                  placeholder="Enter a description..."
                  required
                />
              </div>

              <div className="s-r-form-section notes-section">
                <label>Radiographic Impressions</label>
                <textarea
                  name="radiographic_impressions"
                  value={formValues.radiographic_impressions}
                  onChange={handleInput}
                  placeholder="Enter a description..."
                  required
                />
              </div>

              <div className="btns">
                <button
                  type="button"
                  className="back-btn"
                  onClick={() => navigate(-1)}
                >
                  Back to Patient Record
                </button>
                <button type="submit" className="back-btn">
                  Save Findings
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {caseStatus?.case_status === "Done" && (
        <div className="findings">
          <div
            className="findings-header"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
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
                rel="noopener noreferrer"
              >
                {id}_Report.pdf
              </a>
            </div>
          )}
        </div>
      )}
    </div>

    {showCancelConfirm && (
      <div className="cancel-modal-overlay">
        <div className="cancel-modal-box">
          <h3>Cancel Service Request</h3>
          <p>Are you sure you want to cancel this request?</p>
          <p><strong>Patient:</strong> {patient?.patient_id}</p>
          <p><strong>Case ID:</strong> {id}</p>
          <p><strong>Service Type:</strong> {patient?.service_type}</p>
          <div className="cancel-modal-actions">
            <button className="cancel-btn" onClick={handleCancelRequest}>Yes Cancel</button>
            <button className="keep-btn" onClick={() => setShowCancelConfirm(false)}>Keep Request</button>
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
)};


export default ServiceRecord;
