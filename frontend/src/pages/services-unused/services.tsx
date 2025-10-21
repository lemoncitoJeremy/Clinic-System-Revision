import Navbar from "../../components/navigation bar/Navbar"
import "./services_styles.css"
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const IP = import.meta.env.VITE_SERVER_IP_ADD;

const services = () => {
  const navigate = useNavigate();

  const handleClick = async (service:String) => {
        try {
        const res = await axios.get(`http://${IP}/selectService/${service}`);
        const data = res.data;
        navigate("/forms", { state: { service, data } });
        } catch (error) {
        console.error("Error fetching data:", error);
        }
  };

  return (
    <div className="services-container">
        <div className="form-navigation-panel">
        <Navbar />
        </div>
        <div className="list-services">
            <button className="xray" onClick= {()=>handleClick("xray")}> XRAY </button>
            <button className="ultra-sound" onClick= {()=>handleClick("ultrasound")}> ULTRASOUND </button>
        </div>
    </div>
  )
}

export default services