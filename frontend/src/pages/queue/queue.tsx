import Navbar from '../../components/navigation bar/navbar';
import QueueTable from '../../components/queue/queue-table/QueueTable';
import './queue_styles.css';

const TaskQueue = () => {
  return (
    <div className="queue-container">
      <div className="queue-content-section">
        <div className="queue-navigation-panel">
          <Navbar />
        </div>
        <div className="q-page-divider">
          <h1 className="queue-title">Task Queue</h1>
          <p className="queue-subtitle"></p>
          <QueueTable/>
        </div>
      </div>
    </div>
  );
};

export default TaskQueue;
