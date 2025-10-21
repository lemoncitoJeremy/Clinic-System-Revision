type Case = {
  patient_id: string;
  patient_source: string;
  request_date: Date;
  exam_type: string;
  service_type: string;
  requesting_physician: string;
  notes: string;
};

type CaseStatus = { case_status: string | null };

type Props = {
  id: string | undefined;
  patient: Case | null;
  caseStatus: CaseStatus | null;
  onCancel: () => void;
};

const ServiceDtls = ({ id, patient, caseStatus, onCancel }: Props) => {
    const requestDate = patient?.request_date
    ? new Date(patient.request_date).toLocaleDateString()
    : "";

  return (
    <section className="service-request">
      <div className="service-request-header">
        <h3>Service Request</h3>
        {caseStatus?.case_status !== "Done" &&
          caseStatus?.case_status !== "Cancelled" && (
            <button className="cancel-request-btn" onClick={onCancel}>
              Cancel Request
            </button>
          )}
      </div>

      <table className="request-table">
        <tbody>
          <tr>
            <td>Case ID:</td>
            <td>{id}</td>
          </tr>
          <tr>
            <td>Source:</td>
            <td>{patient?.patient_source}</td>
          </tr>
          <tr>
            <td>Exam Type:</td>
            <td>{patient?.exam_type}</td>
          </tr>
          <tr>
            <td>Date of Request:</td>
            <td>{requestDate}</td>
          </tr>
          <tr>
            <td>Service Type:</td>
            <td>{patient?.service_type}</td>
          </tr>
          <tr>
            <td>Requesting Physician:</td>
            <td>{patient?.requesting_physician}</td>
          </tr>
          <tr>
            <td>Notes:</td>
            <td>{patient?.notes}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
};

export default ServiceDtls;