import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { verifyAccess } from "./api";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const res = await verifyAccess();

      if (res?.success !== false) {
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }

      setLoading(false);
    };

    checkAccess();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!authorized) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
