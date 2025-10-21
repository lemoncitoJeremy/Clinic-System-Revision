import { useEffect, useState } from "react";
import PenIcon from "../../../assets/Pen.png";
import { useNavigate } from "react-router-dom";

type Patient = {
  firstname?: string;
  middlename?: string;
  lastname?: string;
  birthdate: Date;
  gender: string;
  patient_id: string;
};

type Props = {
    patients: Patient[];
    currentPage: number;

}
const PrecTable = ({patients, currentPage}: Props) => {
    const navigate = useNavigate();
    const [currPage, setCurrentPage] = useState<number>(1);
    const recordsPerPage = 8;
    const totalPages = Math.ceil(patients.length / recordsPerPage);
    const startIndex = (currPage - 1) * recordsPerPage;
    const paginatedPatients = patients.slice(startIndex, startIndex + recordsPerPage);
    
    useEffect(() => {
        setCurrentPage(currentPage);
    }, [currentPage]);

    const handlePrev = () => {
        if (currPage > 1) setCurrentPage(prev => prev - 1);
    };

    const handleNext = () => {
        if (currPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const goToDetails = (id: string) => {
        navigate(`/patients/${id}`); 
    };

  return (
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
                        <td>
                            {`${p.lastname || ""}, ${p.firstname || ""} 
                            ${p.middlename || ""}`}
                        </td>
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
        
        {patients.length > recordsPerPage && (
            <div className="p-r-pagination">
                <button onClick={handlePrev} disabled={currPage === 1}>
                    Previous
                </button>
                <span>
                    Page {currPage} of {totalPages}
                </span>
                <button onClick={handleNext} disabled={currPage === totalPages}>
                    Next
                </button>
            </div>
        )}
    </div>
  )
}

export default PrecTable