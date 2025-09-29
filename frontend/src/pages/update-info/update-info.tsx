
import Navbar from '../../components/navigation bar/Navbar';
import UpdateForm from '../../components/update-info/UpdateForm';
import { useParams } from 'react-router-dom';
import './update-info-styles.css'

const UpdatePatient = () => {
  const { id } = useParams();
  return (
    <div className="update-patient-form-container">
        <div className="update-patient-navigation-panel">
          <Navbar />
        </div>
        <UpdateForm id={id}/>
    </div>
  );
};

export default UpdatePatient;
