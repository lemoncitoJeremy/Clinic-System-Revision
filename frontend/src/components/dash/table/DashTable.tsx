import { useEffect, useState } from "react";
import ArrowIcon from "../../../assets/Arrow.png"
import { useNavigate } from "react-router-dom";
const IP = import.meta.env.VITE_SERVER_IP_ADD;

type QueuedCase = {
    case_id: string;
    firstname: string;
    middlename: string;
    lastname: string;
    physician_name: string;
    service_type: string;
    status: string;
    request_date: Date;
  };

const dashTable = () => {
    const navigate = useNavigate();
    const [filterStatus, setFilterStatus] = useState<string>("Pending");
    const [tableCases, setTableCases] = useState<QueuedCase[]>([]); 
    const [currentPage, setCurrentPage] = useState<number>(1);

    const handleFilterChange = async (status: string) => {
        try {
        const res = await fetch(`http://${IP}/dash-filter-cases?status=${status}`);
        const data = await res.json();

        if (data.success) {
            setTableCases(data.Filtered);
            setCurrentPage(1);
        }
        } catch (err) {
        console.error("Error fetching filtered cases:", err);
        }
    };
    
    useEffect(() => {
        handleFilterChange(filterStatus);
    }, []);
      
    const rowsPerPage = 6;
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = tableCases.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(tableCases.length / rowsPerPage);

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
    <div className="dash-q-task-queue-table">
            <table>
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Date</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Physician</th>
                  <th>
                    <select 
                      name="status-filter" 
                      className='status-filter' 
                      value={filterStatus} 
                      onChange={(e) => {
                        const value = e.target.value;
                        setFilterStatus(value);
                        handleFilterChange(value);
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Done">Done</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </th>
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
                        <span className={`dash-q-status-badge ${caseItem.status.toLowerCase()}`}>
                          {caseItem.status}
                        </span>
                      </td>
                      <td>{caseItem.physician_name}</td>
                      <td>
                        <a
                          className="arrow-btn"
                          onClick={() => handleRowClick(caseItem.case_id)}
                        >
                          <img src={ArrowIcon} alt="Arrow" 
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

            <div className="dash-pagination">
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

export default dashTable