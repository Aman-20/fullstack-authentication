import React, { useState } from 'react'
import styles from "./Login.module.css";
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {useAuth} from "../Auth/Authcontext";

import {API_URL} from "../../config";

const Login = () => {
  const {fetchAuth} = useAuth();

  const navigate = useNavigate();
  const {state} = useLocation();
  
  const [info, setinfo] = useState(state?.msg || "");
  const [err, seterr] = useState("");

  const [formData, setFormData] = useState({
    email:"",
    password:"",
  });

  const handleChange = (e) =>{
    setFormData({...formData, [e.target.name]:e.target.value});
  }

  const handleSubmit = async(e) =>{
    e.preventDefault();
    seterr("");
    setinfo("");
    
    const userlogin = await fetch(`${API_URL}/user/login`, {
      credentials:"include",
      method:"POST",
      headers:{"content-type":"application/json"},
      body:JSON.stringify(formData),
    });

    const result = await userlogin.json();

    if(result.success){
      setinfo(result.msg || "logged in successfully");
      await fetchAuth();
      navigate("/");

    } else {
      console.log(result.msg);
      seterr(result.msg || "unable to login some error occured")
    }
  }

  return (
    <>

    {info && <p>{info}</p>}
    {err && <p>{err}</p>}

    <div className={styles.main}>

      <div className={styles.heading}>Login</div> 

      <div className={styles.form}>

      <form onSubmit={handleSubmit}>
        <label htmlFor='email'>Email</label>
        <input type='email' name='email' id='email' value={formData.email} onChange={handleChange}/> <br/><br/>

        <label htmlFor='password'>Password</label>
        <input type='password' name='password' id='password' value={formData.password} onChange={handleChange}/> <br/><br/>

        <button>Submit</button> <br/><br/>

        <Link to="/signup">SignUp</Link> <br/><br/>

        <Link to="/forgot-password">Forgot Password?</Link>
      </form>
      
      </div>

    </div> 
    </>
  )
}

export default Login