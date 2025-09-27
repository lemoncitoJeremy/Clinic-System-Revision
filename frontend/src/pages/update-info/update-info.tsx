import { useEffect, useState } from 'react';
import Navbar from '../../components/navigation bar/navbar';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './update-info-styles.css'

const IP = import.meta.env.VITE_SERVER_IP_ADD;

const UpdatePatient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formValues, setFormValues] = useState({
    patient_Id: "",
    firstname: "",
    middlename: "",
    lastname: "",
    birthdate: "",
    gender: "",
    email: "",
    phone: "",
    address: "",
  });
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPatient() {
      try {
        const res = await fetch(`http://${IP}/patients/${id}`);
        const data = await res.json();

        if (!data.success || !data.RegisteredPatients) {
          console.warn("No patient found for ID:", id);
          return;
        }

        const p = data.RegisteredPatients;
        setFormValues({
          patient_Id: p.patient_id,
          firstname: p.firstname,
          middlename: p.middlename,
          lastname: p.lastname,
          birthdate: p.birthdate ? p.birthdate.split("T")[0] : "",
          gender: p.gender,
          email: p.email_address === "N/A" ? "" : p.email_address,
          phone: p.mobile_number,
          address: p.address,
        });
      } catch (err) {
        console.error("Failed to fetch patient:", err);
      }
    }

    fetchPatient();
  }, [id]);

  function handleInput(event: any) {
    setFormValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event: any) {
    event.preventDefault();
    try {
      const res = await axios.put(`http://${IP}/update/patient/${id}`, {
        ...formValues,
      });

      if (res.data.success) {
        setModalMessage("Patient updated successfully!");
      } else {
        setModalMessage(res.data.message || "Failed to update patient.");
      }
    } catch (err) {
      console.error(err);
      setModalMessage("An error occurred while updating the patient.");
    }
  }

  function closeModal() {
    if (modalMessage === "Patient updated successfully!") {
      navigate(-1);
    }
    setModalMessage(null);
  }

  return (
    <div className="update-patient-form-container">
      <div className="update-patient-navigation-panel">
        <Navbar />
      </div>
      <div className="update-patient-form-section">
        <div className="update-form-header">
          <h1>Update Patient Information</h1>
          <div className="update-form-header-right">
            <span className="update-patient-id">Patient ID: {formValues.patient_Id}</span>
          </div>
        </div>
        <form
          className="update-patient-form"
          id="update-patient"
          onSubmit={handleSubmit}
        >
          <h2>Patient Details</h2>
          <div className="update-form-grid">
            <label>
              Name
              <div className="update-name-fields">
                <input
                  type="text"
                  name="firstname"
                  placeholder="First name"
                  value={formValues.firstname}
                  onChange={handleInput}
                  required
                />
                <input
                  type="text"
                  name="middlename"
                  placeholder="Middle name"
                  value={formValues.middlename}
                  onChange={handleInput}
                  required
                />
                <input
                  type="text"
                  name="lastname"
                  placeholder="Last name"
                  value={formValues.lastname}
                  onChange={handleInput}
                  required
                />
              </div>
            </label>
            <label>
              Mobile Number
              <input
                type="tel"
                name="phone"
                value={formValues.phone}
                onChange={handleInput}
                required
              />
            </label>
            <label>
              Birthdate
              <input
                type="date"
                name="birthdate"
                value={formValues.birthdate}
                onChange={handleInput}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                name="email"
                placeholder="john.doe@example.com"
                value={formValues.email}
                onChange={handleInput}
              />
            </label>
            <label>
              Gender
              <select
                name="gender"
                value={formValues.gender}
                onChange={handleInput}
                required
              >
                <option value="" disabled>
                  Select
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>
            <label>
              Address
              <input
                type="text"
                name="address"
                value={formValues.address}
                onChange={handleInput}
                required
              />
            </label>
          </div>

          <div className="update-form-footer">
            <button
              type="button"
              className="update-btn-cancel"
              onClick={() => {
                navigate(-1);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="update-btn-save">
              Save
            </button>
          </div>
        </form>
      </div>
      {modalMessage && (
        <div className="update-modal-overlay">
          <div className="update-modal-box">
            <p>{modalMessage}</p>
            <button onClick={closeModal}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdatePatient;
