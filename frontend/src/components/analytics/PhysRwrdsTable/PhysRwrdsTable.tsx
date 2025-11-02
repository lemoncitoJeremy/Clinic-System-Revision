import { useEffect, useState } from "react";
const IP = import.meta.env.VITE_SERVER_IP_ADD;

type RefPhysicianEarns = {
  phys_name: string;
  referral_month: string;
  gross_earnings:string;
  total_earns: number;
}

const RwrdsTable = () => {
    const [selectedMonthRef, setSelectedMonthRef] = useState<string>("");
    const [currentPageRef, setCurrentPageRef] = useState<number>(1);
    const [physEarns, setPhysEarns] = useState<RefPhysicianEarns[]>([]);
    
    const recordsPerPage = 6;
    const uniqueMonthsRef = Array.from(new Set(physEarns.map(i => i.referral_month)));
    const filteredRefPhys = physEarns.filter(item =>
        !selectedMonthRef || item.referral_month === selectedMonthRef
    );
    const totalRefPages = Math.ceil(filteredRefPhys.length / recordsPerPage);
    const paginatedRefPhys = filteredRefPhys.slice(
        (currentPageRef - 1) * recordsPerPage,
        currentPageRef * recordsPerPage
    );

    useEffect(() => {
        const fetchPhysEarns = async () => {
        try {
            const res = await fetch(`http://${IP}/phys-earns`);
            const data = await res.json();
            console.log(data.earnings)
            if (data.success) {
            const transformed = data.earnings.map((item: any) => ({
                phys_name: item.physician_name,
                gross_earnings: item.gross_earnings,
                referral_month: item.referral_month,
                total_earns: item.total_earnings
            }));
            console.log(transformed)
            setPhysEarns(transformed);
            }
        } catch (err) {
            console.error("Error fetching ref:", err);
        }
        };
        fetchPhysEarns();
    }, []);
    

return (
    <div className="analytics-section">
        <h2>Physician Earnings</h2>
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
                    <th>Gross</th>
                    <th>Net</th>
                </tr>
                </thead>
                <tbody>
                {paginatedRefPhys.map((item, index) => (
                    <tr key={index}>
                    <td>{item.phys_name}</td>
                    <td>{item.referral_month || "-"}</td>
                    <td className="text-right">₱{item.gross_earnings}</td>
                    <td className="text-right">₱{item.total_earns}</td>
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

export default RwrdsTable