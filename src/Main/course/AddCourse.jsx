import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { URL } from "../../App";
import axios from "axios";

const AddCourse = () => {
  const navigate = useNavigate();

  const [newCourse, setNewCourse] = useState({
    courseName: "",
    duration: "",
    practicalDays: "",
    theoryDays: "",
    fee: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse((prevCourse) => ({
      ...prevCourse,
      [name]: value,
    }));
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!newCourse.courseName) errors.courseName = "Course Name is required.";
    if (!newCourse.duration) errors.duration = "Duration is required.";
    if (!newCourse.practicalDays)
      errors.practicalDays = "Practical days are required.";
    if (!newCourse.theoryDays) errors.theoryDays = "Theory days are required.";
    if (!newCourse.fee) errors.fee = "Fee is required.";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token is missing.");

      await axios.post(`${URL}/api/courses`, newCourse, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setToastOpen(true);
      setTimeout(() => {
        setToastOpen(false);
        navigate(-1);
      }, 500);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching data:", error);
        if (
          error.response &&
          (error.response.status === 401 ||
            error.response.data.message === "Invalid token")
        ) {
          return setTimeout(() => {
            window.localStorage.clear();
            navigate("/");
          }, 2000);
        }
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="p-4">
        <h2 className="sm:text-3xl md:text-2xl font-semibold mb-4">
          Course Enrollment
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-8">
            <div className="relative">
              <input
                type="text"
                id="courseName"
                name="courseName"
                placeholder=" "
                value={newCourse.courseName}
                onChange={handleInputChange}
                className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
              />
              <label
                htmlFor="courseName"
                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-600 start-1"
              >
                Course Name
              </label>
              {validationErrors.courseName && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.courseName}
                </p>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                id="duration"
                name="duration"
                placeholder=" "
                value={newCourse.duration}
                onChange={handleInputChange}
                className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
              />
              <label
                htmlFor="duration"
                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-600 start-1"
              >
                Duration (Days)
              </label>
              {validationErrors.duration && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.duration}
                </p>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                id="practicalDays"
                name="practicalDays"
                placeholder=" "
                value={newCourse.practicalDays}
                onChange={handleInputChange}
                className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
              />
              <label
                htmlFor="practicalDays"
                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-600 start-1"
              >
                Practical (Days)
              </label>
              {validationErrors.practicalDays && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.practicalDays}
                </p>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                id="theoryDays"
                name="theoryDays"
                placeholder=" "
                value={newCourse.theoryDays}
                onChange={handleInputChange}
                className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
              />
              <label
                htmlFor="theoryDays"
                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-600 start-1"
              >
                Theory (Days)
              </label>
              {validationErrors.theoryDays && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.theoryDays}
                </p>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                id="fee"
                name="fee"
                placeholder=" "
                value={newCourse.fee}
                onChange={handleInputChange}
                className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
              />
              <label
                htmlFor="fee"
                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-600 start-1"
              >
                Fee
              </label>
              {validationErrors.fee && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.fee}
                </p>
              )}
            </div>
          </div>
          <div>
            {errorMessage && (
              <p className="text-red-500 text-center">{errorMessage}</p>
            )}
          </div>
          <div className="flex flex-col md:flex-row md:justify-end space-y-4 md:space-y-0 md:space-x-4 mt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800"
            >
              Back
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-800"
            >
              Add
            </button>
          </div>
        </form>
      </div>
      {toastOpen && (
        <div
          id="toast-success"
          className="fixed top-20 right-5 flex items-center justify-center w-full max-w-xs p-4 text-white bg-blue-700 rounded-md shadow-md"
          role="alert"
        >
          <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-green-700 bg-green-100 rounded-md dark:bg-green-800 dark:text-green-400">
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
          <div className="ms-3 text-sm font-normal">
            Course added successfully
          </div>
        </div>
      )}
    </>
  );
};

export default AddCourse;
