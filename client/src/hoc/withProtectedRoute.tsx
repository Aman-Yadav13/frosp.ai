import { getCurrentUser } from "@/api/user";
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

export const withProtectedRoute = (Component: React.ComponentType<any>) => {
  const ProtectedComponent = (props: any) => {
    const [user, setUser] = useState<any>(null); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkUser = async () => {
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error("Error fetching user:", error);
          setUser(null); 
        } finally {
          setLoading(false); 
        }
      };

      checkUser();
    }, []); 

    if (loading) {
      return null;
    }

    return user ? <Component {...props} /> : <Navigate to="/" />;
  };

  ProtectedComponent.displayName = `withProtectedRoute(${Component.displayName || Component.name || "Component"})`;

  return ProtectedComponent;
};