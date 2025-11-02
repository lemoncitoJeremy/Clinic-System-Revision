import Navbar from "../../components/navigation bar/navbar";
import PatientInfo from "../../components/patient-details/patient-info/PatientInfo";
import "./patient_details_styles.css";

const PatientDetails = () => {
  
  return (
    <div className="p-d-container">
      <div className="p-d-navigation">
        <Navbar />
      </div>
        <PatientInfo/>
    </div>
  );
};

export default PatientDetails;
