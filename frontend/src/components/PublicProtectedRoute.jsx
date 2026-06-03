import { useEffect, useState } from 'react';
import React from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import auth from '../utils/firebase.js';
import Loading from './Loading.jsx';
import config from "../config.js";

const PublicProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const accessToken = await currentUser.getIdToken();
          const response = await fetch(config.apiUrl + "users/verify-user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log("User verified:", data.data);
            setUser({ ...data.data, isVerified: true });
          } else {
            currentUser.isVerified = false;
            setUser(currentUser);
          }
        } catch (error) {
          console.error("Error verifying user:", error);
          currentUser.isVerified = false;
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <Loading />;

  // If user is authenticated in Firebase but not verified in MongoDB
  if (user && !user.isVerified) {
    if (window.location.pathname !== "/register") {
      return <Navigate to="/register" replace />;
    }
  }

  return user ? React.cloneElement(children, { user }) : children;
};

export default PublicProtectedRoute;
