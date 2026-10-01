import React, { useState } from "react";
import axios from "axios";
import {
  useUser,
  useReverification,
} from "@clerk/react";

import { useAuth } from "../../context/useAuth";

const Setting = () => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [step, setStep] = useState("email");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [pendingEmailAddress, setPendingEmailAddress] =
    useState(null);

  const currentEmail =
    user?.primaryEmailAddress?.emailAddress || "";

  

  const createEmailAddress = useReverification(
    async (newEmail) => {
      return await user.createEmailAddress({
        email: newEmail,
      });
    }
  );


  const sendOtp = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const newEmail = email.trim().toLowerCase();

    if (!newEmail) {
      setError("Please enter a new email address.");
      return;
    }

    if (
      newEmail ===
      currentEmail.trim().toLowerCase()
    ) {
      setError(
        "Please enter a different email address."
      );
      return;
    }

    if (!user) {
      setError(
        "User information is not available."
      );
      return;
    }

    try {
      setLoading(true);

      

      const emailAddress =
        await createEmailAddress(newEmail);

      if (!emailAddress) {
        setError(
          "Unable to create the new email address."
        );
        return;
      }

      
      setPendingEmailAddress(emailAddress);

      

      await emailAddress.prepareVerification({
        strategy: "email_code",
      });

      setStep("otp");

      setMessage(
        "Verification OTP has been sent to your new email address."
      );
    } catch (err) {
      console.log(
        "SEND EMAIL OTP ERROR:",
        err
      );

      setError(
        err?.errors?.[0]?.message ||
          "Unable to send verification OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  

  const verifyOtp = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    if (!pendingEmailAddress) {
      setError(
        "Email verification session expired. Please request a new OTP."
      );
      return;
    }

    try {
      setLoading(true);

      

      const verification =
        await pendingEmailAddress.attemptVerification(
          {
            code: otp.trim(),
          }
        );

      if (
        verification?.verification?.status !==
        "verified"
      ) {
        setError(
          "OTP verification was not completed."
        );
        return;
      }

      

      await user.update({
        primaryEmailAddressId:
          pendingEmailAddress.id,
      });

     

      const token = await getToken();

      if (!token) {
        setError(
          "Authentication token not available."
        );
        return;
      }

      

      const newEmail =
        pendingEmailAddress.emailAddress
          .trim()
          .toLowerCase();

      const response = await axios.put(
        "http://localhost:5000/api/auth/update-email",
        {
          email: newEmail,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data.success) {
        setError(
          response.data.error ||
            "Failed to update email in database."
        );
        return;
      }

      

      setMessage(
        "Login email updated successfully."
      );

      setEmail("");
      setOtp("");
      setPendingEmailAddress(null);
      setStep("email");
    } catch (err) {
      console.log(
        "VERIFY EMAIL OTP ERROR:",
        err
      );

      setError(
        err?.response?.data?.error ||
          err?.errors?.[0]?.message ||
          "Invalid or expired OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  

  const cancelOtp = () => {
    setStep("email");
    setEmail("");
    setOtp("");
    setPendingEmailAddress(null);
    setMessage("");
    setError("");
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-lg rounded-lg p-6">

      <h2 className="text-2xl font-bold text-center mb-6 text-teal-600">
        Login Settings
      </h2>

     

      {message && (
        <p className="text-green-600 text-center font-medium mb-4">
          {message}
        </p>
      )}

      

      {error && (
        <p className="text-red-600 text-center font-medium mb-4">
          {error}
        </p>
      )}

      

      <div className="mb-6">
        <p className="text-gray-600 text-sm">
          Current Login Email
        </p>

        <p className="font-medium mt-1 break-all">
          {currentEmail || "Not available"}
        </p>
      </div>

      

      {step === "email" && (
        <form onSubmit={sendOtp}>

          <label className="block text-sm font-medium mb-2">
            New Login Email
          </label>

          <input
            type="email"
            placeholder="Enter new email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full border p-3 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white p-3 rounded transition duration-200 ${
              loading
                ? "bg-teal-400 cursor-not-allowed"
                : "bg-teal-600 hover:bg-teal-700 cursor-pointer"
            }`}
          >
            {loading
              ? "Sending OTP..."
              : "Send OTP"}
          </button>

        </form>
      )}

      

      {step === "otp" && (
        <form onSubmit={verifyOtp}>

          <p className="text-sm text-gray-600 mb-2">
            Verification OTP sent to:
          </p>

          <p className="font-medium mb-5 break-all">
            {email}
          </p>

          <label className="block text-sm font-medium mb-2">
            Verification OTP
          </label>

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value)
            }
            className="w-full border p-3 rounded mb-5 text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white p-3 rounded transition duration-200 ${
              loading
                ? "bg-teal-400 cursor-not-allowed"
                : "bg-teal-600 hover:bg-teal-700 cursor-pointer"
            }`}
          >
            {loading
              ? "Updating..."
              : "Verify OTP & Update Email"}
          </button>

          <button
            type="button"
            onClick={cancelOtp}
            disabled={loading}
            className="w-full mt-3 p-3 rounded border border-gray-300 hover:bg-gray-100"
          >
            Change Email
          </button>

        </form>
      )}

    </div>
  );
};

export default Setting;