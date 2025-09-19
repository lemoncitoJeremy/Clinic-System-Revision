import { useEffect, useState } from "react";
import Navbar from "../../components/navigation bar/navbar";
import PenIcon from "../../assets/Pen.png";
import "./patient_records_styles.css";
import { useNavigate } from "react-router-dom";

type Patient = {
  firstname?: string;
  middlename?: string;
  lastname?: string;
  birthdate: Date;
  gender: string;
  patient_id: string;
};

const PatientRecords = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const recordsPerPage = 8;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegisteredPatients = async () => {
      try {
        const res = await fetch("http://localhost:3000/patients");
        const data = await res.json();
        if (data.success) {
          setPatients(data.RegisteredPatients);
        }
      } catch (err) {
        console.error("Error fetching patients:", err);
      }
    };
    fetchRegisteredPatients();
  }, []);

  const goToDetails = (id: string) => {
    navigate(`/patients/${id}`); 
  };

  // Pagination logic
  const totalPages = Math.ceil(patients.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedPatients = patients.slice(startIndex, startIndex + recordsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  return (
    <div className="records-container">
      <div className="p-r-navigation">
        <Navbar />
      </div>
      <div className="p-r-content">
        <div className="p-r-header">
          <h1>Patient Records</h1>
          <div className="p-r-tools">
            <input type="text" placeholder="Search"></input>
            <button className="add-btn" onClick={() => navigate('/add-patient')}>+ Add New Patient</button>
          </div>
        </div>

        <div className="p-r-table">
          <table>
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Birthdate</th>
                <th>Gender</th>
                <th>Patient ID</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginatedPatients.length > 0 ? (
                paginatedPatients.map((p) => (
                  <tr key={p.patient_id}>
                    <td>{`${p.firstname || ""} ${p.middlename || ""} ${p.lastname || ""}`}</td>
                    <td>
                      {p.birthdate
                        ? new Date(p.birthdate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>{p.gender}</td>
                    <td>{p.patient_id}</td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => goToDetails(p.patient_id)}
                      >
                        <img src={PenIcon} alt="Edit" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>No patients found.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination controls */}
          {patients.length > recordsPerPage && (
            <div className="p-r-pagination">
              <button onClick={handlePrev} disabled={currentPage === 1}>
                Prev
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button onClick={handleNext} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientRecords;
