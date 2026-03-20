import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';

function Login() {

    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: ''
    })

    const navigate = useNavigate();
    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name, value);
        const copyLoginInfo = { ...loginInfo };
        copyLoginInfo[name] = value;
        setLoginInfo(copyLoginInfo);
    }
 
    const handleLogin = async (e) => {
        e.preventDefault();
        const { email , password} = loginInfo;
        if( !email || !password){
            return handleError('All fields are required!!');
        }
        try {
            const url = "https://auth-mern-app-w7ua.onrender.com/auth/login";
            const response = await fetch(url ,{
                method:"POST" , 
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify(loginInfo)
            } );

            const result = await response.json();
            const {success , message , jwtToken , name ,  error} = result;

            if(success){
                handleSuccess(message);
                localStorage.setItem('token' , jwtToken);
                localStorage.setItem('loggedInUSer' , name);
                setTimeout(()=>{
                    navigate('/home')
                } , 1000)
            }else if(error){
                const details = error?.details[0].message;
                handleError(details);
            }else if(!success){
                handleError(message);
            }
            console.log(result);
        } catch (err) {
            handleError(err);
        }
    }
    return (
        <div className='container'>
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                
                <div>
                    <label htmlFor='email'>Email</label>
                    <input
                        onChange={handleChange}
                        type='email'
                        name='email'
                        placeholder='Enter your email....' 
                        value={loginInfo.email}/>
                </div>
                <div>
                    <label htmlFor='password'>Password</label>
                    <input
                        onChange={handleChange}
                        type='password'
                        name='password'
                        placeholder='Enter your password....' />
                </div>
                <button className='glow-on-hover' type='submit'>Login</button>
                <span>No account? <Link to="/signup"><b>Signup</b></Link>
                </span>
            </form>
            <ToastContainer />
        </div>
    )
}

export default Login
