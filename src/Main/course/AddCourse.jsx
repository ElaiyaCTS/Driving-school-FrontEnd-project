import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { URL } from "../../App";
import axios from "axios";
import { useRole } from "../../Components/AuthContext/AuthContext"; // adjust path as needed
const AddCourse = () => {
  const navigate = useNavigate();
const {role, user,setUser,setRole,clearAuthState} =  useRole();
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
      // const token = localStorage.getItem("token");
      // if (!token) throw new Error("Token is missing.");
    setLoading(true)
      await axios.post(`${URL}/api/courses`, newCourse, {
       withCredentials: true,
      });

      setToastOpen(true);
      setTimeout(() => {
        setLoading(false)
        setToastOpen(false);
        navigate(-1);
      }, 500);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching data:", error);
        if (
          error.response &&
          (error.response.status === 401 ||
            error.response.data.message === "Credential Invalid or Expired Please Login Again")
        ) {
          return setTimeout(() => {
           clearAuthState();
            // navigate("/");
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
  onClick={() => navigate(-1)}
  disabled={loading}
  className={`bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800 
    ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
>
  Back
</button>
   {loading? (<button disabled type="button" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-800">
<svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
</svg>Loading...</button>
):( <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-800"
          >
            Add
          </button>)}
         
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
