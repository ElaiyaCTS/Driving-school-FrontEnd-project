import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL } from "../../../App";
import { extractDriveFileId } from "../../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../../Components/AuthContext/AuthContext"; // adjust path as needed
const MarkIns = () => {
  const navigate = useNavigate();
  const {role, user,setUser,setRole,clearAuthState} =  useRole();
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [date, setDate] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [errors, setErrors] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statuses] = useState(["Present", "Absent"]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [errorMessages, setErrorMessages] = useState([]);

  const [selectedInstructorData, setSelectedInstructorData] = useState(null);

  useEffect(() => {
    const fetchInstructors = async () => {
      // const token = localStorage.getItem("token");
      // if (!token) {
      //   console.error("Token is missing");
      //   return;
      // }

      try {
        const response = await axios.get(`${URL}/api/user/instructors`, {
         withCredentials: true,
        });

        setInstructors(response.data.instructorsWithDecrypted);
      } catch (err) {
         if (!axios.isCancel(err)) {
            // setError(err.response.data.message);
        if (err.response &&(err.response.status === 401 ||err.response.data.message === "Invalid token")) {
            setTimeout(() => {
              clearAuthState();
              // navigate("/");
            }, 3000);
          }
        }
      }

    };
    fetchInstructors();
  }, []);

  const handleInstructorChange = (instructorId) => {
    setSelectedInstructor(instructorId);
    const instructor = instructors.find((inst) => inst._id === instructorId);
    setSelectedInstructorData(instructor || null);
    setIsOpen(false);
  };

  const validateForm = () => {
    let newErrors = {};
    if (!selectedInstructor)
      newErrors.selectedInstructor = "Please select an instructor";
    if (!date) newErrors.date = "Please select a date";
    if (!checkIn) newErrors.checkIn = "Please enter check-in time";
    if (!checkOut) newErrors.checkOut = "Please enter check-out time";
    if (checkIn && checkOut && checkIn >= checkOut)
      newErrors.checkOut = "Check-out time must be after check-in time";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const checkInDateTime = `${date}T${checkIn}:00.000Z`;
    const checkOutDateTime = `${date}T${checkOut}:00.000Z`;

    const attendanceData = {
      instructor: selectedInstructor,
      date,
      checkIn: checkInDateTime,
      status: selectedStatus,
      checkOut: checkOutDateTime,
    };

    try {
      await axios.post(`${URL}/api/instructor-attendance`, attendanceData, {
      withCredentials: true,
      });

      setToastOpen(true);
      setTimeout(() => {
        setToastOpen(false);
        navigate(-1);
      }, 1000);
    } catch (error) {
      if (
        error?.response?.status === 401 ||
        error?.response?.data?.message ===
          "Credential Invalid or Expired Please Login Again"
      ) {
        return setTimeout(() => {
          clearAuthState();
          navigate("/");
        }, 2000);
      }

      const errorMsg = error?.response?.data?.errors || error?.message || "An error occurred";
      const messages = Array.isArray(errorMsg) ? errorMsg : [errorMsg];
      setErrorMessages(messages);
      setTimeout(() => setErrorMessages([]), 4000);
    }
  };

 const filteredInstructors = (instructors || []).filter((inst) =>
  inst?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
);


  return (
    <div className="p-4">
        <h2 className="mb-4 font-semibold sm:text-3xl md:text-2xl">
        Mark Attendance
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex flex-col w-full gap-4 lg:w-3/4">
            <div className="relative w-full">
              <label
                htmlFor="instructor"
                className={`
                    absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none
                    ${
                      selectedInstructor || isOpen
                        ? "text-xs -top-2.5 text-blue-600"
                        : "top-3 text-sm text-gray-500"
                    }
                  `}
              >
                Select an instructor
              </label>

              <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="peer h-[52px] w-full text-left px-3 pt-4 pb-1.5 text-sm bg-transparent border border-gray-300 rounded-lg text-gray-900 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500"
              >
                <span
                  className={`${selectedInstructor ? "" : "text-gray-500"}`}
                >
                  {selectedInstructorData?.fullName}
                </span>
              </button>

              {isOpen && (
                <div className="absolute z-50 w-full mt-1 overflow-hidden bg-white border border-gray-300 rounded-md shadow-lg">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full p-3 text-sm border-b border-gray-200 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="overflow-y-auto max-h-60">
                    {filteredInstructors.length > 0 ? (
                      filteredInstructors.map((instructor) => (
                        <button
                          key={instructor._id}
                          type="button"
                          onClick={() => handleInstructorChange(instructor._id)}
                          className="block w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100"
                        >
                          {instructor.fullName}
                        </button>
                      ))
                    ) : (
                      <p className="p-4 text-gray-500">No results found</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {errors.selectedInstructor && (
              <p className="mt-1 text-sm text-red-500">
                {errors.selectedInstructor}
              </p>
            )}
            {selectedInstructorData && (
              <div className="block w-full p-4 border rounded-md lg:hidden">
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={`${URL}/api/image-proxy/${extractDriveFileId(
                      selectedInstructorData.photo
                    )}`}
                    alt={selectedInstructorData.fullName}
                    className="border rounded-full w-14 h-14"
                  />
                  <p className="text-base font-semibold">
                    {selectedInstructorData.fullName}
                  </p>
                </div>
              </div>
            )}

            <div className="relative w-full">
              <input
                type="date"
                id="date"
                name="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onFocus={(event) =>
                  (event.nativeEvent.target.defaultValue = "")
                }
                className="peer block w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-500"
                placeholder=" "
              />
              <label
                htmlFor="date"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-500 start-1"
              >
                Date
              </label>
              {errors.date && (
                <p className="mt-1 text-sm text-red-500">{errors.date}</p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="relative w-full">
                <input
                  type="time"
                  id="checkIn"
                  name="checkIn"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="peer block w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-500"
                  placeholder=" "
                />
                <label
                  htmlFor="checkIn"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-500 start-1"
                >
                  Check-In Time
                </label>
                {errors.checkIn && (
                  <p className="mt-1 text-sm text-red-500">{errors.checkIn}</p>
                )}
              </div>

              <div className="relative w-full">
                <input
                  type="time"
                  id="checkOut"
                  name="checkOut"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="peer block w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-500"
                  placeholder=" "
                />
                <label
                  htmlFor="checkOut"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-500 start-1"
                >
                  Check-Out Time
                </label>
                {errors.checkOut && (
                  <p className="mt-1 text-sm text-red-500">{errors.checkOut}</p>
                )}
              </div>
              <div>
                <label className="block mb-2 font-semibold">Status</label>
                <div className="flex flex-col gap-3">
                  {statuses.map((status) => (
                    <label
                      key={status}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={selectedStatus === status}
                        onChange={() => setSelectedStatus(status)}
                        className="w-3 h-3"
                      />
                      <span>{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* <div
            className={`w-full lg:w-1/4 h-40 flex flex-col items-center gap-3 border p-2 rounded-md shadow-md transition-all duration-300 ${
              selectedInstructorData
                ? "visible opacity-100"
                : "invisible opacity-0"
            }`}
          >
            {selectedInstructorData && (
              <>
                <img
                  src={selectedInstructorData.photo}
                  alt={selectedInstructorData.fullName}
                  className="border border-gray-300 rounded-full w-14 h-14"
                />
                <div className="text-center">
                  <p className="text-base font-semibold">
                    {selectedInstructorData.fullName}
                  </p>
                  <p className="text-xs text-gray-600">
                    ID: {selectedInstructorData._id}
                  </p>
                </div>
              </>
            )}
          </div> */}
          <div className="hidden w-full lg:block lg:w-1/4">
            {selectedInstructorData && (
              <div className="w-full p-4 border rounded-md">
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={`${URL}/api/image-proxy/${extractDriveFileId(
                      selectedInstructorData.photo
                    )}`}
                    alt={selectedInstructorData.fullName}
                    className="w-16 h-16 border rounded-full"
                  />
                  <p className="text-xl font-semibold">
                    {selectedInstructorData.fullName}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col mt-6 space-y-4 md:flex-row md:justify-end md:space-y-0 md:space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-800"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-3 text-white bg-blue-600 rounded-md"
          >
            Submit
          </button>
        </div>
      </form>
      {toastOpen && (
        <div
          id="toast-success"
          className="fixed flex items-center justify-center w-full max-w-xs p-4 text-white bg-blue-700 rounded-md shadow-md top-20 right-5"
          role="alert"
        >
          <div className="inline-flex items-center justify-center w-8 h-8 text-green-700 bg-green-100 rounded-md shrink-0 dark:bg-green-800 dark:text-green-400">
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
            </svg>
            <span className="sr-only">Check icon</span>
          </div>
          <div className="text-sm font-normal ms-3">
            Attendance marked successfully
          </div>
        </div>
      )}
      
      {/* ❌ Error Toasts */}
      {errorMessages.length > 0 && (
        <div className="fixed z-50 w-full max-w-xs space-y-2 top-32 right-5">
          {errorMessages.map((msg, i) => (
            <div
              key={i}
              className="flex items-center p-4 text-white bg-red-600 rounded-md shadow-md"
              role="alert"
            >
              <div className="inline-flex items-center justify-center w-8 h-8 mr-3 text-red-600 bg-white rounded-full">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-4h2v2h-2v-2zm0-8h2v6h-2V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium">{msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarkIns;
