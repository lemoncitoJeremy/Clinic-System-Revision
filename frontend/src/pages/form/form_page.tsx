import { useLocation ,useNavigate} from 'react-router-dom';
import { useEffect, useState } from "react";
import Navbar from '../../components/navigation bar/navbar';
import './form_styles.css';
import axios from 'axios';


const form_page = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { service, data } = location.state || {};
    const physicians = data?.physicians?.map((physician: { physician_name: string }) => physician.physician_name) || [];
    const exams = data?.service?.map((exam: { exam_name: string }) => exam.exam_name) || [];
    const [maxcaseId, setCaseId] = useState("");
    const [formValues, setFormValues] = useState({
        case_Id: "",
        firstname: "",
        middlename: "",
        lastname: "",
        birthdate: "",
        gender: "",
        email: "",
        phone: "",
        address: "",
        patientSource: "",
        requestingPhysician: "",
        requestDate: "",
        examType: "",
        serviceType: service || "",
        status: "Pending",
    });

    useEffect(() => {
        const fetchMaxCaseId = async () => {
        try {
            const response = await fetch(`http://localhost:3000/check-case?service=${service}`);
            const data = await response.json();

            if (data.success) {
            setCaseId(data.maxCaseId);
            setFormValues((prev) => ({ ...prev, case_Id: data.maxCaseId }));
            console.log("Fetched case ID:", data.maxCaseId);
            } else {
            console.error("Failed to fetch case ID");
            }
        } catch (error) {
            console.error("Error fetching case ID:", error);
        }
        };
        if(service){
        fetchMaxCaseId();
    }
    }, [service]);

    function handleInput(event: any) {
        setFormValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    }

    async function handleSubmit(event: any) {
        event.preventDefault();

        try {
            console.log("Submitting form with values:", formValues);
            const res = await axios.post("http://localhost:3000/create-case", {
                ...formValues
            });

            if (res.data.success) {
                alert("Case created successfully!");
                navigate("/services");
            } else {
                alert("Failed to create case.");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred while creating the case.");
        }
    }

    

  return (
    <div className="form-container">
        <div className="form-navigation-panel">
        <Navbar />
        </div>
        
        <form className="form-page" id="formPage" onSubmit={handleSubmit}>
            <div className='patient-info-heading'> 
                <h1>Patient Information</h1>
            </div>
            <div className='form-body'>
                <div className="left-section">
                    <div className="input-container" id="1">
                        <div className='info-field1'>
                            <label className="required">Firstname <input type='text' name="firstname" onChange={handleInput}/></label>
                            <label className="required">Middlename <input type='text' name="middlename" onChange={handleInput}/></label>
                            <label className="required">Lastname <input type='text' name="lastname" onChange={handleInput}/></label>
                        </div>
                        <div className='info-field2'>
                            <div className='case-number'>
                                <h3>Case ID: {maxcaseId || "Fetching..."}</h3>
                            </div>
                            <label className="required">Birthdate <input type='date' name="birthdate" onChange={handleInput}/></label>
                            <div className="gender-group">
                                <label>Gender</label>
                                <label>
                                <input type="radio" name="gender" value="Male" onChange={handleInput}/> Male
                                </label>
                                <label>
                                <input type="radio" name="gender" value="Female" onChange={handleInput}/> Female
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="input-container2" id="2">
                        <div className="row">
                            <label>
                            Email Address
                            <input type="email" name="email" onChange={handleInput}/>
                            </label>
                            <label>
                            Phone Number
                            <input type="tel" name="phone" onChange={handleInput} />
                            </label>
                        </div>
                        <div className="row full-width">
                            <label>
                            Address
                            <input type="text" name="address" onChange={handleInput}/>
                            </label>
                        </div>
                    </div>
                    
                </div>
                <div className="right-section">
                    <div className="input-container2" id="3">
                        <div className="row">
                            <label>
                            Patient Source
                            <select id="patient-source" name="patientSource" onChange={handleInput}>
                                <option value="" disabled selected hidden>-Select an Option-</option>
                                <option value="Walk-In">Walk-In</option>
                                <option value="Referral">Referral</option>
                            </select>
                            </label>
                            <label>
                            Requesting Physician
                            <select id="requesting-physician" name="requestingPhysician" onChange={handleInput}>
                                <option value="" disabled selected hidden>-Select an Option-</option>
                                {physicians.map((physician: string, idx: number) => (
                                <option key={idx} value={physician}>
                                    {physician}
                                </option>
                                ))}
                            </select>
                            </label>
                        </div>
                        <div className='row full-width'>
                            <label className="required">Date of Request <input type='date' name="requestDate" onChange={handleInput}/></label>
                        </div>
                        <label>
                        Select Type of Examination
                        <select id="type-of-examination" name="examType" defaultValue="" onChange={handleInput}>
                            <option value="" disabled hidden>-Select an Option-</option>
                            {exams.map((exam: string, idx: number) => (
                            <option key={idx} value={exam}>
                                {exam}
                            </option>
                            ))}
                        </select>
                        </label>
                    </div>
                    <div className="buttons">
                        <button type="submit" className="btn" id="submitButton">Submit</button>
                        <button type="button" className="btn" id="clearButton">Clear</button>
                        <button type="button" className="btn" id="cancelButton">Cancel</button>
                    </div>
                </div>
            </div>
        </form>
    </div>
  )
}

export default form_page
