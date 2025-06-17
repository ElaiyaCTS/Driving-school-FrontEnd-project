import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";
import { URL } from "../App";
import logo from "../assets/logo.png";
import { initFlowbite } from "flowbite";
import { extractDriveFileId } from "../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "./AuthContext/AuthContext"; // adjust path as needed

function Navbar() {
  const {role, user,setUser,setRole,clearAuthState} =  useRole();

  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState({ Name: null, photo: null });

  useEffect(() => {
        initFlowbite();
    if (!role) {
      navigate("/");
    } else {
      setIsLogin(user);
      // console.log(user);
      
    }
  }, [role]);

  return (
    <React.Fragment>
      <nav className="fixed top-0 z-50 w-full flex flex-col justify-center h-20 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start rtl:justify-end">
              <button
                id="sidebar-btn"
                data-drawer-target="logo-sidebar"
                data-drawer-show="logo-sidebar"
                aria-controls="logo-sidebar"
                type="button"
                className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              >
                <span className="sr-only">Open sidebar</span>
                <svg
                  className="w-6 h-6"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                  ></path>
                </svg>
              </button>
              <Link
                reloadDocument
                className="flex items-center ms-2 mt-1 gap-3"
              >
                <img src={logo} className="w-8 sm:w-10" alt=" " />
                <h1 className="text-lg font-extrabold sm:text-2xl whitespace-nowrap text-blue-600 dark:text-white">
                  Ganesh Driving School
                </h1>
              </Link>
            </div>
            <div className="hidden sm:flex items-center">
              <div className="flex items-center">
                <div>
                  <button
                    type="button"
                    className="flex text-sm rounded-full focus:ring-2 focus:ring-fitness-300 dark:focus:ring-fitness-500"
                  >
                    <span className="sr-only">Open user menu</span>
                    <img
                      src={
                        isLogin.photo
                          ? `${URL}/api/image-proxy/${extractDriveFileId(
                              isLogin.photo
                            )}`
                          : ""
                      }
                      className="w-9 h-9 rounded-full"
                      alt="user photo"
                    />
                  </button>
                </div>
                <div className="px-4 py-3" role="none">
                  <p
                    className="text-sm font-medium text-gray-900 truncate dark:text-gray-300"
                    role="none"
                  >
                    {isLogin?.Name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </React.Fragment>
  );
}

export default Navbar;
