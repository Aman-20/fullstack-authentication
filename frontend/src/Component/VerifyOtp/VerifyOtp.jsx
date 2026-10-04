import React, { useState } from 'react'
import styles from "./VerifyOtp.module.css";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {API_URL} from "../../config";
import {useAuth} from "../Auth/Authcontext";

const VerifyOtp = () => {
    const {fetchAuth} = useAuth();

    const navigate = useNavigate();

    const { state } = useLocation();
    const email = state?.email;
    const msg = state?.msg;

    const [otp, setotp] = useState("");

    const [err, seterr] = useState("");
    const [info, setinfo] = useState(state?.msg || "");

    const [isloading, setisloading] = useState(false);

    if (!email) {
        return <Navigate to="/login" replace />
    }


    const handleSubmit = async (e) => {
        e.preventDefault();

        seterr("");

        if(otp.length != 6){
            seterr("Please enter a valid opt");
            return;
        }

        try {
        setisloading(true);
        const verify = await fetch(`${API_URL}/user/verify-otp`, {
            credentials: "include",
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ otp, email }),
        });

        const result = await verify.json();

        if (result.success) {
            await fetchAuth();
            navigate("/");
        } else {
            seterr(result.msg || "Unable to Verify otp some error occured");
        }

        } catch(err){
            seterr(err.message || "internal server error");
        } finally {
            setisloading(false);
        }
    }

    const ReSendOtp = async() => {
        seterr("");
        setinfo("");

        try{
        setisloading(true);
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

        } catch(err){
            seterr(err.message);
        } finally {
            setisloading(false);
        }
    }

    return (
        <>
            {isloading && <p>Loading...</p>}
            {info && <p>{info}</p>}
            {err && <p>{err}</p>}

            <div className={styles.main}>

                <div className={styles.head}>Verify Otp</div>

                <div className={styles.formPage}>

                <form onSubmit={handleSubmit}>

                    <input type="text" maxLength={6} placeholder="Enter 6-digit OTP" value={otp}
                       onChange={(e) => setotp(e.target.value)} />

                    <button disabled={isloading} >Verify Otp</button>
                    <button type='button' onClick={ReSendOtp} disabled={isloading} > Resend Otp </button>

                </form>

                <Link to="/signup">Change email?</Link>

                </div>

            </div>


        </>
    )
}

export default VerifyOtp