import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }






    useEffect(() => {
        const details = getCookie("details");

        if (details) {
            try {
                const decoded = decodeURIComponent(details);  
                const userd = JSON.parse(decoded);
                setUser(userd);
            } catch (err) {
                console.error("Failed to parse user cookie:", err);
            }
        }
    }, []);


    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
