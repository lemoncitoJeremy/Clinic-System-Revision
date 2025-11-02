import { useParams } from "react-router-dom";
import Navbar from "../../components/navigation bar/navbar";
import "./service_record_styles.css";
import ServiceContent from "../../components/service-record/srvc-page-content/ServiceContent";

const ServiceRecord = () => {
  const { id } = useParams(); 
 return (
  <div className="s-r-container">
    <div className="s-r-navigation">
      <Navbar />
    </div>
    <ServiceContent id={id}/>
  </div>
)};
export default ServiceRecord;
