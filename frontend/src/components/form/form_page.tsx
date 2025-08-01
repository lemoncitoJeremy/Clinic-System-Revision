import './styles.css';

const form_page = () => {
  return (
    <div className="container">
        <form className="form-page" id="formPage">
            <div className="left-section">
                <div className="input-container" id="1"></div>
                <div className="input-container" id="2"></div>
                <div className="input-container" id="3"></div>
            </div>
            <div className="right-section">
                <div className="input-container" id="4"></div>
                <div className="input-container" id="5"></div>
                <div className="input-container" id="6"></div>
                <div className="buttons">
                    <button type="button" className="btn" id="submitButton">Submit</button>
                    <button type="button" className="btn" id="cancelButton">Cancel</button>
                </div>
            </div>
            
        </form>
    </div>
  )
}

export default form_page