"use client"
import React, {useEffect} from 'react';
import {signIn, signOut, useSession} from "next-auth/react";
import {useRouter} from "next/navigation";


function LoginBtn() {
    const {data} = useSession();
    const router= useRouter()

    useEffect(() => {
        console.log(data);
        if(data){
            console.log(data.user);
            router.push('/Upload');
        }
       }, [data]);


    const signin =  () => {
        console.log("Signing in Google");
        signIn("google");    }


    return (
        <div className="flex items-center justify-center h-screen bg-white">
            <button onClick={signin} className="px-4 py-2 border flex gap-2 border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:shadow transition duration-150">
                <img className="w-6 h-6" src="https://www.svgrepo.com/show/475656/google-color.svg" loading="lazy" alt="google logo"/>
                    <span>Login with Google</span>
            </button>
        </div>
    )
}


export default LoginBtn;