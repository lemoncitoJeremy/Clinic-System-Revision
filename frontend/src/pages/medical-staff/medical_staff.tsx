import './medicalStaffStyles.css'
import Navbar from '../../components/navigation bar/navbar'
import StaffForm from '../../components/add-med-staff/StaffForm'

const medical_staff = () => {
  return (
    <div className='staff-form-container'>
        <div className="med-staff-navigation">
          <Navbar />
        </div>
        <StaffForm/>
    </div>
  )
}

export default medical_staff