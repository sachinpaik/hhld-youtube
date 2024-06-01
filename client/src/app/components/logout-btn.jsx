"use client"
import React, {useEffect} from 'react';
import { signOut, useSession} from "next-auth/react";
import {useRouter} from "next/navigation";


function LogoutBtn() {
    const {data} = useSession();
    const router= useRouter()

    useEffect(() => {
        if(!data){
           router.replace('/');
        }
    }, [data]);


    const signout =  () => {
        console.log("Signing in Google");
        signOut();
    }

    return (
        <div >
            <button onClick={signout}
                    className="text-white bg-red-500 hover:bg-red-700 font-medium py-2 px-4 rounded">
                Logout
            </button>
        </div>
    )
}


export default LogoutBtn;