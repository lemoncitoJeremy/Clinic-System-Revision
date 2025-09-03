import { useLocation } from 'react-router-dom';
import Navbar from '../../components/navigation bar/navbar';
import './form_styles.css';

const form_page = () => {
    const location = useLocation();
    const { service, data } = location.state || {};
    console.log(service, data)
  return (
    <div className="form-container">
        <div className="form-navigation-panel">
        <Navbar />
        </div>
        <form className="form-page" id="formPage">
            <div className="left-section">
                <div className="input-container" id="1">
                    <div className='info-field1'>
                        <label className="required">Firstname <input type='text'></input></label>
                        <label className="required">Middlename <input type='text'></input></label>
                        <label className="required">Lastname <input type='text'></input></label>
                    </div>
                    <div className='info-field2'>
                        <h3 > Case Number: 20250903x0001</h3>
                        <label className="required">Birthdate <input type='date'/></label>
                        <div className="gender-group">
                            <label>Gender</label>
                            <label>
                            <input type="radio" name="gender" value="male" /> Male
                            </label>
                            <label>
                            <input type="radio" name="gender" value="female" /> Female
                            </label>
                        </div>
                    </div>
                </div>
                <div className="input-container2" id="2">
                    <div className="row">
                        <label>
                        Email Address
                        <input type="email" />
                        </label>
                        <label>
                        Phone Number
                        <input type="tel" />
                        </label>
                    </div>
                    <div className="row full-width">
                        <label>
                        Address
                        <input type="text" />
                        </label>
                    </div>
                </div>
                <div className="input-container" id="3"></div>
            </div>
            <div className="right-section">
                <div className="input-container" id="4"></div>
                <div className="input-container" id="5"></div>
                <div className="input-container" id="6"></div>
                <div className="buttons">
                    <button type="button" className="btn" id="submitButton">Submit</button>
                    <button type="button" className="btn" id="clearButton">Clear</button>
                    <button type="button" className="btn" id="cancelButton">Cancel</button>
                </div>
            </div>
            
        </form>
    </div>
  )
}

export default form_page