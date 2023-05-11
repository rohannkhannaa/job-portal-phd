import React from "react";
import defaultImage from "./basicProfile.png";
import axios from "./axios";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate, useLocation } from 'react-router-dom';


const ExperienceCard = ({ companyName, experience, name, date, email }) => {


  const [altProfile, setAltProfile] = useState(defaultImage)

  useEffect(() => {

    // console.log(email);

    if (email) {

      axios.post(`/api/getimage`, { email: email })
        .then((response) => {
          if (response.data.status === 200) {
            // handle success
            // console.log(response.data.image);

            if (response.data.image === "#") {
              setAltProfile(defaultImage);
            }
            else {
              setAltProfile(response.data.image);
            }

          }
        })
        .catch((err) => console.log(err));
    }



  }, []);


  return (

    <>
      <section class="bg-black dark:bg-gray-900">
        <div class="relative flex">
          <div class="min-h-screen lg:w-1/3"></div>
          <div class="hidden w-3/4 min-h-screen bg-gray-100 dark:bg-gray-800 lg:block"></div>

          <div
            class="container flex flex-col justify-center w-full min-h-screen px-6 py-10 mx-auto lg:absolute lg:inset-x-0">
            <div class="mt-10 lg:mt-20 lg:flex lg:items-center">
              <img class="object-cover object-center w-full lg:w-[32rem] rounded-lg h-96" src={altProfile} alt={defaultImage} />

              <div class="mt-8 lg:px-10 lg:mt-0">
                <h1 class="text-2xl font-semibold text-gray-800 dark:text-white lg:w-72">
                  {companyName}
                </h1>

                <p class="max-w-lg mt-6 text-gray-500 dark:text-gray-400">
                  “ {experience} ”
                </p>

                <h3 class="mt-6 text-lg font-medium text-blue-500">{name}</h3>
                <h6 class="mt-6 text-lg font-medium text-blue-500">{date}</h6>
                <h6 class="mt-6 text-lg font-medium text-blue-500">{email}</h6>
                {/* <p class="text-gray-600 dark:text-gray-300">Marketing Manager at Stech</p> */}
              </div>
            </div>

            <div class="flex items-center justify-between mt-12 lg:justify-start">
              <button title="left arrow" class="p-2 text-white-800 transition-colors duration-300 border rounded-full rtl:-scale-x-100 bg-white dark:border-white-700 dark:text-white-200 dark:hover:bg-white-800 hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>


              <button title="right arrow" class="p-2 text-gray-800 transition-colors duration-300 border rounded-full rtl:-scale-x-100 bg-white dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 lg:mx-6 hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

    </>
  );
};

export default ExperienceCard;
