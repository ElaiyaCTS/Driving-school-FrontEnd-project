import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";

const UpdateCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [course, setCourse] = useState({
    courseName: "",
    duration: "",
    practicalDays: "",
    theoryDays: "",
    fee: "",
  });

  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get(`${URL}/api/courses/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCourse(response.data);
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
      }
    };

    fetchCourse();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourse((prevCourse) => ({
      ...prevCourse,
      [name]: value,
    }));
    // setValidationErrors((prevErrors) => ({
    //   ...prevErrors,
    //   [name]: "",
    // }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.put(`${URL}/api/courses/${id}`, course, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setToastOpen(true);
      setTimeout(() => {
        setToastOpen(false);
        navigate(-1);
      }, 1000);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error updating course:", error);
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
    }
  };

  return (
    <div className="p-4">
      <h2 className="sm:text-3xl md:text-2xl font-semibold mb-4">
        Update Course Details
      </h2>
      <form onSubmit={handleUpdateSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-10">
          <div className="relative">
            <input
              type="text"
              id="courseName"
              name="courseName"
              value={course.courseName}
              onChange={handleInputChange}
              placeholder=" "
              className="peer block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600"
            />
            <label
              htmlFor="courseName"
              className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:text-blue-500 peer-focus:dark:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
            >
              Course Name
            </label>
          </div>

          <div className="relative">
            <input
              type="text"
              id="duration"
              name="duration"
              value={course.duration}
              onChange={handleInputChange}
              placeholder=" "
              className="peer block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600"
            />
            <label
              htmlFor="duration"
              className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:text-blue-500 peer-focus:dark:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
            >
              Duration
            </label>
          </div>

          <div className="relative">
            <input
              type="text"
              id="practicalDays"
              name="practicalDays"
              value={course.practicalDays}
              onChange={handleInputChange}
              placeholder=" "
              className="peer block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600"
            />
            <label
              htmlFor="practicalDays"
              className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-whit px-2 peer-focus:text-blue-500 peer-focus:dark:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
            >
              Practical Days
            </label>
          </div>

          <div className="relative">
            <input
              type="text"
              id="theoryDays"
              name="theoryDays"
              value={course.theoryDays}
              onChange={handleInputChange}
              placeholder=" "
              className="peer block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600"
            />
            <label
              htmlFor="theoryDays"
              className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:text-blue-500 peer-focus:dark:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
            >
              Theory Days
            </label>
          </div>

          <div className="relative">
            <input
              type="text"
              id="fee"
              name="fee"
              value={course.fee}
              onChange={handleInputChange}
              placeholder=" "
              className="peer block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600"
            />
            <label
              htmlFor="fee"
              className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:text-blue-500 peer-focus:dark:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
            >
              Fee
            </label>
          </div>
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
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Update
          </button>
        </div>
      </form>

      {toastOpen && (
        <div className="fixed top-20 right-5 flex items-center justify-center w-full max-w-xs p-4 text-white bg-blue-700 rounded-md shadow-md">
          <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-green-700 bg-green-100 rounded-md">
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
            </svg>
          </div>
          <div className="ml-3 text-sm font-normal">Updated successfully</div>
        </div>
      )}
    </div>
  );
};

export default UpdateCourse;
