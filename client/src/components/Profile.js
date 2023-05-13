import { faUser } from "@fortawesome/free-solid-svg-icons";
import Personal from "./Personal";
import Academic from "./Academic";
import defaultImage from "./basicProfile.png";
import Experience from "./Experience";
import Publication from "./Publication";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import POR from "./POR";
import OtherDetails from "./OtherDetails";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Popup from "reactjs-popup";
import AutoFillData from "./AutoFillData";
import "./css/Profile.css";
import Reference from "./Refrees";
import ImageUploader from "./ImageUploader";
import axios from "./axios";
// async function getName() {
//   const token = localStorage.getItem("usersdatatoken");
//   //   console.log(token);
//   const response = await fetch("/api/mename", {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   console.log("inside function of gate name");
//   const data = await response.json();
//   return data.name;
// }
export default function Profile({ user, type }) {
  const [renderSideNav, setRenderSideNav] = useState(false);
  const [altProfile, setAltProfile] = useState(defaultImage);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    setIsMobile(mediaQuery.matches);

    const handleResize = () => {
      setIsMobile(mediaQuery.matches);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const [popUpImageForm, setPopUpImageForm] = useState(false);
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  const [activeComponent, setActiveComponent] = useState("personal");
  const [name, setName] = useState("");
  const history = useNavigate();
  const handleButtonClick = (componentName) => {
    setActiveComponent(componentName);
    if(isMobile){
      setRenderSideNav(false);
    }
    console.log(activeComponent);
  };

  useEffect(() => {
    if (type === "") {
      history("*");
    }
  }, []);
  const url = `/personal/${user}`;
  useEffect(() => {
    axios.get(url).then((response) => {
      if (response.status === 200) {
        const myData = response.data.personals[0];
        setName(myData.name);
        if (myData.profile_image_url === "#") {
          setAltProfile(defaultImage);
        } else {
          setAltProfile(myData.profile_image_url);
        }
      }
    });
  });

  return (
    <>
      {/* {screenWidth >= 1024 ? ( */}
      <>
        {type === "student" ? (
          <div style={{ display: isMobile ? "" : "flex" }}>
            {!isMobile ? (
              <div className="outer-container">
                <aside class="flex flex-col w-200 h-screen px-7 py-2 bg-white   rtl:border-2 dark:bg-gray-100 dark:border-gray-200">
                  <div style={{ marginLeft: "1rem" }}>
                    <div class="relative mt-9">
                      <div
                        style={{
                          position: "relative",
                          display: "inline-block",
                          // opacity: isHovered ? 0.4 : 1,
                          marginLeft: "1rem",
                        }}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                      >
                        <img
                          src={altProfile}
                          // src={ProfileSettingsImage}
                          className="rounded-none lg:rounded-lg shadow-2xl hidden lg:block"
                          alt={defaultImage}
                          style={{
                            width: "200px",
                            height: "200px",
                            borderRadius: "50%",
                            marginLeft: "2rem",
                            padding: "0",
                            margin: "0",
                            marginBottom: "1rem",
                            opacity: isHovered ? "0.5" : "",
                          }}
                        />
                        {isHovered && (
                          <Popup
                            trigger={
                              <button
                                style={{
                                  position: "absolute",
                                  top: "50%",
                                  left: "50%",
                                  color: "white",
                                  transform: "translate(-50%, -50%)",
                                  background: "gray",
                                  border: "1px solid white",
                                  padding: "5px",
                                  zIndex: "1rem",
                                  borderRadius: "5rem",
                                  width: "4rem",
                                }}
                                onClick={() => setPopUpImageForm(true)}
                              >
                                Edit
                              </button>
                            }
                            modal
                            closeOnDocumentClick
                            overlayStyle={{
                              background: "rgba(0, 0, 0, 0.7)",
                              zIndex: 1000,
                            }}
                            contentStyle={{
                              width: "45%",
                              height: "45%",
                              padding: "0",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              borderRadius: "5px",
                              boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
                              backgroundColor: "#fff",
                            }}
                          >
                            {(close) => (
                              <>
                                <ImageUploader
                                  user={user}
                                  type={type}
                                  onClose={close}
                                />
                              </>
                            )}
                          </Popup>
                        )}
                      </div>
                    </div>
                    <p
                      style={{
                        fontWeight: "550",
                        fontSize: "1rem",
                        // marginLeft: "1rem",
                        width: "100%",
                        textDecoration: "underline",
                      }}
                      class="px-8"
                    >
                      {name}
                    </p>
                  </div>
                  <div
                    class="flex flex-col justify-between flex-1  mt-6"
                    style={{ paddingBottom: "0" }}
                  >
                    <nav>
                      <Popup
                        trigger={
                          <button className="flex items-center px-7 py-2 navButton">
                            Parse Resume
                          </button>
                        }
                        modal
                        closeOnDocumentClick
                        overlayStyle={{
                          background: "rgba(0, 0, 0, 0.7)",
                          zIndex: 1000,
                        }}
                        contentStyle={{
                          width: "30%",
                          height: "30%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: "5px",
                          boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
                          backgroundColor: "#fff",
                        }}
                      >
                        {(close) => (
                          <>
                            <AutoFillData
                              user={user}
                              type={type}
                              onClose={close}
                            />
                          </>
                        )}
                      </Popup>
                      <button
                        style={{ color: "red !important" }}
                        className={
                          activeComponent === "personal"
                            ? "flex items-center px-1 py-2 active"
                            : "flex items-center px-1 py-2 navButton"
                        }
                        onClick={() => {
                          handleButtonClick("personal");
                        }}
                      >
                        <span class="mx-4 font-medium">Personal Details</span>
                      </button>
                      <button
                        className={
                          activeComponent === "academic"
                            ? "flex items-center px-1 py-2 active"
                            : "flex items-center px-1 py-2 navButton"
                        }
                        onClick={() => {
                          handleButtonClick("academic");
                        }}
                      >
                        <span class="mx-4 font-medium">Education Details</span>
                      </button>
                      <button
                        className={
                          activeComponent === "experience"
                            ? "flex items-center px-1 py-2 active"
                            : "flex items-center px-1 py-2 navButton"
                        }
                        onClick={() => {
                          handleButtonClick("experience");
                        }}
                      >
                        <span class="mx-4 font-medium">Work Experience</span>
                      </button>
                      <button
                        className={
                          activeComponent === "publication"
                            ? "flex items-center px-1 py-2 active"
                            : "flex items-center px-1 py-2 navButton"
                        }
                        onClick={() => {
                          handleButtonClick("publication");
                        }}
                      >
                        <span class="mx-4 font-medium">Publications</span>
                      </button>
                      <button
                        className={
                          activeComponent === "references"
                            ? "flex items-center px-1 py-2 active"
                            : "flex items-center px-1 py-2 navButton"
                        }
                        onClick={() => {
                          handleButtonClick("references");
                        }}
                      >
                        <span class="mx-4 font-medium">References</span>
                      </button>
                      <button
                        className={
                          activeComponent === "por"
                            ? "flex items-center px-1 py-2 active"
                            : "flex items-center px-1 py-2 navButton"
                        }
                        onClick={() => {
                          handleButtonClick("por");
                        }}
                      >
                        <span class="mx-4 font-medium">
                          Positions of Responsibility
                        </span>
                      </button>
                      <button
                        className={
                          activeComponent === "doc"
                            ? "flex items-center px-1 py-2 active"
                            : "flex items-center px-1 py-2 navButton"
                        }
                        onClick={() => {
                          handleButtonClick("doc");
                        }}
                      >
                        <span class="mx-4 font-medium">Uploaded Documents</span>
                      </button>
                    </nav>
                  </div>
                </aside>
              </div>
            ) : (
              <>
                {renderSideNav ? (
                  <>
                    <button
                    style={{
                      border : '1px solid #ecdede',
                      width : '90%',
                      margin : '0',
                      padding : '0.7rem',
                      marginTop : '1rem',
                    }}
                      onClick={() => {
                        setRenderSideNav(false);
                      }}
                    >
                      Hide 🔼
                    </button>

                    <div className="outer-container">
                      <aside class="flex flex-col w-200 h-screen px-7 py-2 bg-white   rtl:border-2 dark:bg-gray-100 dark:border-gray-200">
                        <div style={{ marginLeft: "1rem" }}>
                          <div class="relative mt-9">
                            <div
                              style={{
                                position: "relative",
                                display: "inline-block",
                                // opacity: isHovered ? 0.4 : 1,
                                marginLeft: "1rem",
                              }}
                              onMouseEnter={handleMouseEnter}
                              onMouseLeave={handleMouseLeave}
                            >
                              <img
                                src={altProfile}
                                // src={ProfileSettingsImage}
                                className="rounded-none lg:rounded-lg shadow-2xl hidden lg:block"
                                alt={defaultImage}
                                style={{
                                  width: "200px",
                                  height: "200px",
                                  borderRadius: "50%",
                                  marginLeft: "2rem",
                                  padding: "0",
                                  margin: "0",
                                  marginBottom: "1rem",
                                  opacity: isHovered ? "0.5" : "",
                                }}
                              />
                              {isHovered && (
                                <Popup
                                  trigger={
                                    <button
                                      style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        color: "white",
                                        transform: "translate(-50%, -50%)",
                                        background: "gray",
                                        border: "1px solid white",
                                        padding: "5px",
                                        zIndex: "1rem",
                                        borderRadius: "5rem",
                                        width: "4rem",
                                      }}
                                      onClick={() => setPopUpImageForm(true)}
                                    >
                                      Edit
                                    </button>
                                  }
                                  modal
                                  closeOnDocumentClick
                                  overlayStyle={{
                                    background: "rgba(0, 0, 0, 0.7)",
                                    zIndex: 1000,
                                  }}
                                  contentStyle={{
                                    width: "45%",
                                    height: "45%",
                                    padding: "0",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderRadius: "5px",
                                    boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
                                    backgroundColor: "#fff",
                                  }}
                                >
                                  {(close) => (
                                    <>
                                      <ImageUploader
                                        user={user}
                                        type={type}
                                        onClose={close}
                                      />
                                    </>
                                  )}
                                </Popup>
                              )}
                            </div>
                          </div>
                          <p
                            style={{
                              fontWeight: "550",
                              fontSize: "1rem",
                              // marginLeft: "1rem",
                              width: "100%",
                              textDecoration: "underline",
                            }}
                            class="px-8"
                          >
                            {name}
                          </p>
                        </div>
                        <div
                          class="flex flex-col justify-between flex-1  mt-6"
                          style={{ paddingBottom: "0" }}
                        >
                          <nav>
                            <Popup
                              trigger={
                                <button className="flex items-center px-7 py-2 navButton">
                                  Parse Resume
                                </button>
                              }
                              modal
                              closeOnDocumentClick
                              overlayStyle={{
                                background: "rgba(0, 0, 0, 0.7)",
                                zIndex: 1000,
                              }}
                              contentStyle={{
                                width: "30%",
                                height: "30%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: "5px",
                                boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
                                backgroundColor: "#fff",
                              }}
                            >
                              {(close) => (
                                <>
                                  <AutoFillData
                                    user={user}
                                    type={type}
                                    onClose={close}
                                  />
                                </>
                              )}
                            </Popup>
                            <button
                              style={{ color: "red !important" }}
                              className={
                                activeComponent === "personal"
                                  ? "flex items-center px-1 py-2 active"
                                  : "flex items-center px-1 py-2 navButton"
                              }
                              onClick={() => {
                                handleButtonClick("personal");
                              }}
                            >
                              <span class="mx-4 font-medium">
                                Personal Details
                              </span>
                            </button>
                            <button
                              className={
                                activeComponent === "academic"
                                  ? "flex items-center px-1 py-2 active"
                                  : "flex items-center px-1 py-2 navButton"
                              }
                              onClick={() => {
                                handleButtonClick("academic");
                              }}
                            >
                              <span class="mx-4 font-medium">
                                Education Details
                              </span>
                            </button>
                            <button
                              className={
                                activeComponent === "experience"
                                  ? "flex items-center px-1 py-2 active"
                                  : "flex items-center px-1 py-2 navButton"
                              }
                              onClick={() => {
                                handleButtonClick("experience");
                              }}
                            >
                              <span class="mx-4 font-medium">
                                Work Experience
                              </span>
                            </button>
                            <button
                              className={
                                activeComponent === "publication"
                                  ? "flex items-center px-1 py-2 active"
                                  : "flex items-center px-1 py-2 navButton"
                              }
                              onClick={() => {
                                handleButtonClick("publication");
                              }}
                            >
                              <span class="mx-4 font-medium">Publications</span>
                            </button>
                            <button
                              className={
                                activeComponent === "references"
                                  ? "flex items-center px-1 py-2 active"
                                  : "flex items-center px-1 py-2 navButton"
                              }
                              onClick={() => {
                                handleButtonClick("references");
                              }}
                            >
                              <span class="mx-4 font-medium">References</span>
                            </button>
                            <button
                              className={
                                activeComponent === "por"
                                  ? "flex items-center px-1 py-2 active"
                                  : "flex items-center px-1 py-2 navButton"
                              }
                              onClick={() => {
                                handleButtonClick("por");
                              }}
                            >
                              <span class="mx-4 font-medium">
                                Positions of Responsibility
                              </span>
                            </button>
                            <button
                              className={
                                activeComponent === "doc"
                                  ? "flex items-center px-1 py-2 active"
                                  : "flex items-center px-1 py-2 navButton"
                              }
                              onClick={() => {
                                handleButtonClick("doc");
                              }}
                            >
                              <span class="mx-4 font-medium">
                                Uploaded Documents
                              </span>
                            </button>
                          </nav>
                        </div>
                      </aside>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                    style={{
                      border : '1px solid #ecdede',
                      width : '90%',
                      margin : '0',
                      padding : '0.7rem',
                      marginTop : '1rem',
                    }}
                      onClick={() => {
                        setRenderSideNav(true);
                      }}
                    >
                      Show more 🔽
                    </button>
                  </>
                )}
              </>
            )}

            <div
              className="Profile"
              style={{ marginLeft: isMobile ? "0rem" : "0.1rem" }}
            >
              <section
                style={{ padding: "0", margin: "0" }}
                className="renderComponent"
              >
                {activeComponent === "personal" ? (
                  <>
                    <Personal user={user} type={type} />
                  </>
                ) : (
                  <></>
                )}
                {activeComponent === "academic" ? (
                  <Academic user={user} type={type} />
                ) : (
                  <></>
                )}
                {activeComponent === "experience" ? (
                  <Experience user={user} type={type} />
                ) : (
                  <></>
                )}
                {activeComponent === "publication" ? (
                  <Publication user={user} type={type} />
                ) : (
                  <></>
                )}
                {activeComponent === "references" ? (
                  <Reference user={user} type={type} />
                ) : (
                  <></>
                )}
                {activeComponent === "por" ? (
                  <POR user={user} type={type} />
                ) : (
                  <></>
                )}
                {activeComponent === "doc" ? (
                  <OtherDetails user={user} type={type} />
                ) : (
                  <></>
                )}
              </section>
            </div>
          </div>
        ) : (
          <>{/* INSTITUE PROFILE NAVBAR */}</>
        )}
      </>
      ) : (<>{/* INSTITUTE PROFILE SECTION */}</>
      {/* )} */}
    </>
  );
}
