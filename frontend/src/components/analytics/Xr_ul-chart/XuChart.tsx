import { useEffect, useState } from 'react'
import {LineChart, Line, XAxis, YAxis, CartesianGrid, 
        Tooltip, Legend, ResponsiveContainer } from "recharts";
const IP = import.meta.env.VITE_SERVER_IP_ADD;

type XrayUltra = {
  month: string;
  total_xray: number;
  total_ultrasound: number;
}

const xuChart = () => {
    const [xrayUltraData, setXrayUltraData] = useState<XrayUltra[]>([]);
    
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
      
  return (
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
  )
}

export default xuChart