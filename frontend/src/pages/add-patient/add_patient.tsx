import { useEffect, useState } from 'react'
import Navbar from '../../components/navigation bar/navbar'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './add_patient_styles.css'

const add_patient = () => {
    const navigate = useNavigate();
    const [maxPatientId, setPatientId] = useState("");
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
                const response = await fetch(`http://localhost:3000/check-patientId`);
                const data = await response.json();
    
                if (data.success) {
                setPatientId(data.maxPatientId);
                setFormValues((prev) => ({ ...prev, patient_Id: data.maxPatientId }));
                console.log("Fetched Patient ID:", data.maxPatientId);
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
            const res = await axios.post("http://localhost:3000/register-patient", {
                ...formValues
            });

            if (res.data.success) {
                alert("patient registered successfully!");
                navigate("/dashboard");
            } else {
                alert("Failed to register patient.");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred while creating the case.");
        }
    }

    
  return (
    <div className='patient-form-container'>
        <div className='add-patient-navigation-panel'>
            <Navbar/>
        </div>
        <div className='patient-form-section'>
            <div className="form-header">
                <h1>Add New Patient</h1>
                <div className="form-header-right">
                <span className="patient-id">Patient ID: {maxPatientId || "Fetching..."}</span>
                </div>
            </div>
            <form className="add-patient-form" id="add-patient" onSubmit={handleSubmit}>
                <h2>Patient Details</h2>
                <div className="form-grid">
                <label>
                    Name
                    <div className="name-fields">
                    <input type="text" name="firstname" placeholder="First name" onChange={handleInput}/>
                    <input type="text" name="middlename" placeholder="Middle name" onChange={handleInput}/>
                    <input type="text" name="lastname" placeholder="Last name" onChange={handleInput}/>
                    </div>
                </label>
                <label>
                    Mobile Number
                    <input type="tel" name="phone" onChange={handleInput}/>
                </label>
                <label>
                    Birthdate
                    <input type='date' name="birthdate" onChange={handleInput}/>
                </label>
                <label>
                    Email
                    <input type="email" name="email" placeholder="john.doe@example.com"onChange={handleInput}/>
                </label>
                <label>
                    Gender
                    <select name="gender" onChange={handleInput}>
                    <option value="" disabled selected>Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    </select>
                </label>
                 
                <label>
                    Address
                    <input type="text" name="address" onChange={handleInput}/>
                </label>
                
                </div>

                <div className="form-footer">
                <button type="button" className="btn-cancel">Cancel</button>
                <button type="submit" className="btn-save">Save</button>
                </div>
            </form>
        </div>
    </div>
  )
}

export default add_patient