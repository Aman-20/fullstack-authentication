import React, { useState } from 'react';
import styles from "./Signup.module.css";
import {Link, useNavigate} from "react-router-dom";
import {API_URL} from "../../config"

const Signup = () => {
  const navigate = useNavigate();

  const [data, setdata] = useState();
  const [err, seterr] = useState();


  const [formData, setFormData] = useState({
    name:"",
    email:"",
    password:"",
  });

  const handleChange = (e) =>{
    setFormData({...formData, [e.target.name]:e.target.value});
  }

  const handleSubmit = async(e) =>{
    e.preventDefault();
    console.log(formData);

    const register = await fetch(`${API_URL}/user/signup`, {
      credentials:"include",
      method:"POST",
      headers:{"content-type":"application/json"},
      body:JSON.stringify(formData),
    });

    const result = await register.json();

    if(result.success){
      setdata(result.msg || "Otp Sent Successfully");
      navigate("/verify-otp", {state: {email:formData.email, msg:result.msg}})
    } else {
      seterr(result.msg || "Some Error Occured While Signup")
    }

  }


  return (
    <>
    <div className={styles.main}>

      {err && <p>{err}</p>}
      {data && <p>{data}</p>}

      <div className={styles.heading}>SignUp</div> 

      <div className={styles.form}>

      <form onSubmit={handleSubmit}>
        <label htmlFor='name'>Name</label>
        <input type='text' name='name' id='name' value={formData.name} onChange={handleChange}/> <br/><br/>

        <label htmlFor='email'>Email</label>
        <input type='email' name='email' id='email' value={formData.email} onChange={handleChange}/> <br/><br/>

        <label htmlFor='password'>Password</label>
        <input type='password' name='password' id='password' value={formData.password} onChange={handleChange}/> <br/><br/>

        <button>Submit</button> <br/><br/>

        <Link to="/login">Login</Link>
      </form>

      </div>

    </div>
    </>
  )
}

export default Signup