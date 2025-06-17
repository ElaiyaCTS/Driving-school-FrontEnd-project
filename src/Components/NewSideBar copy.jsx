import { initFlowbite } from "flowbite";
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUser,
  FaChalkboardTeacher,
  FaBook,
  FaFileAlt,
  FaMoneyCheckAlt,
  FaClipboardCheck,
  FaUserShield,
  // FaSms,
  // FaChartBar,
  FaSignOutAlt,
} from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

function NewSidebar() {
  useEffect(() => initFlowbite(), []);

  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const location = useLocation();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
    } else {
      const decodedToken = jwtDecode(token);
      setRole(decodedToken?.role?.toLowerCase());
    }
  }, [token]);
  const [open, setOpen] = useState(
    location.pathname.startsWith("/admin/attendance")
  );

  return (
    <React.Fragment>
      <aside
        id="logo-sidebar"
        className="fixed inset-0 top-0 left-0 z-40 w-64 h-auto min-h-screen transition-transform transform -translate-x-full bg-blue-600 lg:static md:static lg:min-w-72 pt-28 md:translate-x-0"
        tabIndex="-1"
        aria-labelledby="logo-sidebar-label"
      >
        <div
          id="logo-sidebar-label"
          className="flex flex-col justify-between h-full px-3 pb-0 space-y-2 overflow-y-auto bg-blue-600 sm:pb-5 dark:bg-blue-800"
        >
          {role == "admin" && (
            <>
              <ul className="space-y-2 font-normal">
                <li>
                  <Link
                    to="/admin/dashboard"
                    className={`${
                      location.pathname.startsWith("/admin/dashboard")
                        ? "bg-blue-700 text-white"
                        : "text-white dark:hover:bg-blue-800"
                    } flex items-center p-2 rounded-lg group`}
                  >
                    <FaTachometerAlt className="text-xl" />
                    <span className="ms-4">Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/learner/list"
                    className={`${
                      location.pathname.startsWith("/admin/learner")
                        ? "bg-blue-700 text-white"
                        : "text-white dark:hover:bg-blue-800"
                    } flex items-center p-2 rounded-lg group`}
                  >
                    <FaUser className="text-xl" />
                    <span className="ms-4 whitespace-nowrap">Learner</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/instructor/list"
                    className={`${
                      location.pathname.startsWith("/admin/instructor")
                        ? "bg-blue-700 text-white"
                        : "text-white dark:hover:bg-blue-800"
                    } flex items-center p-2 rounded-lg group`}
                  >
                    <FaChalkboardTeacher className="text-xl" />
                    <span className="ms-4 whitespace-nowrap">Instructor</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/staff/list"
                    className={`${
                      location.pathname.startsWith("/admin/staff")
                        ? "bg-blue-700 text-white"
                        : "text-white dark:hover:bg-blue-800"
                    } flex items-center p-2 rounded-lg group`}
                  >
                    <FaUserShield className="text-xl" />
                    <span className="ms-4 whitespace-nowrap">Staff</span>
                  </Link>
                </li>

                <li>
                  <Link
                    to="/admin/Course/list"
                    className={`${
                      location.pathname.startsWith("/admin/Course")
                        ? "bg-blue-700 text-white"
                        : "text-white dark:hover:bg-blue-800"
                    } flex items-center p-2 rounded-lg group`}
                  >
                    <FaBook className="text-xl" />
                    <span className="ms-4 whitespace-nowrap">Course</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/course-assigned/list"
                    className={`${
                      location.pathname.startsWith("/admin/course-assigned")
                        ? "bg-blue-700 text-white"
                        : "text-white dark:hover:bg-blue-800"
                    } flex items-center p-2 rounded-lg group`}
                  >
                    <FaClipboardCheck className="text-xl" />
                    <span className="ms-4 whitespace-nowrap">
                      Course-Assigned
                    </span>
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className={`${
                      location.pathname.startsWith("/admin/attendance")
                        ? "bg-blue-700 text-white"
                        : "text-white dark:hover:bg-blue-800"
                    } flex items-center w-full p-2 rounded-lg group`}
                  >
                    <svg
                      className="flex-shrink-0 w-6 h-6 transition duration-75"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 14a3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a3 3 0 0 1-3-3Zm3-1a1 1 0 1 0 0 2h4v-2h-4Z"
                        clipRule="evenodd"
                      />
                      <path
                        fillRule="evenodd"
                        d="M12.293 3.293a1 1 0 0 1 1.414 0L16.414 6h-2.828l-1.293-1.293a1 1 0 0 1 0-1.414ZM12.414 6 9.707 3.293a1 1 0 0 0-1.414 0L5.586 6h6.828ZM4.586 7l-.056.055A2 2 0 0 0 3 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2h-4a5 5 0 0 1 0-10h4a2 2 0 0 0-1.53-1.945L17.414 7H4.586Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ms-4 whitespace-nowrap">
                      Attendance
                    </span>
                    <svg
                      className={`w-3 h-3 ms-auto transition-transform ${
                        open ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 10 6"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M1 1l4 4 4-4"
                      />
                    </svg>
                  </button>

                  <ul
                    className={`${
                      open ? "block" : "hidden"
                    } py-2 pl-10 space-y-2`}
                  >
                    <li>
                      <Link
                        to="/admin/attendance/learner/list"
                        className={`${
                          location.pathname.startsWith(
                            "/admin/attendance/learner"
                          )
                            ? "bg-blue-700 text-white"
                            : "text-white dark:hover:bg-blue-800"
                        } flex items-center p-2 rounded-lg group`}
                      >
                        <FaUser className="text-xl" />
                        <span className="ms-5 whitespace-nowrap">Learner</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/attendance/instructor/list"
                        className={`${
                          location.pathname.startsWith(
                            "/admin/attendance/instructor"
                          )
                            ? "bg-blue-700 text-white"
                            : "text-white dark:hover:bg-blue-800"
                        } flex items-center p-2 rounded-lg group`}
                      >
                        <FaChalkboardTeacher className="text-xl" />
                        <span className="ms-5 whitespace-nowrap">
                          Instructor
                        </span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/attendance/staff/list"
                        className={`${
                          location.pathname.startsWith(
                            "/admin/attendance/staff"
                          )
                            ? "bg-blue-700 text-white"
                            : "text-white dark:hover:bg-blue-800"
                        } flex items-center p-2 rounded-lg group`}
                      >
                        <FaUserShield className="text-xl" />
                        <span className="ms-5 whitespace-nowrap">Staff</span>
                      </Link>
                    </li>
                  </ul>
                </li>

                <li>
                  <Link
                    to="/admin/payment/list"
                    className={`${
                      location.pathname.startsWith("/admin/payment")
                        ? "bg-blue-700 text-white"
                        : "text-white dark:hover:bg-blue-800"
                    } flex items-center p-2 rounded-lg group`}
                  >
                    <FaMoneyCheckAlt className="text-xl" />
                    <span className="ms-4 whitespace-nowrap">Payment</span>
                  </Link>
                </li>

                <li>
                  <Link
                    to="/admin/test-details/list"
                    className={`${
                      location.pathname.startsWith("/admin/test-details")
                        ? "bg-blue-700 text-white"
                        : "text-white dark:hover:bg-blue-800"
                    } flex items-center p-2 rounded-lg group`}
                  >
                    <FaFileAlt className="text-xl" />
                    <span className="ms-4 whitespace-nowrap">Test Details</span>
                  </Link>
                </li>
              </ul>
            </>
          )}
          {role == "learner" && (
            <>
              <ul className="space-y-2 font-normal">
                <li>
                  <Link
                    to="/learner/dashboard"
                    className={`${
                      location.pathname.startsWith("/learner/dashboard")
                        ? "bg-blue-700 text-white"
                        : "text-white dark:hover:bg-blue-800"
                    } flex items-center p-2 rounded-lg group`}
                  >
                    <FaTachometerAlt className="text-xl" />
                    <span className="ms-4 whitespace-nowrap">Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learner/attendance"
                    className={`${
                      location.pathname.startsWith("/learner/attendance")
                        ? "bg-blue-700 text-white"
                        : "text-white dark:hover:bg-blue-800"
                    } flex items-center p-2 rounded-lg group`}
                  >
                    <i className="flex-shrink-0 transition duration-75 fa-solid fa-money-bill-trend-up"></i>{" "}
                    <span className="flex-1 ms-5 whitespace-nowrap">
                      Attendance
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learner/payment"
                    className={`${
                      location.pathname.startsWith("/learner/payment")
                        ? "bg-blue-700 text-white"
                        : "text-white dark:hover:bg-blue-800"
                    } flex items-center p-2 rounded-lg group`}
                  >
                    <FaMoneyCheckAlt className="text-xl" />
                    <span className="ms-4 whitespace-nowrap">Payment</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learner/test-details"
                    className={`${
                      location.pathname.startsWith("/learner/test-details")
                        ? "bg-blue-700 text-white"
                        : "text-white dark:hover:bg-blue-800"
                    } flex items-center p-2 rounded-lg group`}
                  >
                    <FaFileAlt className="text-xl" />
                    <span className="ms-4 whitespace-nowrap">Test Details</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learner/Course"
                    className={`${
                      location.pathname.startsWith("/learner/Course")
                        ? "bg-blue-700 text-white"
                        : "text-white dark:hover:bg-blue-800"
                    } flex items-center p-2 rounded-lg group`}
                  >
                    <FaBook className="text-xl" />
                    <span className="ms-4 whitespace-nowrap">
                      Course Details
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learner/profile"
                    className={`${
                      location.pathname.startsWith("/learner/profile")
                        ? "bg-blue-700 text-white"
                        : "text-white dark:hover:bg-blue-800"
                    } flex items-center p-2 rounded-lg group`}
                  >
                    <FaUser className="text-xl" />
                    <span className="ms-4 whitespace-nowrap">Profile</span>
                  </Link>
                </li>
              </ul>
            </>
          )}
          {role == "instructor" && (
            <>
              <ul className="space-y-2 font-normal">
                <li>
                  <Link
                    to="/instructor/dashboard"
                    className={`${
                      location.pathname.startsWith("/instructor/dashboard")
                        ? "bg-blue-700 text-white"
                        : "text-white dark:hover:bg-blue-800"
                    } flex items-center p-2 rounded-lg group`}
                  >
                    <FaTachometerAlt className="text-xl" />
                    <span className="ms-4 whitespace-nowrap">Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/instructor/attendance/list"
                    className={`${
                      location.pathname.startsWith("/instructor/attendance")
                        ? "bg-blue-700 text-white"
                        : "text-white dark:hover:bg-blue-800"
                    } flex items-center p-2 rounded-lg group`}
                  >
                    <i className="flex-shrink-0 transition duration-75 fa-solid fa-money-bill-trend-up"></i>{" "}
                    <span className="flex-1 ms-5 whitespace-nowrap">
                      Attendance
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/instructor/payment/list"
                    className={`${
                      location.pathname.startsWith("/instructor/payment")
                        ? "bg-blue-700 text-white"
                        : "text-white dark:hover:bg-blue-800"
                    } flex items-center p-2 rounded-lg group`}
                  >
                    <FaMoneyCheckAlt className="text-xl" />
                    <span className="ms-4 whitespace-nowrap">Payment</span>
                  </Link>
                </li>

                <li>
                  <Link
                    to="/instructor/profile"
                    className={`${
                      location.pathname.startsWith("/instructor/profile")
                        ? "bg-blue-700 text-white"
                        : "text-white dark:hover:bg-blue-800"
                    } flex items-center p-2 rounded-lg group`}
                  >
                    <FaUser className="text-xl" />
                    <span className="ms-4 whitespace-nowrap">Profile</span>
                  </Link>
                </li>
              </ul>
            </>
          )}
          <div className="font-normal justify-self-end">
            <button
              data-modal-target="logout-modal"
              data-modal-toggle="logout-modal"
              className="flex items-center w-full p-2 text-white rounded-lg text-start bg-blue-60 group"
            >
              <FaSignOutAlt className="text-xl" />
              <span className="flex-1 ms-5 whitespace-nowrap">Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      <div
        id="logout-modal"
        data-modal-backdrop="static"
        tabIndex="-1"
        aria-hidden="true"
        className="hidden inset-0 bg-black bg-opacity-50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
      >
        <div className="relative w-full max-w-md max-h-full p-4 mx-auto">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <button
              type="button"
  data-modal-hide="logout-modal"

              className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>

            <div className="p-4 text-center md:p-5">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-200"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>

              <h3 className="mb-5 text-lg font-normal text-gray-800 dark:text-gray-400">
                Are you sure you want to{" "}
                <span className="font-semibold">Log out?</span>
              </h3>
              <button
                data-modal-hide="logout-modal"
                type="button"
                className="py-2.5 px-5 text-sm font-medium text-blue-600 focus:outline-none bg-white rounded-lg border border-blue-600 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-blue-300 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  window.localStorage.clear();
                  navigate("/");
                }}
                data-modal-hide="logout-modal"
                type="button"
                className="text-white ms-5 bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-100 dark:focus:ring-blue-700 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default NewSidebar;
