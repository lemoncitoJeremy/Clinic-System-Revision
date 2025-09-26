import { useEffect, useState } from "react";
import Navbar from "../../components/navigation bar/navbar";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, 
        Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./analytics_styles.css";
const IP = import.meta.env.VITE_SERVER_IP_ADD;

type XrayUltra = {
  month: string;
  total_xray: number;
  total_ultrasound: number;
}

type RefPhysician = {
  phys_name: string;
  referral_month: string;
  total_ref: number;
}

type RadService = {
  name: string;
  role: string;
  request_date: string;
  total_service: string;
}

const Analytics = () => {
  const [xrayUltraData, setXrayUltraData] = useState<XrayUltra[]>([]);
  const [radServ, setRadServ] = useState<RadService[]>([]);
  const [refPhys, setRefPhys] = useState<RefPhysician[]>([]);

  const [selectedMonthRef, setSelectedMonthRef] = useState<string>("");
  const [currentPageRef, setCurrentPageRef] = useState<number>(1);

  const [selectedMonthRad, setSelectedMonthRad] = useState<string>("");
  const [selectedRoleRad, setSelectedRoleRad] = useState<string>("");
  const [currentPageRad, setCurrentPageRad] = useState<number>(1);
  const recordsPerPage = 6;

  useEffect(() => {
    const fetchLineChartXU = async () => {
      try {
        const res = await fetch(`http://${IP}/xra-ult`);
        const data = await res.json();
        if (data.success) {
          const transformed = data.xrult.map((item: any) => ({
            month: item.month,
            Xray: Number(item.total_xray),
            Ultrasound: Number(item.total_ultrasound),
          }));
          setXrayUltraData(transformed);
        }
      } catch (err) {
        console.error("Error fetching x and u data:", err);
      }
    };
    fetchLineChartXU();
  }, []);


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

  const uniqueMonthsRef = Array.from(new Set(refPhys.map(i => i.referral_month)));
  const uniqueMonthsRad = Array.from(new Set(radServ.map(i => i.request_date)));
  const uniqueRoles = Array.from(new Set(radServ.map(i => i.role)));

  const filteredRefPhys = refPhys.filter(item =>
    !selectedMonthRef || item.referral_month === selectedMonthRef
  );
  const totalRefPages = Math.ceil(filteredRefPhys.length / recordsPerPage);
  const paginatedRefPhys = filteredRefPhys.slice(
    (currentPageRef - 1) * recordsPerPage,
    currentPageRef * recordsPerPage
  );

  const filteredRadServ = radServ.filter(item =>
    (!selectedMonthRad || item.request_date === selectedMonthRad) &&
    (!selectedRoleRad || item.role === selectedRoleRad)
  );
  const totalRadPages = Math.ceil(filteredRadServ.length / recordsPerPage);
  const paginatedRadServ = filteredRadServ.slice(
    (currentPageRad - 1) * recordsPerPage,
    currentPageRad * recordsPerPage
  );

  return (
    <div className="analytics-page">
      <div className="analytics-p-navigation">
        <Navbar />
      </div>

      <div className="analytics-content">

        <div className="analytics-section">
          <h2>X-ray and Ultrasound Services</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={xrayUltraData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Xray" stroke="#8884d8" />
              <Line type="monotone" dataKey="Ultrasound" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-section">
          <h2>Physician Referrals per Month</h2>
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

        <div className="analytics-section">
          <h2>Radiologist / Technologist Services per Month</h2>
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

      </div>
    </div>
  );
};

export default Analytics;
