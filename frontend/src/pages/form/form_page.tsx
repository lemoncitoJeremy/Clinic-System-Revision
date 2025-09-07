import { useLocation } from 'react-router-dom';
import { useEffect, useState } from "react";
import Navbar from '../../components/navigation bar/navbar';
import './form_styles.css';


const form_page = () => {
    const location = useLocation();
    const { service, data } = location.state || {};
    console.log(service, data)
    const physicians = data?.physicians?.map((physician: { physician_name: string }) => physician.physician_name) || [];
    const exams = data?.service?.map((exam: { exam_name: string }) => exam.exam_name) || [];
    console.log(physicians);
    console.log(exams);
    const [caseId, setCaseId] = useState("");
   

    useEffect(() => {
    const fetchMaxCaseId = async () => {
      try {
        const response = await fetch(`http://localhost:3000/check-case?service=${service}`);
        const data = await response.json();

        if (data.success) {
          setCaseId(data.maxCaseId);
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


  return (
    <div className="form-container">
        <div className="form-navigation-panel">
        <Navbar />
        </div>
        <form className="form-page" id="formPage">
            <div className="left-section">
                <div className="input-container" id="1">
                    <div className='info-field1'>
                        <label className="required">Firstname <input type='text'></input></label>
                        <label className="required">Middlename <input type='text'></input></label>
                        <label className="required">Lastname <input type='text'></input></label>
                    </div>
                    <div className='info-field2'>
                        <div className='case-number'>
                            <h3>Case ID: {caseId || "Fetching..."}</h3>
                        </div>
                        <label className="required">Birthdate <input type='date'/></label>
                        <div className="gender-group">
                            <label>Gender</label>
                            <label>
                            <input type="radio" name="gender" value="male" /> Male
                            </label>
                            <label>
                            <input type="radio" name="gender" value="female" /> Female
                            </label>
                        </div>
                    </div>
                </div>
                <div className="input-container2" id="2">
                    <div className="row">
                        <label>
                        Email Address
                        <input type="email" />
                        </label>
                        <label>
                        Phone Number
                        <input type="tel" />
                        </label>
                    </div>
                    <div className="row full-width">
                        <label>
                        Address
                        <input type="text" />
                        </label>
                    </div>
                </div>
                
            </div>
            <div className="right-section">
                <div className="input-container2" id="3">
                    <div className="row">
                        <label>
                        Patient Source
                        <select id="patient-source" name="source-options">
                            <option value="" disabled selected hidden>-Select an Option-</option>
                            <option value="Walk-In">Walk-In</option>
                            <option value="Referral">Referral</option>
                        </select>
                        </label>
                        <label>
                        Requesting Physician
                        <select id="requesting-physician" name="physician-options">
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
                        <label className="required">Date of Request <input type='date'/></label>
                    </div>
                    <label>
                    Select Type of Examination
                    <select id="type-of-examination" name="exam-options" defaultValue="">
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
                    <button type="button" className="btn" id="submitButton">Submit</button>
                    <button type="button" className="btn" id="clearButton">Clear</button>
                    <button type="button" className="btn" id="cancelButton">Cancel</button>
                </div>
            </div>
            
        </form>
    </div>
  )
}

export default form_page
