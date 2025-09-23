import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import './login_styles.css'
import Logo from '../../assets/logo2.png';

const IP = import.meta.env.VITE_SERVER_IP_ADD;

function login() {
    
    const navigate = useNavigate();
    const [values, setValues] = useState({
        username: "",
        password: "",
        isLoggedIn: true,
    });
    const [errorMessage, setError] = useState("");

    function handleInput (event: any) {
        setValues((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    }
    async function handleLogin(event: any) {    
        event.preventDefault();
        try{
            const res = await axios.post(`http://${IP}/login`, values);
            if (res.data.success) {
                const data = res.data;
                sessionStorage.setItem('user', JSON.stringify({ data }));
                navigate("/dashboard");
            }  
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data.message)
            } else {
                console.log(err);
            }
        }
    } 

  return (
    <div className="main-container">
        <div className='sub-container'>
            <div className="logo-container">
                <div>
                    <img src={Logo} alt="Logo" style={{ width: '300px', height: '300px' }} />
                </div>
            </div>
            <div className="login-container">
                <div className="contents">
                    <h2 className="login-header">Login</h2>
                    <form className="login-form" onSubmit={handleLogin}>
                        <div className="input-fields">
                            <div className="inp">
                                <label htmlFor="username">username</label>
                                <input 
                                onChange={handleInput} 
                                className="username" 
                                type="text" 
                                id="username" 
                                name="username" 
                                required 
                                />
                                <label htmlFor="password">password</label>
                                <input 
                                onChange={handleInput}
                                className="password" 
                                type="password" 
                                id="password" 
                                name="password" 
                                required 
                                />
                            </div>

                            <div className="error-container">
                                {errorMessage && <span>{errorMessage}</span>}
                            </div>
                            </div>
                        
                        <button type="submit">Proceed</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
  )
}

export default login