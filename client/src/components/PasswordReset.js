import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useLocation } from "react-router-dom";
import axios from "./axios";
import './css/Signup.css';

const PasswordReset = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const location = useLocation();
  const userType = new URLSearchParams(location.search).get("userType");

  const setVal = (e) => {
    setEmail(e.target.value);
  };

  const sendLink = async (e) => {
    e.preventDefault();

    if (email === "") {
      toast.error("Email is required!", {
        position: "top-center",
      });
    } else if (!email.includes("@")) {
      toast.warning("Include @ in your email!", {
        position: "top-center",
      });
    } else {
      axios
        .post("/api/sendpasswordlink", { email, userType })
        .then((res) => {
          setMessage(res.data.message);
        })
        .catch((err) => console.error(err));
    }
  };

  return (
    <div style={{marginTop:'170px'}}>
    <div class="flex w-full max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-800 lg:max-w-4xl">
      <div className="hidden bg-cover lg:block lg:w-1/2" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1606660265514-358ebbadc80d?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1575&q=80")'}}></div>
      <div class="w-full px-6 py-8 md:px-8 lg:w-1/2">
        <div class="flex justify-center mx-auto">
          <img class="w-auto h-7 sm:h-8" src="https://upload.wikimedia.org/wikipedia/en/f/f9/Indian_Institute_of_Technology_Ropar_logo.png" alt=""/>
        </div>
        <p class="mt-3 text-xl text-center text-gray-600 dark:text-gray-200">
            Reset Password
        </p>

        <div class="mt-4">
            <label class="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200" for="LoggingEmailAddress">Email Address</label>
            <input
            id="LoggingEmailAddress"
            class="block w-full px-4 py-2 text-gray-700 bg-white border rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 focus:ring-opacity-40 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-blue-300"
            type="email"
            value={email}
            onChange={setVal} />
        </div>

        <div class="mt-6">
            <button onClick={sendLink} class="w-full px-6 py-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-gray-800 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring focus:ring-gray-300 focus:ring-opacity-50">
                Send Link
            </button>
        </div>
      </div>
    </div>

    </div>
  );
};

export default PasswordReset;
