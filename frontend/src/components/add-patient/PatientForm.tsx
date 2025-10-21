import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const IP = import.meta.env.VITE_SERVER_IP_ADD;

const patientForm = () => {
    const navigate = useNavigate();
    const [maxPatientId, setPatientId] = useState("");
    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [formValues, setFormValues] = useState({
            patient_Id: "",
            firstname: "",
            middlename: "",
            lastname: "",
            birthdate: "",
            gender: "",
            email: "",
            phone: "",
            address: "",
        });

    useEffect(() => {
        const fetchMaxPatientId = async () => {
        try {
            const response = await fetch(`http://${IP}/check-patientId`);
            const data = await response.json();
    
            if (data.success) {
            setPatientId(data.maxPatientId);
            setFormValues((prev) => ({ ...prev, patient_Id: data.maxPatientId }));
            } else {
            console.error("Failed to fetch Patient ID");
            }
        } catch (error) {
            console.error("Error fetching Patient ID:", error);
        }
        };
        fetchMaxPatientId();
    }, []);

    function handleInput(event: any) {
        setFormValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    }

    async function handleSubmit(event: any) {
        event.preventDefault();

        try {
            const res = await axios.post(`http://${IP}/register-patient`, {
                ...formValues
            });

            if (res.data.success) {
                setModalMessage("Patient registered successfully!");
            } else if (res.data.data) {
                const existing = res.data.data;
                setModalMessage(`Patient already exists: ${existing.patient_id}`);
            } else {
                setModalMessage(res.data.message || "Failed to register patient.");
            }
        } catch (err) {
            console.error(err);
            setModalMessage("An error occurred while registering the patient.");
        }
    }

    function closeModal() {
        if (modalMessage === "Patient registered successfully!") {
            navigate("/dashboard");
        }
        setModalMessage(null);
    }
    
  return (
    <>
        <div className='patient-form-section'>
            <div className="form-header">
                <h1>Add New Patient</h1>
                <div className="form-header-right">
                    <span className="patient-id">
                        Patient ID: {maxPatientId || "Fetching..."}
                    </span>
                </div>
            </div>
            <form className="add-patient-form" id="add-patient" onSubmit={handleSubmit}>
                <h2>Patient Details</h2>
                <div className="form-grid">
                <label>
                    Name
                    <div className="name-fields">
                    <input 
                        type="text" 
                        name="firstname" 
                        placeholder="First name" 
                        onChange={handleInput} 
                        required/>
                    <input 
                        type="text" 
                        name="middlename" 
                        placeholder="Middle name" 
                        onChange={handleInput} 
                        required/>
                    <input 
                        type="text" 
                        name="lastname" 
                        placeholder="Last name" 
                        onChange={handleInput} 
                        required/>
                    </div>
                </label>
                <label>
                    Mobile Number
                    <input 
                        type="tel" 
                        name="phone" 
                        onChange={handleInput} 
                        required/>
                </label>
                <label>
                    Birthdate
                    <input 
                        type='date' 
                        name="birthdate" 
                        onChange={handleInput} 
                        required/>
                </label>
                <label>
                    Email
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="john.doe@example.com"
                        onChange={handleInput}/>
                </label>
                <label>
                    Gender
                    <select name="gender" onChange={handleInput} required>
                        <option value="" disabled selected>Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </label>
                    
                <label>
                    Address
                    <input type="text" name="address" onChange={handleInput} required/>
                </label>
                
                </div>

                <div className="form-footer">
                    <button 
                        type="button" 
                        className="btn-cancel" 
                        onClick={()=>{navigate(-1)}}>
                            Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="btn-save">
                            Save
                    </button>
                </div>
            </form>
        </div>
        {modalMessage && (
            <div className="modal-overlay">
                <div className="modal-box">
                    <p>{modalMessage}</p>
                    <button onClick={closeModal}>OK</button>
                </div>
            </div>
        )}
    </>
  )
}

export default patientForm