import { useEffect, useState } from 'react'
const IP = import.meta.env.VITE_SERVER_IP_ADD;

type RefPhysician = {
  phys_name: string;
  referral_month: string;
  total_ref: number;
}

const RefTable = () => {
    const [selectedMonthRef, setSelectedMonthRef] = useState<string>("");
    const [currentPageRef, setCurrentPageRef] = useState<number>(1);
    const [refPhys, setRefPhys] = useState<RefPhysician[]>([]);
    
    const recordsPerPage = 6;
    const uniqueMonthsRef = Array.from(new Set(refPhys.map(i => i.referral_month)));
    const filteredRefPhys = refPhys.filter(item =>
        !selectedMonthRef || item.referral_month === selectedMonthRef
    );
    const totalRefPages = Math.ceil(filteredRefPhys.length / recordsPerPage);
    const paginatedRefPhys = filteredRefPhys.slice(
        (currentPageRef - 1) * recordsPerPage,
        currentPageRef * recordsPerPage
    );

    useEffect(() => {
        const fetchRefPhys = async () => {
          try {
            const res = await fetch(`http://${IP}/ref-phys`);
            const data = await res.json();
            if (data.success) {
              const transformed = data.refPhys.map((item: any) => ({
                phys_name: item.physician_name,
                referral_month: item.referral_month,
                total_ref: item.total_referrals
              }));
              setRefPhys(transformed);
            }
          } catch (err) {
            console.error("Error fetching ref:", err);
          }
        };
        fetchRefPhys();
    }, []);
    

  return (
    <div className="analytics-section">
        <h2>Physician Referrals</h2>
        <div className="filter-group">
        <label htmlFor="monthFilterRef">Filter by Month:</label>
        <select
            id="monthFilterRef"
            value={selectedMonthRef}
            onChange={(e) => 
            {   setSelectedMonthRef(e.target.value); 
                setCurrentPageRef(1); }}>
            <option value="">All</option>
            {uniqueMonthsRef.map((month, idx) => 
            <option key={idx} value={month}>{month}</option>)}
        </select>
        </div>

        <div className="table-wrapper">
        <table className="analytics-table">
            <thead>
            <tr>
                <th>Physician</th>
                <th>Month</th>
                <th>Total Referrals</th>
            </tr>
            </thead>
            <tbody>
            {paginatedRefPhys.map((item, index) => (
                <tr key={index}>
                <td>{item.phys_name}</td>
                <td>{item.referral_month || "-"}</td>
                <td className="text-right">{item.total_ref}</td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>

        <div className="pagination">
        <button 
            onClick={() => 
                setCurrentPageRef(prev => Math.max(prev - 1, 1))} 
            disabled={currentPageRef === 1}>
            Prev
        </button>
        <span>Page {currentPageRef} of {totalRefPages}</span>
        <button 
            onClick={() => 
                setCurrentPageRef(prev => Math.min(prev + 1, totalRefPages))} 
            disabled={currentPageRef === totalRefPages}>
            Next
        </button>
        </div>
    </div>
  )
}

export default RefTable