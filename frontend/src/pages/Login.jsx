import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  SignIn,
  Show,
  useClerk,
  useSignUp,
} from "@clerk/react";

import { useAuth } from "../context/useAuth";

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
    if (loading) {
      return;
    }

    if (!user) {
      return;
    }

    // Management roles
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

    // Employee
    if (user.role === "employee") {
      navigate("/employee-dashboard", {
        replace: true,
      });

      return;
    }

    console.log("UNKNOWN USER ROLE:", user.role);
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
        console.log(
          "CLERK SIGNUP CREATE ERROR:",
          createError
        );

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

      console.log(
        "CLERK SIGNUP CREATED:",
        signUp.id
      );

      
      const { error: sendCodeError } =
        await signUp.verifications.sendEmailCode();

      if (sendCodeError) {
        console.log(
          "CLERK SEND OTP ERROR:",
          sendCodeError
        );

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

      console.log("CLERK EMAIL OTP SENT");

      setShowOtp(true);

      setSuccess(
        "Verification code sent to your email."
      );
    } catch (error) {
      console.log(
        "REGISTER START ERROR:",
        error
      );

      sessionStorage.removeItem(
        "ems_registration_in_progress"
      );

      if (error?.errors?.[0]?.longMessage) {
        setError(
          error.errors[0].longMessage
        );
      } else if (error?.errors?.[0]?.message) {
        setError(
          error.errors[0].message
        );
      } else if (error?.message) {
        setError(error.message);
      } else {
        setError(
          "Unable to start registration."
        );
      }
    }
  };

  
  const createEmsUser = async () => {
    console.log("CREATING EMS USER...");

    const token = await getToken();

    if (!token) {
      throw new Error(
        "Authentication token was not created."
      );
    }

    console.log("CLERK TOKEN FOUND");

    const response = await axios.post(
      "http://localhost:5000/api/auth/register",
      {
        name: registerData.name,
        dob: registerData.dob,
        username: registerData.username,
        email: registerData.email,
        companyName: registerData.companyName,

        // Company creator is always CEO / Company Owner
        designation: "CEO / Company Owner",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(
      "EMS REGISTER RESPONSE:",
      response.data
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

    console.log(
      "EMS COMPANY REGISTRATION COMPLETE"
    );
  };

  
  const completeClerkAndEmsRegistration =
    async () => {
      try {
        console.log(
          "CLERK SIGNUP STATUS BEFORE COMPLETE:",
          signUp.status
        );

        console.log(
          "CLERK MISSING FIELDS:",
          signUp.missingFields
        );

        
        if (
          signUp.status ===
          "missing_requirements"
        ) {
          const updateData = {};

          const nameParts =
            registerData.name
              .trim()
              .split(/\s+/);

          // FIRST NAME
          if (
            signUp.missingFields?.includes(
              "first_name"
            )
          ) {
            updateData.firstName =
              nameParts[0] || "";
          }

          // LAST NAME
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

          // USERNAME
          if (
            signUp.missingFields?.includes(
              "username"
            )
          ) {
            updateData.username =
              registerData.username.trim();
          }

          // LEGAL ACCEPTANCE
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

          console.log(
            "CLERK UPDATE DATA:",
            updateData
          );

          
          if (
            Object.keys(updateData).length > 0
          ) {
            const { error: updateError } =
              await signUp.update(updateData);

            if (updateError) {
              console.log(
                "CLERK UPDATE ERROR:",
                updateError
              );

              setError(
                updateError.longMessage ||
                  updateError.message ||
                  "Unable to complete Clerk account."
              );

              return;
            }
          }

          console.log(
            "CLERK STATUS AFTER UPDATE:",
            signUp.status
          );

          console.log(
            "CLERK MISSING FIELDS AFTER UPDATE:",
            signUp.missingFields
          );
        }

        
        if (
          signUp.status ===
          "missing_requirements"
        ) {
          console.log(
            "CLERK STILL HAS REQUIREMENTS:",
            signUp.missingFields
          );

          setShowMissingRequirements(true);

          setError(
            `Clerk still requires: ${
              signUp.missingFields?.join(", ") ||
              "additional information"
            }`
          );

          return;
        }

        if (
          signUp.status !== "complete"
        ) {
          console.log(
            "CLERK SIGNUP NOT COMPLETE:",
            {
              status: signUp.status,
              missingFields:
                signUp.missingFields,
            }
          );

          setError(
            `Clerk signup is not complete. Status: ${signUp.status}`
          );

          return;
        }

        
        console.log(
          "FINALIZING CLERK SIGNUP..."
        );

        const {
          error: finalizeError,
        } = await signUp.finalize();

        if (finalizeError) {
          console.log(
            "CLERK FINALIZE ERROR:",
            finalizeError
          );

          setError(
            finalizeError.longMessage ||
              finalizeError.message ||
              "Unable to finalize Clerk account."
          );

          return;
        }

        console.log(
          "CLERK SIGNUP FINALIZED"
        );

        
        await createEmsUser();
      } catch (error) {
        console.log(
          "COMPLETE REGISTRATION ERROR:",
          error
        );

        sessionStorage.removeItem(
          "ems_registration_in_progress"
        );

        if (error.response?.data?.error) {
          setError(
            error.response.data.error
          );
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
          setError(
            "Registration failed."
          );
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
      console.log(
        "VERIFYING EMAIL OTP..."
      );

      const {
        error: verifyError,
      } =
        await signUp.verifications.verifyEmailCode({
          code: otp.trim(),
        });

      if (verifyError) {
        console.log(
          "CLERK VERIFY OTP ERROR:",
          verifyError
        );

        setError(
          verifyError.longMessage ||
            verifyError.message ||
            "Invalid verification code."
        );

        return;
      }

      console.log(
        "CLERK EMAIL VERIFICATION SUCCESS"
      );

      console.log(
        "CLERK STATUS AFTER OTP:",
        signUp.status
      );

      console.log(
        "CLERK MISSING FIELDS AFTER OTP:",
        signUp.missingFields
      );

      
      await completeClerkAndEmsRegistration();
    } catch (error) {
      console.log(
        "VERIFY OTP ERROR:",
        error
      );

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
        setError(
          "Email verification failed."
        );
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
    } catch (error) {
      console.log(
        "SIGN OUT ERROR:",
        error
      );
    }

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
    <div
      className="
        flex flex-col
        items-center
        justify-center
        min-h-screen
        bg-gradient-to-b
        from-teal-600
        from-50%
        to-gray-100
        to-50%
        py-8
      "
    >
      <h2 className="font-bitter text-3xl text-white mb-6">
        Employee Management System
      </h2>

      <div
        className="
          border
          shadow
          p-6
          w-[90%]
          max-w-md
          bg-white
          rounded
        "
      >
        

        {!isRegister ? (
          <>
            <h2 className="text-2xl font-bold mb-4">
              Login
            </h2>

            {error && (
              <p className="text-red-500 mb-4">
                {error}
              </p>
            )}

            {success && (
              <p className="text-green-600 mb-4">
                {success}
              </p>
            )}

            <Show when="signed-out">
              <SignIn
                routing="path"
                path="/login"
              />
            </Show>

            <Show when="signed-in">
              <div className="text-center py-6">
                {loading ? (
                  <p className="text-gray-600">
                    Loading your account...
                  </p>
                ) : user ? (
                  <p className="text-gray-600">
                    Opening your dashboard...
                  </p>
                ) : (
                  <>
                    <p className="text-gray-600 mb-4">
                      You are signed in to Clerk,
                      but your Employee Management
                      account was not found.
                    </p>

                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await clerk.signOut();
                        } catch (error) {
                          console.log(
                            "SIGN OUT ERROR:",
                            error
                          );
                        }
                      }}
                      className="
                        bg-teal-600
                        text-white
                        px-5
                        py-2
                        rounded
                        hover:bg-teal-700
                      "
                    >
                      Sign Out
                    </button>
                  </>
                )}
              </div>
            </Show>

            <div className="text-center mt-5">
              <p className="text-gray-600">
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
                  setShowMissingRequirements(false);

                  setRegisterData((prev) => ({
                    ...prev,
                    designation:
                      "CEO / Company Owner",
                  }));
                }}
                className="
                  text-teal-600
                  font-semibold
                  hover:underline
                  mt-1
                "
              >
                Create Company Account
              </button>
            </div>
          </>
        ) : (
          <>
            

            <h2 className="text-2xl font-bold mb-4">
              Create Company Account
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              The person creating a new company account
              becomes the CEO / Company Owner.
            </p>

            {error && (
              <p className="text-red-500 mb-4">
                {error}
              </p>
            )}

            {success && (
              <p className="text-green-600 mb-4">
                {success}
              </p>
            )}

            

            {!showOtp ? (
              <form onSubmit={handleRegister}>
                {/* Full Name */}
                <div className="mb-4">
                  <label
                    htmlFor="register-name"
                    className="block text-gray-700 mb-1"
                  >
                    Full Name
                  </label>

                  <input
                    id="register-name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Enter Full Name"
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>

                {/* DOB */}
                <div className="mb-4">
                  <label
                    htmlFor="register-dob"
                    className="block text-gray-700 mb-1"
                  >
                    Date of Birth
                  </label>

                  <input
                    id="register-dob"
                    type="date"
                    name="dob"
                    className="w-full px-3 py-2 border rounded"
                    value={registerData.dob}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>

                {/* Username */}
                <div className="mb-4">
                  <label
                    htmlFor="register-username"
                    className="block text-gray-700 mb-1"
                  >
                    Username
                  </label>

                  <input
                    id="register-username"
                    type="text"
                    name="username"
                    autoComplete="username"
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Enter Username"
                    value={registerData.username}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>

                {/* Email */}
                <div className="mb-4">
                  <label
                    htmlFor="register-email"
                    className="block text-gray-700 mb-1"
                  >
                    Email
                  </label>

                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Enter Email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>

                {/* Company */}
                <div className="mb-4">
                  <label
                    htmlFor="register-company"
                    className="block text-gray-700 mb-1"
                  >
                    Company Name
                  </label>

                  <input
                    id="register-company"
                    type="text"
                    name="companyName"
                    autoComplete="organization"
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Enter Company Name"
                    value={registerData.companyName}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>

                {/* Designation */}
                <div className="mb-4">
                  <label
                    htmlFor="register-designation"
                    className="block text-gray-700 mb-1"
                  >
                    Designation
                  </label>

                  <input
                    id="register-designation"
                    type="text"
                    name="designation"
                    value="CEO / Company Owner"
                    readOnly
                    className="
                      w-full
                      px-3
                      py-2
                      border
                      rounded
                      bg-gray-100
                      text-gray-700
                      cursor-not-allowed
                    "
                  />

                  <p className="text-xs text-gray-500 mt-1">
                    The person creating a new company
                    account is automatically the CEO /
                    Company Owner.
                  </p>
                </div>

                <div
                  id="clerk-captcha"
                  className="mb-4"
                />

                {/* Send OTP */}
                <button
                  type="submit"
                  disabled={
                    fetchStatus === "fetching"
                  }
                  className="
                    w-full
                    bg-teal-600
                    text-white
                    py-2
                    rounded
                    cursor-pointer
                    hover:bg-teal-700
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  {fetchStatus === "fetching"
                    ? "Sending OTP..."
                    : "Send OTP"}
                </button>
              </form>
            ) : showMissingRequirements ? (
              

              <form
                onSubmit={
                  handleMissingRequirements
                }
              >
                <p className="text-gray-600 mb-4">
                  Your email has been verified.
                  Please complete the remaining
                  account requirements.
                </p>

                {/* First Name */}
                {signUp?.missingFields?.includes(
                  "first_name"
                ) && (
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-1">
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
                      className="
                        w-full
                        px-3
                        py-2
                        border
                        rounded
                        bg-gray-100
                      "
                    />
                  </div>
                )}

                {/* Last Name */}
                {signUp?.missingFields?.includes(
                  "last_name"
                ) && (
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-1">
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
                      className="
                        w-full
                        px-3
                        py-2
                        border
                        rounded
                        bg-gray-100
                      "
                    />
                  </div>
                )}

                {/* Username */}
                {signUp?.missingFields?.includes(
                  "username"
                ) && (
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-1">
                      Username
                    </label>

                    <input
                      type="text"
                      value={
                        registerData.username
                      }
                      readOnly
                      className="
                        w-full
                        px-3
                        py-2
                        border
                        rounded
                        bg-gray-100
                      "
                    />
                  </div>
                )}

                {/* Legal Acceptance */}
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
                        className="mt-1"
                      />

                      <span className="text-sm text-gray-700">
                        I agree to the Terms of
                        Service and Privacy
                        Policy.
                      </span>
                    </label>
                  </div>
                )}

                <div
                  id="clerk-captcha"
                  className="mb-4"
                />

                <button
                  type="submit"
                  disabled={
                    fetchStatus === "fetching"
                  }
                  className="
                    w-full
                    bg-teal-600
                    text-white
                    py-2
                    rounded
                    hover:bg-teal-700
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  {fetchStatus === "fetching"
                    ? "Completing Account..."
                    : "Complete Account"}
                </button>

                <button
                  type="button"
                  onClick={
                    handleBackToLogin
                  }
                  className="
                    w-full
                    mt-3
                    border
                    border-gray-300
                    text-gray-700
                    py-2
                    rounded
                    hover:bg-gray-100
                  "
                >
                  Back to Login
                </button>
              </form>
            ) : (
              

              <form onSubmit={handleVerifyOtp}>
                <p className="text-gray-600 mb-4">
                  Enter the verification code
                  sent to:
                </p>

                <p className="font-semibold mb-4">
                  {registerData.email}
                </p>

                <div className="mb-4">
                  <label
                    htmlFor="register-otp"
                    className="block text-gray-700 mb-1"
                  >
                    Email OTP
                  </label>

                  <input
                    id="register-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value)
                    }
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    fetchStatus === "fetching"
                  }
                  className="
                    w-full
                    bg-teal-600
                    text-white
                    py-2
                    rounded
                    hover:bg-teal-700
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  {fetchStatus === "fetching"
                    ? "Verifying..."
                    : "Verify Email & Create Company"}
                </button>

                {/* Resend OTP */}
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
                    } catch (error) {
                      console.log(
                        "RESEND OTP ERROR:",
                        error
                      );

                      setError(
                        "Unable to resend verification code."
                      );
                    }
                  }}
                  className="
                    w-full
                    mt-3
                    border
                    border-teal-600
                    text-teal-600
                    py-2
                    rounded
                    hover:bg-teal-50
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  Resend OTP
                </button>

                {/* Change Details */}
                <button
                  type="button"
                  disabled={
                    fetchStatus === "fetching"
                  }
                  onClick={
                    handleBackToRegister
                  }
                  className="
                    w-full
                    mt-3
                    border
                    border-gray-300
                    text-gray-700
                    py-2
                    rounded
                    hover:bg-gray-100
                  "
                >
                  Change Details
                </button>
              </form>
            )}

            {/* Back to Login */}
            <div className="text-center mt-5">
              <p className="text-gray-600">
                Already have a company account?
              </p>

              <button
                type="button"
                onClick={
                  handleBackToLogin
                }
                className="
                  text-teal-600
                  font-semibold
                  hover:underline
                  mt-1
                "
              >
                Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;


