import { useEffect, useState } from 'react';
const IP = import.meta.env.VITE_SERVER_IP_ADD;

type RadReward = {
  name: string;
  role: string;
  request_date: string;
  gross_earnings: string;
  net_earnings: string;
};

const RadRwrdsTable = () => {
  const [radRwrds, setRadRwrds] = useState<RadReward[]>([]);
  const [selectedMonthRwrds, setSelectedMonthRwrds] = useState<string>('');
  const [selectedRoleRwrds, setSelectedRoleRwrds] = useState<string>('');
  const [currentPageRwrds, setCurrentPageRwrds] = useState<number>(1);
  const recordsPerPage = 6;

  const uniqueMonthsRwrds = Array.from(new Set(radRwrds.map(i => i.request_date)));
  const uniqueRolesRwrds = Array.from(new Set(radRwrds.map(i => i.role)));

  const filteredRwrds = radRwrds.filter(item =>
    (!selectedMonthRwrds || item.request_date === selectedMonthRwrds) &&
    (!selectedRoleRwrds || item.role === selectedRoleRwrds)
  );

  const totalPagesRwrds = Math.ceil(filteredRwrds.length / recordsPerPage);
  const paginatedRwrds = filteredRwrds.slice(
    (currentPageRwrds - 1) * recordsPerPage,
    currentPageRwrds * recordsPerPage
  );

  useEffect(() => {
    const fetchRadRwrds = async () => {
      try {
        const res = await fetch(`http://${IP}/rad-rwrds`);
        const data = await res.json();
        if (data.success) {
          const transformed = data.earnings.map((item: any) => ({
            name: item.name,
            role: item.role,
            request_date: item.request_date,
            gross_earnings: item.gross_earnings,
            net_earnings: item.net_earnings,
          }));
          setRadRwrds(transformed);
        }
      } catch (err) {
        console.error('Error fetching radiology rewards:', err);
      }
    };
    fetchRadRwrds();
  }, []);

  return (
    <div className="analytics-section">
      <h2>Rad/Tech Earnings</h2>

      <div className="filter-group">
        <label htmlFor="monthFilterRwrds">Filter by Month: </label>
        <select
          id="monthFilterRwrds"
          value={selectedMonthRwrds}
          onChange={(e) => {
            setSelectedMonthRwrds(e.target.value);
            setCurrentPageRwrds(1);
          }}
        >
          <option value="">All</option>
          {uniqueMonthsRwrds.map((month, idx) => (
            <option key={idx} value={month}>
              {month}
            </option>
          ))}
        </select>

        <label htmlFor="roleFilterRwrds">Filter by Role: </label>
        <select
          id="roleFilterRwrds"
          value={selectedRoleRwrds}
          onChange={(e) => {
            setSelectedRoleRwrds(e.target.value);
            setCurrentPageRwrds(1);
          }}
        >
          <option value="">All</option>
          {uniqueRolesRwrds.map((role, idx) => (
            <option key={idx} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <div className="table-wrapper">
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Month</th>
              <th>Role</th>
              <th>Gross Earnings</th>
              <th>Net Earnings</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRwrds.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.request_date || '-'}</td>
                <td>{item.role}</td>
                <td className="text-right">{item.gross_earnings}</td>
                <td className="text-right">{item.net_earnings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          onClick={() => setCurrentPageRwrds(prev => Math.max(prev - 1, 1))}
          disabled={currentPageRwrds === 1}
        >
          Prev
        </button>
        <span>
          Page {currentPageRwrds} of {totalPagesRwrds}
        </span>
        <button
          onClick={() =>
            setCurrentPageRwrds(prev => Math.min(prev + 1, totalPagesRwrds))
          }
          disabled={currentPageRwrds === totalPagesRwrds}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default RadRwrdsTable;
