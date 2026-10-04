import React, { useState } from 'react'
import styles from "./ResetPass.module.css";
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {API_URL} from "../../config"

const ResestPass = () => {
    const navigate = useNavigate();

    const {token} = useParams();
    const [searchparam] = useSearchParams();
    const email = searchparam.get("email");


    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    
    const [err, seterr] = useState("");
    const [info, setinfo] = useState("");
    const [loading, setloading] = useState(false);


    const handleSubmit = async(e) =>{
        e.preventDefault();

        seterr("");
        setinfo("");

        if(confirmPass != newPass){
            seterr("Password Does not match");
            return;
        }

        if(newPass.length < 6){
            seterr("Password must be at least 6 characters");
            return;
        }

        try{
            setloading(true);
            const changePass = await fetch(`${API_URL}/user/reset-password`, {
                credentials:"include",
                method:"POST",
                headers:{"content-type":"application/json"},
                body:JSON.stringify({email, token, newPass}),
            });

            const result = await changePass.json();

            if(result.success){
                setinfo(result.msg);
                setTimeout(()=>{navigate("/login")}, 2000);
            } else {
                seterr(result.msg);
            }
        } catch (err){
            seterr(err.message || "something went wrong! Please try again");
        } finally {
            setloading(false);
        }
    }


    if (!email) {
        return <p>Invalid or incomplete reset link. Please request a new one.</p>;
    }

  return (
    <>
    <div className={styles.main}>

        {info && <p>{info}</p>}
        {err && <p>{err}</p>}
        {loading && <p>Loading...</p>}

        <div className={styles.head}>Reset Password</div>

        <div className={styles.formPage}>
            <form onSubmit={handleSubmit}>

                <input type='password' placeholder='Enter your new Password' value={newPass} onChange={(e)=>{setNewPass(e.target.value)}}/>

                <input type='password' placeholder='Conform your new Password' value={confirmPass} onChange={(e)=>{setConfirmPass(e.target.value)}}/>

                <button>Change-Password</button>
            </form>
        </div>
    </div>
    </>
  )
}

export default ResestPass