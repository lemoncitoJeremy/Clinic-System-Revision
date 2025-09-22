import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/navigation bar/navbar";
import "./add_service_styles.css";
import axios from "axios";

const IP = import.meta.env.VITE_SERVER_IP_ADD;

type Patient = {
  firstname: string;
  lastname: string;
  patient_id: string;
};

const AddService = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);

  const [case_Id, setCaseId] = useState("");
  const [request_Date, setRequestDate] = useState("");
  const [dropdownData, setDropdownData] = useState<any>(null);
  const [manualPhysician, setManualPhysician] = useState(false);

  const [formValues, setFormValues] = useState({
    case_Id: "",
    patientId: id || "",
    patientSource: "",
    requestingPhysician: "",
    requestDate: "",
    examType: "",
    serviceType: "",
    notes: "",
    status: "Pending",
  });

  const physicians = dropdownData?.physicians?.map((physician: { physician_name: string }) => physician.physician_name) || [];
  const exams = dropdownData?.service?.map((exam: { exam_name: string }) => exam.exam_name) || [];

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await fetch(`http://${IP}/patients/${id}`);
        const data = await res.json();
        if (data.success) {
          setPatient(data.RegisteredPatients);
          const today = new Date().toISOString().split("T")[0];
          setRequestDate(today)
          setFormValues((prev) => ({ ...prev, requestDate: today }));
        }
      } catch (err) {
        console.error("Error fetching patient:", err);
      }
    };
    fetchPatient();
  }, [id]);


  useEffect(() => {
    const fetchMaxCaseId = async () => {
      try {
        const response = await fetch(
          `http://${IP}/check-case?service=${formValues.serviceType}`
        );
        const data = await response.json();

        if (data.success) {
          setCaseId(data.maxCaseId);
          setFormValues((prev) => ({ ...prev, case_Id: data.maxCaseId }));
          handleDropdownData(formValues.serviceType);
        } else {
          console.error("Failed to fetch case ID");
        }
      } catch (error) {
        console.error("Error fetching case ID:", error);
      }
    };

    if (formValues.serviceType) {
      fetchMaxCaseId();
    }
  }, [formValues.serviceType]);


  const handleDropdownData = async (service:String) => {
        try {
        const res = await axios.get(`http://${IP}/selectService/${service}`);
        const data = res.data;
        setDropdownData(data);
        // navigate("/forms", { state: { service, data } });
        } catch (error) {
        console.error("Error fetching data:", error);
        }
  };
  
  const handleCancel = () => {
    navigate(`/patients/${id}`);
  };

  function handleInput (event: any) {
    setFormValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  async function handleSubmit(event: any) {
        event.preventDefault();
        console.log(formValues)
        try {
            const res = await axios.post(`http://${IP}/create-case`, {
                ...formValues
            });

            if (res.data.success) {
                alert("Case created successfully!");
                navigate(`/patients/${id}`);
            } else {
                alert("Failed to create case.");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred while creating the case.");
        }
    }

  if (!patient) return <p>Loading...</p>;

  return (
    <div className="add-service-container">

      <div className="add-s-navigation">
        <Navbar />
      </div>

      <div className="add-service-content">
        <div className="header">
          <h1>
            {patient.firstname} {patient.lastname}
          </h1>
          <p>Patient ID: {patient.patient_id}</p>
        </div>

        <h3>Add Service</h3>

        <div className="form-grid">
          <div className="form-left">
            <div className="form-section">
              <label>Select Service Type</label>
              <select
                name="serviceType"
                value={formValues.serviceType}
                onChange={handleInput}
              >
                <option value="">-- Select an Option --</option>
                <option value="xray">Xray</option>
                <option value="ultrasound">Ultrasound</option>
              </select>
            </div>

            <div className="form-section">
              <label>Case ID</label>
              <input type="text" name="case_id" value={case_Id} readOnly required/>
            </div>

            <div className="form-section">
              <label>Request Date</label>
              <input type="text" name="requestDate" value={request_Date} readOnly />
            </div>
          </div>

          <div className="form-right">
            <div className="form-section">
              <label>Type of Examination</label>
              <select
               name="examType" value={formValues.examType} onChange={handleInput}
              >
                <option value="" disabled hidden>-- Select an Option --</option>
                    {exams.map((exam: string, idx: number) => (
                    <option key={idx} value={exam}>
                        {exam}
                    </option>
                    ))}
              </select>
            </div>

            <div className="form-section">
              <label>Requesting Physician</label>
              <div className="physician-btn" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {!manualPhysician ? (
                  <select
                    name="requestingPhysician"
                    value={formValues.requestingPhysician}
                    onChange={handleInput}
                  >
                    <option value="" disabled hidden>
                      -- Select an Option --
                    </option>
                    {physicians.map((physician: string, idx: number) => (
                      <option key={idx} value={physician}>
                        {physician}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="requestingPhysician"
                    placeholder="Dr. "
                    value={formValues.requestingPhysician}
                    onChange={handleInput}
                  />
                )}

                <button
                  type="button"
                  onClick={() => {
                    setManualPhysician((prev) => !prev);
                    setFormValues((prev) => ({ ...prev, requestingPhysician: "" }));
                  }}
                  style={{
                    
                  }}
                >
                  {manualPhysician ? "-" : "+"}
                </button>
              </div>
          </div>

            <div className="form-section">
              <label>Patient Source</label>
              <select name="patientSource" value={formValues.patientSource} onChange={handleInput}>
                <option value="">-- Select an Option --</option>
                <option>Walk-In</option>
                <option>Referral</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section notes-section">
          <label>Notes</label>
          <textarea
            name="notes"
            value={formValues.notes}
            onChange={handleInput}
            placeholder="Enter a description..."
          />
        </div>

        <div className="buttons">
          <button className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button className="submit-btn" onClick={handleSubmit}>
            Add Service
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddService;
