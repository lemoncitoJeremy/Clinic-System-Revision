import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const IP = import.meta.env.VITE_SERVER_IP_ADD;

const StaffForm = () => {
    const navigate = useNavigate();
    const [modalMessage, setModalMessage] = useState<string | null>(null);

    const [formValues, setFormValues] = useState({
        role: "",
        credentials: "",
        name: "",
    });

    function handleInput(event: any) {
        setFormValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    }

    async function handleSubmit(event: any) {
        event.preventDefault();

        try {
            const res = await axios.post(`http://${IP}/register-staff`, {
                ...formValues
            });

            if (res.data.success) {
                setModalMessage("Staff registered successfully!");
            } else {
                setModalMessage(res.data.message || "Failed to register staff.");
            }
        } catch (err) {
            console.error(err);
            setModalMessage("An error occurred while registering staff.");
        }
    }

    function closeModal() {
        if (modalMessage === "Staff registered successfully!") {
            navigate("/dashboard");
        }
        setModalMessage(null);
    }

    return (
        <>
            <div className='staff-form-section'>
                <div className="form-header">
                    <h1>Add New Staff</h1>
                </div>

                <form className="add-staff-form" onSubmit={handleSubmit}>
                    <h2>New Staff Details</h2>

                    <div className="staff-form-grid">

                        {/* ROLE SELECTION */}
                        <label>
                            Staff Role
                            <select name="role" onChange={handleInput} required>
                                <option value="">Select Staff Role</option>
                                <option value="Physician">Physician</option>
                                <option value="Radiologist">Radiologist</option>
                                <option value="Technologist">Technologist</option>
                            </select>
                        </label>

                        {/* CREDENTIALS */}
                        <label>
                            Medical Credentials
                            <input
                                type="text"
                                name="credentials"
                                placeholder="e.g. MD, RT(R), DO"
                                onChange={handleInput}
                                required
                            />
                        </label>

                        {/* NAME */}
                        <label className="full-width">
                            Name
                            <input
                                type="text"
                                name="name"
                                placeholder="Dr. "
                                onChange={handleInput}
                                required
                            />
                        </label>
                    </div>

                    <div className="staff-form-footer">
                        <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>Cancel</button>
                        <button type="submit" className="btn-save">Save</button>
                    </div>
                </form>
            </div>

            {modalMessage && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <p>{modalMessage}</p>
                        <button onClick={closeModal}>OK</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default StaffForm;
