import Navbar from "../../components/navigation bar/Navbar";
import XuChart from "../../components/analytics/Xr_ul-chart/XuChart";
import RefTable from "../../components/analytics/RefTable/RefTable";
import RtechTable from "../../components/analytics/RtechTable.tsx/RtechTable";
import "./analytics_styles.css";
import PhysRwrdsTable from "../../components/analytics/PhysRwrdsTable/PhysRwrdsTable";
import RadRwrdsTable from "../../components/analytics/RadRwrdsTable/RadRwrdsTable";

const Analytics = () => {

  return (
    <div className="analytics-page">
      <div className="analytics-p-navigation">
        <Navbar />
      </div>
      <div className="analytics-content">
        <XuChart/>
        <RefTable/>
        <RtechTable/>
        <PhysRwrdsTable/>
        <RadRwrdsTable/>
      </div>
    </div>
  );
};

export default Analytics;
