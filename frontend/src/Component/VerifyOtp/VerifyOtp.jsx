import React, { useState } from 'react'
import styles from "./VerifyOtp.module.css";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {API_URL} from "../../config"

const VerifyOtp = () => {

    const navigate = useNavigate();

    const { state } = useLocation();
    const email = state?.email;
    const msg = state?.msg;

    const [otp, setotp] = useState("");
    const [err, seterr] = useState("");
    const [info, setinfo] = useState(state?.msg || "");

    const [disable , setdisable] = useState(false);

    if (!email) {
        return <Navigate to="/login" replace />
    }


    const handleSubmit = async (e) => {
        e.preventDefault();

        const verify = await fetch(`${API_URL}/user/verify-otp`, {
            credentials: "include",
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ otp, email }),
        });

        const result = await verify.json();

        if (result.success) {
            navigate("/login", { state: { msg: result.msg } });
        } else {
            seterr(result.msg || "Unable to Verify otp some error occured");
        }
    }

    const ReSendOtp = async() => {
        seterr("");
        setinfo("");
        
        setdisable(true);
        setTimeout(()=>{
            setdisable(false);
        }, 60000);

        const resend = await fetch(`${API_URL}/user/resend-otp`, {
            credentials: "include",
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({email}),
        });

        const result = await resend.json();

        if(result.success){
            setinfo(result.msg || "A new OTP has been sent to your email");
            setotp("");
        } else {
            seterr(result.msg || "Unable to resend OTP");
        }
    }

    return (
        <>
            {info && <p>{info}</p>}
            {err && <p>{err}</p>}
            {<p>Enter the otp sent to email {email}</p>}

            <div className={styles.main}>

                <div>Verify Otp</div>

                <form onSubmit={handleSubmit}>

                    <input type="text" maxLength={6} placeholder="Enter 6-digit OTP" value={otp}
                       onChange={(e) => setotp(e.target.value)} />

                    <button>Verify</button>
                    <button type='button' onClick={ReSendOtp} disabled={disable} > {disable? "please wait..": "resend-otp"} </button>

                </form>

                <Link to="/signup">Change email?</Link>

            </div>


        </>
    )
}

export default VerifyOtp