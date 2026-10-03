import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  SignIn,
  Show,
  useClerk,
  useSignUp,
} from "@clerk/react";

import { useAuth } from "../context/useAuth";
import API_URL from "../api";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  const [registerData, setRegisterData] = useState({
    name: "",
    dob: "",
    username: "",
    email: "",
    companyName: "",
    designation: "CEO / Company Owner",
  });

  const [otp, setOtp] = useState("");

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [showMissingRequirements, setShowMissingRequirements] =
    useState(false);

  const [legalAccepted, setLegalAccepted] = useState(false);

  const { user, getToken, login, loading } = useAuth();

  const navigate = useNavigate();

  const clerk = useClerk();

  const { signUp, fetchStatus } = useSignUp();

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    const managementRoles = [
      "admin",
      "manager",
      "hr",
      "tl",
    ];

    if (managementRoles.includes(user.role)) {
      navigate("/admin-dashboard", {
        replace: true,
      });

      return;
    }

    if (user.role === "employee") {
      navigate("/employee-dashboard", {
        replace: true,
      });
    }
  }, [user, loading, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    if (!signUp) {
      setError(
        "Clerk sign-up is not ready. Please try again."
      );
      return;
    }

    if (fetchStatus === "fetching") {
      return;
    }

    try {
      const nameParts = registerData.name
        .trim()
        .split(/\s+/);

      const firstName = nameParts[0] || "";

      const lastName =
        nameParts.length > 1
          ? nameParts.slice(1).join(" ")
          : "";

      sessionStorage.setItem(
        "ems_registration_in_progress",
        "true"
      );

      const { error: createError } =
        await signUp.create({
          emailAddress: registerData.email.trim(),
          firstName,
          lastName,
        });

      if (createError) {
        sessionStorage.removeItem(
          "ems_registration_in_progress"
        );

        setError(
          createError.longMessage ||
            createError.message ||
            "Unable to start registration."
        );

        return;
      }

      const { error: sendCodeError } =
        await signUp.verifications.sendEmailCode();

      if (sendCodeError) {
        sessionStorage.removeItem(
          "ems_registration_in_progress"
        );

        setError(
          sendCodeError.longMessage ||
            sendCodeError.message ||
            "Unable to send verification code."
        );

        return;
      }

      setShowOtp(true);

      setSuccess(
        "Verification code sent to your email."
      );
    } catch (error) {
      sessionStorage.removeItem(
        "ems_registration_in_progress"
      );

      if (error?.errors?.[0]?.longMessage) {
        setError(error.errors[0].longMessage);
      } else if (error?.errors?.[0]?.message) {
        setError(error.errors[0].message);
      } else if (error?.message) {
        setError(error.message);
      } else {
        setError("Unable to start registration.");
      }
    }
  };

  const createEmsUser = async () => {
    const token = await getToken();

    if (!token) {
      throw new Error(
        "Authentication token was not created."
      );
    }

    const response = await axios.post(
      `${API_URL}/api/auth/register`,
      {
        name: registerData.name,
        dob: registerData.dob,
        username: registerData.username,
        email: registerData.email,
        companyName: registerData.companyName,
        designation: "CEO / Company Owner",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.data.success) {
      throw new Error(
        response.data.error ||
          "Company registration failed."
      );
    }

    login(response.data.user);

    sessionStorage.removeItem(
      "ems_registration_in_progress"
    );

    setShowMissingRequirements(false);

    setSuccess(
      "Company account created successfully."
    );

    setRegisterData({
      name: "",
      dob: "",
      username: "",
      email: "",
      companyName: "",
      designation: "CEO / Company Owner",
    });

    setOtp("");
    setLegalAccepted(false);
    setShowOtp(false);
  };

  const completeClerkAndEmsRegistration =
    async () => {
      try {
        if (
          signUp.status ===
          "missing_requirements"
        ) {
          const updateData = {};

          const nameParts = registerData.name
            .trim()
            .split(/\s+/);

          if (
            signUp.missingFields?.includes(
              "first_name"
            )
          ) {
            updateData.firstName =
              nameParts[0] || "";
          }

          if (
            signUp.missingFields?.includes(
              "last_name"
            )
          ) {
            updateData.lastName =
              nameParts.length > 1
                ? nameParts
                    .slice(1)
                    .join(" ")
                : "";
          }

          if (
            signUp.missingFields?.includes(
              "username"
            )
          ) {
            updateData.username =
              registerData.username.trim();
          }

          if (
            signUp.missingFields?.includes(
              "legal_accepted"
            )
          ) {
            if (!legalAccepted) {
              setShowMissingRequirements(true);

              setError(
                "Please accept the Terms of Service and Privacy Policy to continue."
              );

              return;
            }

            updateData.legalAccepted = true;
          }

          if (
            Object.keys(updateData).length > 0
          ) {
            const { error: updateError } =
              await signUp.update(updateData);

            if (updateError) {
              setError(
                updateError.longMessage ||
                  updateError.message ||
                  "Unable to complete Clerk account."
              );

              return;
            }
          }
        }

        if (
          signUp.status ===
          "missing_requirements"
        ) {
          setShowMissingRequirements(true);

          setError(
            `Clerk still requires: ${
              signUp.missingFields?.join(", ") ||
              "additional information"
            }`
          );

          return;
        }

        if (signUp.status !== "complete") {
          setError(
            `Clerk signup is not complete. Status: ${signUp.status}`
          );

          return;
        }

        const {
          error: finalizeError,
        } = await signUp.finalize();

        if (finalizeError) {
          setError(
            finalizeError.longMessage ||
              finalizeError.message ||
              "Unable to finalize Clerk account."
          );

          return;
        }

        await createEmsUser();
      } catch (error) {
        sessionStorage.removeItem(
          "ems_registration_in_progress"
        );

        if (error.response?.data?.error) {
          setError(error.response.data.error);
        } else if (
          error?.errors?.[0]?.longMessage
        ) {
          setError(
            error.errors[0].longMessage
          );
        } else if (
          error?.errors?.[0]?.message
        ) {
          setError(
            error.errors[0].message
          );
        } else if (error?.message) {
          setError(error.message);
        } else {
          setError("Registration failed.");
        }
      }
    };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    if (!signUp) {
      setError(
        "Clerk sign-up is not ready. Please try again."
      );

      return;
    }

    if (fetchStatus === "fetching") {
      return;
    }

    if (!otp.trim()) {
      setError(
        "Please enter the verification code."
      );

      return;
    }

    try {
      const {
        error: verifyError,
      } =
        await signUp.verifications.verifyEmailCode({
          code: otp.trim(),
        });

      if (verifyError) {
        setError(
          verifyError.longMessage ||
            verifyError.message ||
            "Invalid verification code."
        );

        return;
      }

      await completeClerkAndEmsRegistration();
    } catch (error) {
      if (
        error?.errors?.[0]?.longMessage
      ) {
        setError(
          error.errors[0].longMessage
        );
      } else if (
        error?.errors?.[0]?.message
      ) {
        setError(
          error.errors[0].message
        );
      } else if (error?.message) {
        setError(error.message);
      } else {
        setError("Email verification failed.");
      }
    }
  };

  const handleMissingRequirements =
    async (e) => {
      e.preventDefault();

      setError(null);
      setSuccess(null);

      await completeClerkAndEmsRegistration();
    };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;

    setRegisterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBackToLogin = async () => {
    setError(null);
    setSuccess(null);
    setShowOtp(false);
    setOtp("");
    setShowMissingRequirements(false);
    setLegalAccepted(false);

    sessionStorage.removeItem(
      "ems_registration_in_progress"
    );

    try {
      await clerk.signOut();
    } catch {}

    setRegisterData({
      name: "",
      dob: "",
      username: "",
      email: "",
      companyName: "",
      designation: "CEO / Company Owner",
    });

    setIsRegister(false);
  };

  const handleBackToRegister = () => {
    setError(null);
    setSuccess(null);
    setShowOtp(false);
    setOtp("");
    setShowMissingRequirements(false);
    setLegalAccepted(false);

    sessionStorage.removeItem(
      "ems_registration_in_progress"
    );
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#071414] px-3 py-4 sm:px-4 sm:py-8">

      <div className="pointer-events-none absolute left-[-100px] top-[-100px] h-64 w-64 rounded-full bg-teal-500/10 blur-3xl sm:h-80 sm:w-80" />

      <div className="pointer-events-none absolute bottom-[-120px] right-[-100px] h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl sm:h-96 sm:w-96" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/5 blur-3xl" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center">

        <div className="relative mb-1 h-32 w-full max-w-xl sm:mb-4 sm:h-36">

          <div className="absolute left-1/2 top-1 -translate-x-1/2 animate-boy-walk">

            <div className="relative">

              <div className="absolute left-1/2 top-14 z-20 w-max -translate-x-1/2 rounded-2xl bg-white px-3 py-2 text-center shadow-lg sm:left-auto sm:right-[-175px] sm:top-3 sm:translate-x-0 sm:px-5 sm:py-3">

                <p className="text-xs font-medium text-gray-500 sm:text-sm">
                  👋 Hello!
                </p>

                <p className="whitespace-nowrap text-sm font-extrabold text-teal-600 sm:text-lg">
                  Future CEO 🚀
                </p>

                <div className="absolute left-1/2 top-[-5px] h-3 w-3 -translate-x-1/2 rotate-45 bg-white sm:left-[-6px] sm:top-8 sm:translate-x-0" />

              </div>

              <div className="animate-boy-bounce text-5xl drop-shadow-lg sm:text-7xl">
                🧒🏻
              </div>

              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-bold text-teal-700 shadow sm:px-3 sm:py-1 sm:text-xs">
                Future CEO
              </div>

            </div>

          </div>

        </div>

        <div className="mb-4 px-2 text-center text-white sm:mb-5">

          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl md:text-3xl">
            Employee Management System
          </h1>

          <p className="mt-1 text-xs text-teal-200 sm:text-sm">
            Build your team. Grow your dream.
          </p>

        </div>

        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white p-4 shadow-2xl sm:p-6 md:p-7">

          {!isRegister ? (
            <>
              <div className="mb-5">

                <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
                  Welcome Back! 👋
                </h2>

                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                  Sign in to access your account
                </p>

              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 px-3 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 rounded-lg bg-green-50 px-3 py-3 text-sm text-green-600">
                  {success}
                </div>
              )}

              <div className="w-full overflow-hidden">

                <Show when="signed-out">

                  <SignIn
                    routing="path"
                    path="/login"
                    appearance={{
                      elements: {
                        rootBox: "w-full",
                        cardBox:
                          "w-full shadow-none",
                        card:
                          "w-full shadow-none p-0",
                        formFieldInput:
                          "w-full",
                        formButtonPrimary:
                          "bg-teal-600 hover:bg-teal-700",
                      },
                    }}
                  />

                </Show>

              </div>

              <Show when="signed-in">

                <div className="py-6 text-center">

                  {loading ? (
                    <p className="text-sm text-gray-600">
                      Loading your account...
                    </p>
                  ) : user ? (
                    <p className="text-sm text-gray-600">
                      Opening your dashboard...
                    </p>
                  ) : (
                    <>
                      <p className="mb-4 text-sm text-gray-600">
                        You are signed in to Clerk,
                        but your Employee Management
                        account was not found.
                      </p>

                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await clerk.signOut();
                          } catch {}
                        }}
                        className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
                      >
                        Sign Out
                      </button>
                    </>
                  )}

                </div>

              </Show>

              <div className="mt-5 border-t pt-5 text-center">

                <p className="text-xs text-gray-500 sm:text-sm">
                  Don't have a company account?
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setShowOtp(false);
                    setOtp("");
                    setError(null);
                    setSuccess(null);
                    setShowMissingRequirements(
                      false
                    );

                    setRegisterData((prev) => ({
                      ...prev,
                      designation:
                        "CEO / Company Owner",
                    }));
                  }}
                  className="mt-1 text-sm font-bold text-teal-600 transition hover:underline"
                >
                  Create Company Account →
                </button>

              </div>
            </>
          ) : (
            <>
              <div className="mb-5">

                <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
                  Create Company Account 🚀
                </h2>

                <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                  Start your company journey as the CEO.
                </p>

              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 px-3 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 rounded-lg bg-green-50 px-3 py-3 text-sm text-green-600">
                  {success}
                </div>
              )}

              {!showOtp ? (
                <form onSubmit={handleRegister}>

                  <div className="mb-4">

                    <label
                      htmlFor="register-name"
                      className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm"
                    >
                      Full Name
                    </label>

                    <input
                      id="register-name"
                      type="text"
                      name="name"
                      autoComplete="name"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                      placeholder="Enter Full Name"
                      value={registerData.name}
                      onChange={
                        handleRegisterChange
                      }
                      required
                    />

                  </div>

                  <div className="mb-4">

                    <label
                      htmlFor="register-dob"
                      className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm"
                    >
                      Date of Birth
                    </label>

                    <input
                      id="register-dob"
                      type="date"
                      name="dob"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                      value={registerData.dob}
                      onChange={
                        handleRegisterChange
                      }
                      required
                    />

                  </div>

                  <div className="mb-4">

                    <label
                      htmlFor="register-username"
                      className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm"
                    >
                      Username
                    </label>

                    <input
                      id="register-username"
                      type="text"
                      name="username"
                      autoComplete="username"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                      placeholder="Enter Username"
                      value={
                        registerData.username
                      }
                      onChange={
                        handleRegisterChange
                      }
                      required
                    />

                  </div>

                  <div className="mb-4">

                    <label
                      htmlFor="register-email"
                      className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm"
                    >
                      Email
                    </label>

                    <input
                      id="register-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                      placeholder="Enter Email"
                      value={registerData.email}
                      onChange={
                        handleRegisterChange
                      }
                      required
                    />

                  </div>

                  <div className="mb-4">

                    <label
                      htmlFor="register-company"
                      className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm"
                    >
                      Company Name
                    </label>

                    <input
                      id="register-company"
                      type="text"
                      name="companyName"
                      autoComplete="organization"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                      placeholder="Enter Company Name"
                      value={
                        registerData.companyName
                      }
                      onChange={
                        handleRegisterChange
                      }
                      required
                    />

                  </div>

                  <div className="mb-5">

                    <label
                      htmlFor="register-designation"
                      className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm"
                    >
                      Designation
                    </label>

                    <input
                      id="register-designation"
                      type="text"
                      value="CEO / Company Owner"
                      readOnly
                      className="w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5 text-sm text-gray-600"
                    />

                    <p className="mt-1 text-[10px] text-gray-500 sm:text-xs">
                      The person creating the company
                      account is automatically the CEO /
                      Company Owner.
                    </p>

                  </div>

                  <div
                    id="clerk-captcha"
                    className="mb-4 w-full overflow-hidden"
                  />

                  <button
                    type="submit"
                    disabled={
                      fetchStatus === "fetching"
                    }
                    className="w-full rounded-lg bg-teal-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-teal-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {fetchStatus === "fetching"
                      ? "Sending OTP..."
                      : "Continue →"}
                  </button>

                </form>
              ) : showMissingRequirements ? (
                <form
                  onSubmit={
                    handleMissingRequirements
                  }
                >

                  <div className="mb-4 rounded-lg bg-teal-50 p-3">

                    <p className="text-xs leading-5 text-gray-600 sm:text-sm">
                      Your email has been verified.
                      Complete the remaining account
                      requirements.
                    </p>

                  </div>

                  {signUp?.missingFields?.includes(
                    "first_name"
                  ) && (
                    <div className="mb-4">

                      <label className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                        First Name
                      </label>

                      <input
                        type="text"
                        value={
                          registerData.name
                            .trim()
                            .split(/\s+/)[0] || ""
                        }
                        readOnly
                        className="w-full rounded-lg border bg-gray-100 px-3 py-2.5 text-sm"
                      />

                    </div>
                  )}

                  {signUp?.missingFields?.includes(
                    "last_name"
                  ) && (
                    <div className="mb-4">

                      <label className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                        Last Name
                      </label>

                      <input
                        type="text"
                        value={registerData.name
                          .trim()
                          .split(/\s+/)
                          .slice(1)
                          .join(" ")}
                        readOnly
                        className="w-full rounded-lg border bg-gray-100 px-3 py-2.5 text-sm"
                      />

                    </div>
                  )}

                  {signUp?.missingFields?.includes(
                    "username"
                  ) && (
                    <div className="mb-4">

                      <label className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm">
                        Username
                      </label>

                      <input
                        type="text"
                        value={
                          registerData.username
                        }
                        readOnly
                        className="w-full rounded-lg border bg-gray-100 px-3 py-2.5 text-sm"
                      />

                    </div>
                  )}

                  {signUp?.missingFields?.includes(
                    "legal_accepted"
                  ) && (
                    <div className="mb-5">

                      <label className="flex items-start gap-2">

                        <input
                          type="checkbox"
                          checked={
                            legalAccepted
                          }
                          onChange={(e) =>
                            setLegalAccepted(
                              e.target.checked
                            )
                          }
                          required
                          className="mt-1 h-4 w-4"
                        />

                        <span className="text-xs leading-5 text-gray-700 sm:text-sm">
                          I agree to the Terms of
                          Service and Privacy Policy.
                        </span>

                      </label>

                    </div>
                  )}

                  <div
                    id="clerk-captcha"
                    className="mb-4 w-full overflow-hidden"
                  />

                  <button
                    type="submit"
                    disabled={
                      fetchStatus === "fetching"
                    }
                    className="w-full rounded-lg bg-teal-600 py-3 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {fetchStatus === "fetching"
                      ? "Completing..."
                      : "Complete Account"}
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="mt-3 w-full rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Back to Login
                  </button>

                </form>
              ) : (
                <form onSubmit={handleVerifyOtp}>

                  <div className="mb-5 rounded-lg bg-teal-50 p-4 text-center">

                    <p className="text-xs text-gray-600 sm:text-sm">
                      Verification code sent to
                    </p>

                    <p className="mt-1 break-all text-sm font-bold text-teal-700">
                      {registerData.email}
                    </p>

                  </div>

                  <div className="mb-4">

                    <label
                      htmlFor="register-otp"
                      className="mb-1 block text-xs font-medium text-gray-700 sm:text-sm"
                    >
                      Email OTP
                    </label>

                    <input
                      id="register-otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      className="w-full rounded-lg border border-gray-300 px-3 py-3 text-center text-lg font-bold tracking-[0.35em] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 sm:tracking-[0.5em]"
                      placeholder="••••••"
                      value={otp}
                      onChange={(e) =>
                        setOtp(
                          e.target.value.replace(
                            /\D/g,
                            ""
                          )
                        )
                      }
                      required
                    />

                  </div>

                  <button
                    type="submit"
                    disabled={
                      fetchStatus === "fetching"
                    }
                    className="w-full rounded-lg bg-teal-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {fetchStatus === "fetching"
                      ? "Verifying..."
                      : "Verify & Create Company 🚀"}
                  </button>

                  <button
                    type="button"
                    disabled={
                      fetchStatus === "fetching"
                    }
                    onClick={async () => {
                      setError(null);
                      setSuccess(null);

                      try {
                        const {
                          error: resendError,
                        } =
                          await signUp.verifications.sendEmailCode();

                        if (resendError) {
                          setError(
                            resendError.longMessage ||
                              resendError.message ||
                              "Unable to resend OTP."
                          );

                          return;
                        }

                        setSuccess(
                          "A new verification code has been sent."
                        );
                      } catch {
                        setError(
                          "Unable to resend verification code."
                        );
                      }
                    }}
                    className="mt-3 w-full rounded-lg border border-teal-600 py-2.5 text-sm font-semibold text-teal-600 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Resend OTP
                  </button>

                  <button
                    type="button"
                    disabled={
                      fetchStatus === "fetching"
                    }
                    onClick={
                      handleBackToRegister
                    }
                    className="mt-3 w-full rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Change Details
                  </button>

                </form>
              )}

              <div className="mt-6 border-t pt-5 text-center">

                <p className="text-xs text-gray-500 sm:text-sm">
                  Already have a company account?
                </p>

                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="mt-1 text-sm font-bold text-teal-600 hover:underline"
                >
                  ← Back to Login
                </button>

              </div>
            </>
          )}

        </div>

        <p className="mt-5 px-4 text-center text-[10px] text-gray-400 sm:text-xs">
          Secure employee management for growing companies
        </p>

        <p className="mt-1 text-[10px] font-medium text-gray-500">
          © 2026 OM. All rights reserved.
        </p>

      </div>

      <style>{`
        @keyframes boyWalk {
          0% {
            transform: translateX(-150px);
            opacity: 0;
          }

          15% {
            opacity: 1;
          }

          45% {
            transform: translateX(0);
            opacity: 1;
          }

          65% {
            transform: translateX(0);
            opacity: 1;
          }

          100% {
            transform: translateX(150px);
            opacity: 0;
          }
        }

        @keyframes boyWalkMobile {
          0% {
            transform: translateX(-55px);
            opacity: 0;
          }

          20% {
            opacity: 1;
          }

          45% {
            transform: translateX(0);
            opacity: 1;
          }

          65% {
            transform: translateX(0);
            opacity: 1;
          }

          100% {
            transform: translateX(55px);
            opacity: 0;
          }
        }

        @keyframes boyBounce {
          0%,
          100% {
            transform: translateY(0) rotate(-2deg);
          }

          25% {
            transform: translateY(-6px) rotate(2deg);
          }

          50% {
            transform: translateY(0) rotate(-2deg);
          }

          75% {
            transform: translateY(-4px) rotate(2deg);
          }
        }

        .animate-boy-walk {
          animation: boyWalk 5s ease-in-out infinite;
        }

        .animate-boy-bounce {
          animation: boyBounce 0.8s ease-in-out infinite;
        }

        @media (max-width: 640px) {
          .animate-boy-walk {
            animation: boyWalkMobile 4s ease-in-out infinite;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-boy-walk,
          .animate-boy-bounce {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;  