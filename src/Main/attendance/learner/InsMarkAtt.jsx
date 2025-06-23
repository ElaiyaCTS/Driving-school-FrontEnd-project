import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { URL } from "../../../App";
import { extractDriveFileId } from "../../../Components/ImageProxyRouterFunction/funtion.js";
import {useRole } from "../../../Components/AuthContext/AuthContext"

const InsMarkAtt = () => {
 const {role, user,setUser,setRole,clearAuthState} =  useRole();
  const navigate = useNavigate();
  
  const [learners, setLearners] = useState([]);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [selectedLearner, setSelectedLearner] = useState("");
  const [selectedLearnerDetails, setSelectedLearnerDetails] = useState(null);
  const [isLearnerOpen, setIsLearnerOpen] = useState(false);
  const [searchLearner, setSearchLearner] = useState("");
  //   const [isCourseOpen, setIsCourseOpen] = useState(false);
  // const [courseSearch, setCourseSearch] = useState("");

  const [courseError, setCourseError] = useState("");
  const [selectedAssignedCourseId, setSelectedAssignedCourseId] = useState("");
  const [selectedAssignedId, setSelectedAssignedId] = useState("");
  const [classType, setClassType] = useState("");
  const [date, setDate] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [description, setDescription] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [toastOpen, setToastOpen] = useState(false);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  
  useEffect(() => {
    const fetchLearners = async () => {
      try {
        const res = await axios.get(`${URL}/api/user/learners`, {
          withCredentials: true,
        });
        setLearners(res.data.learners);
      } catch (err) {
        console.error("Error fetching learners:", err);
      }
    };
    const fetchCourseTypes = async () => {
     
      let id;
      if (user) {
       
        id = user.user_id;
      } else {
        // console.error("No token found");
      }

      try {
        const res = await axios.get(`${URL}/api/course-assigned/${id}`, {
          withCredentials: true,
        });
        setAssignedCourses(res.data.assignments);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };

    fetchLearners();
    fetchCourseTypes();
  }, [user]);

  const handleLearnerChange = async (learnerId) => {
    const selected = learners.find((l) => l._id === learnerId);
    setSelectedLearner(learnerId);
    setSelectedLearnerDetails(selected);
    setSelectedAssignedCourseId("");
    setAssignedCourses([]);
    setCourseError("");

    if (learnerId) {
      try {
        const res = await axios.get(
          `${URL}/api/course-assigned/${learnerId}`,
          {
           withCredentials: true,
          }
        );
        const assignments = res.data.assignments;

       if (!assignments || assignments.length === 0 ) {
          setCourseError("No course assigned for this learner");
          setAssignedCourses([]);
        } else {
          setCourseError("");
          setAssignedCourses(assignments);
        } } catch (err) {
        // console.error("Error fetching assigned courses:", err);
        // setCourseError("Failed to fetch course assignments");
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedLearner) newErrors.selectedLearner = "Please select a learner";
    if (!selectedAssignedCourseId)
      newErrors.selectedAssignedCourseId = "Please select a course";
    if (!classType) newErrors.classType = "Please select class type";
    if (!date) newErrors.date = "Please select a date";
    if (!checkIn) newErrors.checkIn = "Please enter check-in time";
    if (!checkOut) newErrors.checkOut = "Please enter check-out time";
    if (checkIn && checkOut && checkIn >= checkOut) {
      newErrors.checkOut = "Check-out must be after check-in";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      const checkInDate = new Date(`${date}T${checkIn}:00`);
      const checkOutDate = new Date(`${date}T${checkOut}:00`);

      const requestBody = {
        learner: selectedLearner,
        courseType: selectedAssignedCourseId,
        classType,
        date,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        descriptions: description,
      };

      if (selectedOption === "ready-to-test") {
        requestBody.readytotest = {
          _id: selectedAssignedId,
          courseId: selectedAssignedCourseId,
          statusOne: "Completed",
          statusTwo: "Ready to test",
        };
      } else if (selectedOption === "extra-class") {
        requestBody.Extraclass = {
          _id: selectedAssignedId,
          courseId: selectedAssignedCourseId,
          statusOne: "Completed",
          statusTwo: "Extra class",
        };
      }

      await axios.post(`${URL}/api/learner-attendance`, requestBody, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setToastOpen(true);
      setTimeout(() => {
        setToastOpen(false);
        navigate(-1);
      }, 1000);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching data:", error);
        if (
          error.response &&
          (error.response.status === 401 ||
            error.response.data.message === "Credential Invalid or Expired Please Login Again")
        ) {
          return setTimeout(() => {
            window.localStorage.clear();
            navigate("/");
          }, 2000);
        }
      }
    }
  };

  const filteredLearners = learners.filter((learner) =>
    learner.fullName.toLowerCase().startsWith(searchLearner.toLowerCase())
  );

  const Completed = assignedCourses.filter(
    (f) => f.totalDays === f.attendedDays || f.statusOne === "Completed"
  );

  const NotCompleted = assignedCourses.filter(
    (f) => f.totalDays === f.attendedDays || f.statusOne !== "Completed"
  );

  const Course = [...NotCompleted, ...Completed];

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
                className={`
      absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none
      ${
        selectedLearner || isLearnerOpen
          ? "text-xs -top-2.5 text-blue-600"
          : "top-3 text-sm text-gray-500"
      }
    `}
              >
                Select Learner
              </label>

              <button
                type="button"
                onClick={() => setIsLearnerOpen((prev) => !prev)}
                className={`w-full h-12 px-3 pt-4 text-left text-sm rounded-lg focus:ring-2 focus:ring-blue-500
      ${
        selectedLearner || isLearnerOpen
          ? "border border-blue-600"
          : "border border-gray-300 text-gray-700"
      }
    `}
              >
                {learners.find((l) => l._id === selectedLearner)?.fullName}
              </button>

              {isLearnerOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full p-3 text-sm border-b border-gray-200"
                    value={searchLearner}
                    onChange={(e) => setSearchLearner(e.target.value)}
                  />
                  <div className="overflow-y-auto max-h-60">
                    {filteredLearners.length > 0 ? (
                      filteredLearners.map((learner) => (
                        <button
                          key={learner._id}
                          type="button"
                          onClick={() => {
                            handleLearnerChange(learner._id);
                            setIsLearnerOpen(false);
                          }}
                          className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                        >
                          {learner.fullName}
                        </button>
                      ))
                    ) : (
                      <p className="p-4 text-gray-500">No results found</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            {courseError && (
              <p className="mt-1 text-sm text-red-500">{courseError}</p>
            )}
            {selectedLearnerDetails && (
              <div className="block w-full p-4 border rounded-md lg:hidden">
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={`${URL}/api/image-proxy/${extractDriveFileId(
                      selectedLearnerDetails.photo
                    )}`}
                    alt={selectedLearnerDetails.fullName}
                    className="border rounded-full w-14 h-14"
                  />
                  <p className="text-sm font-semibold">
                    {selectedLearnerDetails.fullName}
                  </p>
                  <p className="text-sm text-gray-600">
                    ID: {selectedLearnerDetails.admissionNumber}
                  </p>
                </div>
              </div>
            )}

            <div className="relative w-full">
              <label
                className={`
      absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none
      ${
        selectedAssignedCourseId || isCourseDropdownOpen
          ? "text-xs -top-2.5 text-blue-600"
          : "top-3 text-sm text-gray-500"
      }
    `}
              >
                Select Course Type
              </label>

              <button
                type="button"
                onClick={() => setIsCourseDropdownOpen((prev) => !prev)}
                className={`
      w-full h-12 px-3 pt-4 text-left rounded-lg focus:ring-2 focus:ring-blue-500
      ${
        selectedAssignedCourseId || isCourseDropdownOpen
          ? "border border-blue-600"
          : "border border-gray-300 text-gray-700"
      }
    `}
              >
                {assignedCourses.find(
                  (a) => a.course._id === selectedAssignedCourseId
                )?.course.courseName || " "}
              </button>

              {isCourseDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="overflow-y-auto max-h-60">
                    {Course.length > 0 ? (
                      Course.map((assignment) => (
                        <button
                          key={assignment._id}
                          type="button"
                          onClick={() => {
                            setSelectedAssignedCourseId(assignment.course._id);
                            setSelectedAssignedId(assignment._id);
                            setIsCourseDropdownOpen(false);
                          }}
                          disabled={
                            assignment.totalDays === assignment.attendedDays ||
                            assignment.statusOne !== "Completed"
                              ? false
                              : true
                          }
                          className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          {assignment.course.courseName}
                        </button>
                      ))
                    ) : (
                      <p className="p-4 text-gray-500">No results found</p>
                    )}
                  </div>
                </div>
              )}

              {errors.selectedAssignedCourseId && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.selectedAssignedCourseId}
                </p>
              )}
            </div>

            <div className="relative w-full">
              <label
                className={`
      absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none
      ${
        classType || isClassDropdownOpen
          ? "text-xs -top-2.5 text-blue-600"
          : "top-3 text-sm text-gray-500"
      }
    `}
              >
                Select Class Type
              </label>

              <button
                type="button"
                onClick={() => setIsClassDropdownOpen((prev) => !prev)}
                className={`
      w-full h-12 px-3 pt-4 text-left rounded-lg focus:ring-2 focus:ring-blue-500
      ${
        classType || isClassDropdownOpen
          ? "border border-blue-600"
          : "border border-gray-300 text-gray-700"
      }
    `}
              >
                {classType}
              </button>

              {isClassDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="overflow-y-auto max-h-60">
                    {["Theory", "Practical"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setClassType(type);
                          setIsClassDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {errors.classType && (
                <p className="mt-1 text-sm text-red-500">{errors.classType}</p>
              )}
            </div>

            <div className="relative w-full">
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="peer block w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg resize-none appearance-none focus:outline-none focus:ring-0 focus:border-blue-500"
                placeholder=" "
              />
              <label
                htmlFor="description"
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-500 start-1"
              >
                Description
              </label>
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description}
                </p>
              )}
            </div>

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
                  Check-In Time
                </label>
                {errors.checkOut && (
                  <p className="mt-1 text-sm text-red-500">{errors.checkOut}</p>
                )}
              </div>
            </div>

            <div
              className={`border rounded-lg w-full transition-all duration-300 ${
                isOpen ? "ring-2 ring-blue-500" : ""
              }`}
              tabIndex="0"
            >
              <h2>
                <button
                  type="button"
                  className="flex items-center justify-between w-full p-5 font-medium text-gray-500"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <span>Additional Settings</span>
                  <svg
                    className={`w-3 h-3 transform transition-transform duration-300 ${
                      isOpen ? "rotate-180" : "rotate-0"
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
                      d="M9 5 5 1 1 5"
                    />
                  </svg>
                </button>
              </h2>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? "max-h-40 opacity-100 p-4" : "max-h-0 opacity-0"
                }`}
              >
                <div className="flex flex-row space-x-6">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      value="ready-to-test"
                      checked={selectedOption === "ready-to-test"}
                      onChange={() => setSelectedOption("ready-to-test")}
                      className="w-4 h-4"
                    />
                    <span>Ready to test</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      value="extra-class"
                      checked={selectedOption === "extra-class"}
                      onChange={() => setSelectedOption("extra-class")}
                      className="w-4 h-4"
                    />
                    <span>Extra Class</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden w-full lg:block lg:w-1/4">
            {selectedLearnerDetails && (
              <div className="w-full p-4 border rounded-md">
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={`${URL}/api/image-proxy/${extractDriveFileId(
                      selectedLearnerDetails.photo
                    )}`}
                    alt={selectedLearnerDetails.fullName}
                    className="w-16 h-16 border rounded-full"
                  />
                  <p className="text-sm font-semibold">
                    {selectedLearnerDetails.fullName}
                  </p>
                  <p className="text-sm text-gray-600">
                    ID: {selectedLearnerDetails.admissionNumber}
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
    </div>
  );
};

export default InsMarkAtt;
