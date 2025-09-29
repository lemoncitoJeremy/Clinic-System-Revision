import { useEffect, useState } from 'react'
const IP = import.meta.env.VITE_SERVER_IP_ADD;

type RadService = {
  name: string;
  role: string;
  request_date: string;
  total_service: string;
}

const RtechTable = () => {
    const [radServ, setRadServ] = useState<RadService[]>([]);
    const [selectedMonthRad, setSelectedMonthRad] = useState<string>("");
    const [selectedRoleRad, setSelectedRoleRad] = useState<string>("");
    const [currentPageRad, setCurrentPageRad] = useState<number>(1);
    const recordsPerPage = 6;

    const uniqueMonthsRad = Array.from(new Set(radServ.map(i => i.request_date)));
    const uniqueRoles = Array.from(new Set(radServ.map(i => i.role)));

    const filteredRadServ = radServ.filter(item =>
        (!selectedMonthRad || item.request_date === selectedMonthRad) &&
        (!selectedRoleRad || item.role === selectedRoleRad)
    );
    const totalRadPages = Math.ceil(filteredRadServ.length / recordsPerPage);
    const paginatedRadServ = filteredRadServ.slice(
        (currentPageRad - 1) * recordsPerPage,
        currentPageRad * recordsPerPage
    );

    useEffect(() => {
        const fetchRadServ = async () => {
          try {
            const res = await fetch(`http://${IP}/rad-serv`);
            const data = await res.json();
            if (data.success) {
              const transformed = data.radServ.map((item: any) => ({
                name: item.name,
                role: item.role,
                request_date: item.request_date,
                total_service: item.total_services
              }));
              setRadServ(transformed);
            }
          } catch (err) {
            console.error("Error fetching rad service:", err);
          }
        };
        fetchRadServ();
    }, []);

    
  return (
    <div className="analytics-section">
        <h2>Radiologist / Technologist Services</h2>
        <div className="filter-group">
            <label htmlFor="monthFilterRad">Filter by Month: </label>
            <select 
                id="monthFilterRad"
                value={selectedMonthRad}
                onChange={(e) => 
                {   setSelectedMonthRad(e.target.value); 
                    setCurrentPageRad(1); }}>
                    <option value="">All</option>
                    {uniqueMonthsRad.map((month, idx) => 
                    <option key={idx} value={month}>{month}</option>)}
            </select>

            <label htmlFor="roleFilterRad">Filter by Role: </label>
            <select
                id="roleFilterRad"
                value={selectedRoleRad}
                onChange={(e) => 
                {   setSelectedRoleRad(e.target.value); 
                    setCurrentPageRad(1); }}>
                    <option value="">All</option>
                    {uniqueRoles.map((role, idx) => 
                    <option key={idx} value={role}>{role}</option>)}
            </select>
        </div>

        <div className="table-wrapper">
            <table className="analytics-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Month</th>
                        <th>Role</th>
                        <th>Total Services</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedRadServ.map((item, index) => (
                        <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.request_date || "-"}</td>
                        <td>{item.role}</td>
                        <td className="text-right">{item.total_service}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="pagination">
            <button 
                onClick={() => 
                    setCurrentPageRad(prev => Math.max(prev - 1, 1))} 
                disabled={currentPageRad === 1}>
                Prev
            </button>
            <span>Page {currentPageRad} of {totalRadPages}</span>
            <button 
                onClick={() => 
                    setCurrentPageRad(prev => Math.min(prev + 1, totalRadPages))} 
                disabled={currentPageRad === totalRadPages}>
                Next
            </button>
        </div>
    </div> 
  )
}

export default RtechTable