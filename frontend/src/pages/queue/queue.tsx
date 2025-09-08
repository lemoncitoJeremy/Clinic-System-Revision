import { useEffect, useState } from 'react';
import Navbar from '../../components/navigation bar/navbar'
import './queue_styles.css'

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

const Queue = () => {
  const [queuedCases, setQueuedCases] = useState<QueuedCase[]>([]);

  useEffect(() => {
    const fetchQueuedCases = async () => {
      try {
        const res = await fetch("http://localhost:3000/queued-cases");
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

  return (
    <div className='queue-page'>
      <div className="queue-navigation-panel">
        <Navbar />
        </div>
      <div className="queue-content">
        {queuedCases.map((queue, index) => (
          <>
          <div key={index} className="queue-cards">
            <div className='card-details'>
              <h2>Queue ID: {queue.case_id}</h2>
              <p><strong>Name:</strong> {queue.firstname} {queue.lastname}</p>
              <p><strong>Physician:</strong> {queue.requesting_physician}</p>
              <p><strong>Service:</strong> {queue.service_type}</p>
            </div>
            <div className='card-actions'>
              <button className='accept-btn'>Accept</button>
              <button className='reject-btn'>Reject</button>
            </div>
          </div>
          </>
        ))}
      </div>
       
        
      </div>
  )
}

export default Queue