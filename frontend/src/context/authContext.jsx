import axios from "axios";
import React, {
  createContext,
  useEffect,
  useState,
} from "react";

import {
  useAuth as useClerkAuth,
  useClerk,
} from "@clerk/react";

import API_URL from "../api";

export const userContext = createContext();

const AuthContext = ({ children }) => {
  const {
    isLoaded,
    isSignedIn,
    getToken,
  } = useClerkAuth();

  const { signOut } = useClerk();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const verifyUser = async () => {
      // Clerk is still loading
      if (!isLoaded) {
        return;
      }

      const registrationInProgress =
        sessionStorage.getItem(
          "ems_registration_in_progress"
        ) === "true";

      if (registrationInProgress) {
        if (!cancelled) {
          setLoading(false);
        }

        return;
      }

      if (!isSignedIn) {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }

        return;
      }

      try {
        const token = await getToken();

        if (!token) {
          if (!cancelled) {
            setUser(null);
            setLoading(false);
          }

          return;
        }

        console.log("CLERK TOKEN FOUND");

        const response = await axios.get(
          `${API_URL}/api/auth/verify`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(
          "EMS USER VERIFY RESPONSE:",
          response.data
        );

        if (
          !cancelled &&
          response.data.success
        ) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.log(
          "VERIFY USER ERROR:",
          error.response?.status,
          error.response?.data ||
            error.message
        );

        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    verifyUser();

    return () => {
      cancelled = true;
    };
  }, [
    isLoaded,
    isSignedIn,
    getToken,
  ]);

  const login = (userData) => {
    console.log(
      "EMS USER LOGGED IN:",
      userData
    );

    setUser(userData);
    setLoading(false);
  };

  const logout = async () => {
    try {
      sessionStorage.removeItem(
        "ems_registration_in_progress"
      );

      await signOut();

      setUser(null);
      setLoading(false);
    } catch (error) {
      console.log(
        "LOGOUT ERROR:",
        error
      );
    }
  };

  return (
    <userContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        getToken,
      }}
    >
      {children}
    </userContext.Provider>
  );
};

export default AuthContext;