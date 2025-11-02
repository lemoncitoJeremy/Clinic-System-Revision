import Navbar from '../../components/navigation bar/navbar'
import PatientForm from '../../components/add-patient/PatientForm'
import './add_patient_styles.css'

const add_patient = () => {
    
  return (
    <div className='patient-form-container'>
        <div className='add-patient-navigation-panel'>
            <Navbar/>
        </div>
        <PatientForm/>
    </div>
  )
}

export default add_patient