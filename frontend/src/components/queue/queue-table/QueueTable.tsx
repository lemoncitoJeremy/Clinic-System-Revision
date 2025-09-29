import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import ArrowIcon from "../../../assets/Arrow.png"
const IP = import.meta.env.VITE_SERVER_IP_ADD;

type QueuedCase = {
    case_id: string;
    firstname: string;
    middlename: string;
    lastname: string;
    requesting_physician: string;
    service_type: string;
    status: string;
    request_date: Date;
};


const QueueTable = () => {
    const res_dict = sessionStorage.getItem('user');
    const user_session_data = res_dict ? JSON.parse(res_dict)["data"] : null;
    const navigate = useNavigate();
    const [queuedCases, setQueuedCases] = useState<QueuedCase[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const rowsPerPage = 8;
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = queuedCases.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(queuedCases.length / rowsPerPage);

    useEffect(() => {
        const fetchQueuedCases = async () => {
        try {
            const res = await fetch(`http://${IP}/queued-cases`);
            const data = await res.json();
            if (data.success) {
            setQueuedCases(data.queuedCases);
            }
        } catch (err) {
            console.error("Error fetching queued cases:", err);
        }
        };
        fetchQueuedCases();
    }, []);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handleRowClick = (caseId: string) => {
        navigate(`/patients/reports/${caseId}`);
    };

  return (
    <div className="q-task-queue-table">
            <table>
                <thead>
                    <tr>
                        <th>Case ID</th>
                        <th>Date</th>
                        <th>Service</th>
                        <th>Status</th>
                        <th>Physician</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {currentRows.length > 0 ? (
                        currentRows.map((caseItem, index) => (
                        <tr key={index}>
                            <td>{`${caseItem.case_id}`}</td>
                            <td>
                            {caseItem.request_date
                                ? new Date(caseItem.request_date).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: '2-digit',
                                })
                                : "-"}
                            </td>
                            <td>{caseItem.service_type}</td>
                            <td>
                                <span 
                                    className=
                                    {`q-status-badge ${caseItem.status.toLowerCase()}`}>
                                    {caseItem.status}
                                </span>
                            </td>
                            <td>{caseItem.requesting_physician}</td>
                            <td>
                                <a
                                    className="arrow-btn"
                                    onClick={() => handleRowClick(caseItem.case_id)}
                                >
                                    <img 
                                        src={ArrowIcon} 
                                        alt="Arrow" 
                                        className="arrow-icon" 
                                        style={{ width: '15px', height: '15px' }} />
                                </a>
                            </td>
                        </tr>
                        ))
                    ) : (
                        <tr>
                        <td colSpan={5}>No queued cases found.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="pagination">
                <button onClick={handlePrevPage} disabled={currentPage === 1}>
                    Previous
                </button>
                <span>
                    Page {currentPage} of {totalPages}
                </span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>
        </div>
  )
}

export default QueueTable