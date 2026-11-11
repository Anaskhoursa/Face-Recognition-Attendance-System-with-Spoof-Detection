import React from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const Default = () => {
  try {
    // Get the cookie and parse it
    const cookie = Cookies.get('details');
    
    if (!cookie) {
      // If no cookie exists, redirect to login
      return <Navigate to="/login" />;
    }

    const userData = JSON.parse(cookie);
    
    if (!userData || !userData.role) {
      // If cookie is invalid or missing role, redirect to login
      return <Navigate to="/login" />;
    }

    // Redirect based on role
    if (userData.role === 'teacher') {
      return <Navigate to="/teacher-dashboard" />;
    } else if (userData.role === 'student') {
      return <Navigate to="/student-dashboard" />;
    } else {
      // Unknown role, redirect to login
      return <Navigate to="/login" />;
    }
  } catch (error) {
    console.error('Error parsing user cookie:', error);
    // If there's an error parsing, redirect to login
    return <Navigate to="/login" />;
  }
};

export default Default;