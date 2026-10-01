import React, { useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/react";
import { useAuth } from "../../context/useAuth";

const Settings = () => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [step, setStep] = useState("email");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentEmail =
    user?.primaryEmailAddress?.emailAddress || "";

  
  const sendOtp = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const newEmail = email.trim().toLowerCase();

    if (!newEmail) {
      setError("Please enter your new email address.");
      return;
    }

    if (
      newEmail === currentEmail.trim().toLowerCase()
    ) {
      setError("Please enter a different email address.");
      return;
    }

    try {
      setLoading(true);

      const emailAddress =
        await user.createEmailAddress({
          email: newEmail,
        });

      await emailAddress.prepareVerification({
        strategy: "email_code",
      });

      setStep("otp");

      setSuccess(
        "OTP has been sent to your new email address."
      );
    } catch (err) {
      console.log(
        "SEND EMAIL OTP ERROR:",
        err
      );

      setError(
        err?.errors?.[0]?.message ||
          "Unable to send OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  
  const verifyOtp = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    try {
      setLoading(true);

      const newEmail = email.trim().toLowerCase();

      // Find the new email inside Clerk
      const emailAddress =
        user.emailAddresses.find(
          (item) =>
            item.emailAddress.toLowerCase() ===
            newEmail
        );

      if (!emailAddress) {
        setError(
          "New email address was not found."
        );

        setLoading(false);
        return;
      }

      
      const verification =
        await emailAddress.attemptVerification({
          code: otp.trim(),
        });

      if (
        verification.verification.status !==
        "verified"
      ) {
        setError(
          "OTP verification was not completed."
        );

        setLoading(false);
        return;
      }

      
      await user.update({
        primaryEmailAddressId:
          emailAddress.id,
      });

      
      const token = await getToken();

      if (!token) {
        setError(
          "Authentication token not available."
        );

        setLoading(false);
        return;
      }

      
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

        setLoading(false);
        return;
      }

      // ----------------------------------------------
      // SUCCESS
      // ----------------------------------------------
      setSuccess(
        "Login email updated successfully."
      );

      setEmail("");
      setOtp("");
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
    setError("");
    setSuccess("");
  };

  return (
    <div className="flex justify-center px-4 mt-6">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-5">

        <h2 className="text-2xl font-bold text-teal-600 mb-4 text-center">
          Login Settings
        </h2>

        {error && (
          <p className="text-red-600 text-sm text-center mb-3">
            {error}
          </p>
        )}

        {success && (
          <p className="text-green-600 text-sm text-center mb-3">
            {success}
          </p>
        )}

        {/* CURRENT EMAIL */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-1">
            Current Login Email
          </label>

          <div className="w-full bg-gray-100 border rounded-md px-3 py-2 text-sm">
            {currentEmail}
          </div>
        </div>

        {/* STEP 1 - EMAIL */}
        {step === "email" && (
          <form
            onSubmit={sendOtp}
            className="space-y-3"
          >
            <div>
              <label className="block text-sm font-medium mb-1">
                New Login Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter new email"
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-md text-sm font-semibold mt-2 text-white ${
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

        {/* STEP 2 - OTP */}
        {step === "otp" && (
          <form
            onSubmit={verifyOtp}
            className="space-y-3"
          >
            <div>
              <label className="block text-sm font-medium mb-1">
                Enter OTP
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value)
                }
                placeholder="Enter OTP"
                className="w-full border rounded-md px-3 py-2 text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-md text-sm font-semibold mt-2 text-white ${
                loading
                  ? "bg-teal-400 cursor-not-allowed"
                  : "bg-teal-600 hover:bg-teal-700 cursor-pointer"
              }`}
            >
              {loading
                ? "Updating..."
                : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={cancelOtp}
              disabled={loading}
              className="w-full py-2 rounded-md text-sm font-semibold border border-gray-300 hover:bg-gray-100"
            >
              Change Email
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default Settings;