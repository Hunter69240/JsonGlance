import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Header(){
    const navigate = useNavigate();
    const location = useLocation();
    
    return (
        <div className="flex justify-between p-5 bg-black items-center">
            <div>
                <img src="Logo.svg" alt="Logo" className="w-20 h-20"/>
            </div>
            <div className="flex justify-center space-x-8">
                <button 
                    className={`text-3xl font-bold hover:underline ${
                        location.pathname === '/' 
                            ? 'text-cyan-400' 
                            : 'text-white'
                    }`} 
                    onClick={() => {navigate('/')}}
                >
                    Home
                </button>
                <button 
                    className={`text-3xl font-bold hover:underline ${
                        location.pathname === '/about' 
                            ? 'text-cyan-400' 
                            : 'text-white'
                    }`} 
                    onClick={() => {navigate('/about')}}
                >
                    About
                </button>
            </div>
        </div>
    )
}
