import Navbar from "../../components/navigation bar/navbar";
import PrecHeader from "../../components/patient-records/PrecHeader/PrecHeader";
import "./patient_records_styles.css";

const PatientRecords = () => {
  return (
    <div className="records-container">
      <div className="p-r-navigation">
        <Navbar />
      </div>
        <PrecHeader/>
    </div>
  );
};

export default PatientRecords;
