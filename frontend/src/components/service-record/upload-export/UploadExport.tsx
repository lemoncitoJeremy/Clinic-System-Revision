import { useState } from "react";
import axios from "axios";
import ArrowDown from "../../../assets/ArrowDown.png";
import { useNavigate } from "react-router-dom";

const IP = import.meta.env.VITE_SERVER_IP_ADD;

type CaseStatus = { case_status: string | null };

type Props = {
  id: string | undefined;
  caseStatus: CaseStatus | null;
  radiology: any;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
  setModalMessage: (msg: string | null) => void;
};

const UploadExport = ({
    id,
    caseStatus,
    radiology,
    isDropdownOpen,
    setIsDropdownOpen,
    setModalMessage}: Props) => {
        
    const navigate = useNavigate();
    const [formValues, setFormValues] = useState({
        case_Id: id || "",
        radiologist: "",
        radio_technologist: "",
        radiographic_findings: "",
        radiographic_impressions: "",
        status: "Done",
    });

    const Radiologist =
        radiology?.radiologist?.map(
        (radiologist: { radiologist_name: string }) => 
            radiologist.radiologist_name) || [];

    const RadioTech =
        radiology?.radiotech?.map(
        (radio_technologist: { radio_tech_name: string }) =>
            radio_technologist.radio_tech_name) || [];


    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        try {
        const res = await axios.post(`http://${IP}/upload/findings`, {
            ...formValues,
        });

        if (res.data.success) {
            setModalMessage("Findings uploaded successfully!");
        } else {
            setModalMessage("Failed to Upload Findings.");
        }
        } catch (err) {
        console.error(err);
        setModalMessage("An error occurred while Uploading the Findings.");
        }
    }

    const handleInput = (event:any) => {
        setFormValues((prev) => ({
        ...prev,
        [event.target.name]: event.target.value,
        }));
    };

  return (
    <>
      {caseStatus?.case_status !== "Done" &&
        caseStatus?.case_status !== "Cancelled" && (
          <div className="findings">
            <div
                className="findings-header"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <h3>Upload Findings</h3>
                <span className={`arrow ${isDropdownOpen ? "open" : ""}`}>
                    <img src={ArrowDown} alt="Edit" />
                </span>
            </div>

            {isDropdownOpen && (
              <form className="findings-form" onSubmit={handleSubmit}>
                <div className="s-r-form-section">
                  <label>Select Radiologist</label>
                  <select
                        name="radiologist"
                        value={formValues.radiologist}
                        onChange={handleInput}
                        required>
                        <option value="">-- Select an Option --</option>
                        {Radiologist.map((r: string, idx: number) => (
                        <option key={idx} value={r}>
                            {r}
                        </option>
                        ))}
                  </select>
                </div>

                <div className="s-r-form-section">
                  <label>Select Radio Technologist</label>
                  <select
                        name="radio_technologist"
                        value={formValues.radio_technologist}
                        onChange={handleInput}
                        required>
                        <option value="">-- Select an Option --</option>
                        {RadioTech.map((t: string, idx: number) => (
                        <option key={idx} value={t}>
                            {t}
                        </option>
                        ))}
                  </select>
                </div>

                <div className="s-r-form-section notes-section">
                  <label>Radiographic Findings</label>
                  <textarea
                    name="radiographic_findings"
                    value={formValues.radiographic_findings}
                    onChange={handleInput}
                    placeholder="Enter a description..."
                    required/>
                </div>

                <div className="s-r-form-section notes-section">
                  <label>Radiographic Impressions</label>
                  <textarea
                    name="radiographic_impressions"
                    value={formValues.radiographic_impressions}
                    onChange={handleInput}
                    placeholder="Enter a description..."
                    required/>
                </div>

                <div className="btns">
                  <button
                        type="button"
                        className="back-btn"
                        onClick={() => navigate(-1)}>
                        Back
                  </button>
                  <button type="submit" className="back-btn">
                    Save Findings
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
    </>
  );
};

export default UploadExport;