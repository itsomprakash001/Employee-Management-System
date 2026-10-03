import React, { useState } from "react";
import axios from "axios";
import {
  useUser,
  useReverification,
} from "@clerk/react";
import { useAuth } from "../../context/useAuth";
import API_URL from "../../api";

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
      setError("Please enter a different email address.");
      return;
    }

    if (!user) {
      setError("User information is not available.");
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
      console.log("SEND EMAIL OTP ERROR:", err);

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
        await pendingEmailAddress.attemptVerification({
          code: otp.trim(),
        });

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
        `${API_URL}/api/auth/update-email`,
        { email: newEmail },
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

      setMessage("Login email updated successfully.");

      setEmail("");
      setOtp("");
      setPendingEmailAddress(null);
      setStep("email");
    } catch (err) {
      console.log("VERIFY EMAIL OTP ERROR:", err);

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
    <div className="min-h-full bg-gray-50 p-5">
      <div className="max-w-md mx-auto">
        <div className="mb-5">
          <h1 className="text-3xl font-bold text-black">
            Login Settings
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage your login email address
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          {message && (
            <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700 text-sm font-medium text-center">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <div className="mb-5 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Current Login Email
            </p>

            <p className="text-sm font-medium text-gray-800 mt-1 break-all">
              {currentEmail || "Not available"}
            </p>
          </div>

          {step === "email" && (
            <form onSubmit={sendOtp} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  New Login Email
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter new email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-lg
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    focus:ring-2
                    focus:ring-teal-500
                  "
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  bg-teal-600
                  hover:bg-teal-700
                  disabled:bg-gray-400
                  disabled:cursor-not-allowed
                  text-white
                  py-2.5
                  rounded-lg
                  text-sm
                  font-semibold
                  transition
                "
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={verifyOtp} className="space-y-4">
              <div className="p-3 bg-teal-50 rounded-lg">
                <p className="text-xs text-gray-500">
                  Verification OTP sent to
                </p>

                <p className="text-sm font-semibold text-gray-800 mt-1 break-all">
                  {email}
                </p>
              </div>

              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-semibold text-gray-700 mb-1.5"
                >
                  Verification OTP
                </label>

                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  required
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-lg
                    px-3
                    py-2.5
                    text-sm
                    text-center
                    tracking-[0.3em]
                    outline-none
                    focus:ring-2
                    focus:ring-teal-500
                  "
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  bg-teal-600
                  hover:bg-teal-700
                  disabled:bg-gray-400
                  disabled:cursor-not-allowed
                  text-white
                  py-2.5
                  rounded-lg
                  text-sm
                  font-semibold
                  transition
                "
              >
                {loading
                  ? "Updating..."
                  : "Verify OTP & Update Email"}
              </button>

              <button
                type="button"
                onClick={cancelOtp}
                disabled={loading}
                className="
                  w-full
                  py-2.5
                  rounded-lg
                  border
                  border-gray-300
                  text-gray-700
                  hover:bg-gray-50
                  disabled:opacity-50
                  text-sm
                  font-semibold
                  transition
                "
              >
                Change Email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Setting;