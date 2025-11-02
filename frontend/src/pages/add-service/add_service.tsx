import Navbar from "../../components/navigation bar/navbar";
import ServiceForm from "../../components/add-service/ServiceForm";
import "./add_service_styles.css";

const AddService = () => {
  return (
    <div className="add-service-container">
      <div className="add-s-navigation">
        <Navbar />
      </div>
        <ServiceForm/>
    </div>
  );
};

export default AddService;
