import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { URL } from "../../App";
import axios from "axios";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../Components/AuthContext/AuthContext";

const AssignCourse = () => {
  const navigate = useNavigate();
  const { role, user, setUser, setRole, clearAuthState } = useRole();
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedLearner, setSelectedLearner] = useState("");
  const [learners, setLearners] = useState([]);
  const [courses, setCourses] = useState([]);
  const [success, setSuccess] = useState(false);
  const [isLearnerOpen, setIsLearnerOpen] = useState(false);
  const [isCourseOpen, setIsCourseOpen] = useState(false);
  const [searchLearner, setSearchLearner] = useState("");
  const [searchCourse, setSearchCourse] = useState("");
  const [dataloading, setDataLoading] = useState(false);

  const learnerRef = useRef(null);
  const courseRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (learnerRef.current && !learnerRef.current.contains(event.target)) {
        setIsLearnerOpen(false);
      }
      if (courseRef.current && !courseRef.current.contains(event.target)) {
        setIsCourseOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { withCredentials: true };
        const [learnersRes, coursesRes] = await Promise.all([
          axios.get(`${URL}/api/user/learners`, config),
          axios.get(`${URL}/api/courses`, config),
        ]);

        setLearners(
          Array.isArray(learnersRes.data.learners)
            ? learnersRes.data.learners
            : []
        );
        setCourses(
          Array.isArray(coursesRes.data.courses)
            ? coursesRes.data.courses
            : []
        );
      } catch (error) {
        if (
          error.name !== "AbortError" &&
          error.response &&
          (error.response.status === 401 ||
            error.response.data.message ===
              "Credential Invalid or Expired Please Login Again")
        ) {
          setTimeout(() => {
            clearAuthState();
          }, 2000);
        }
      }
    };

    fetchData();
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccess(false);
    const requestData = {
      learner: selectedLearner,
      course: [selectedCourse],
    };

    try {
      setDataLoading(true)
      const config = { withCredentials: true };
      await axios.post(`${URL}/api/course-assigned`, requestData, config);
      setSuccess(true);
      setTimeout(() => {
        setDataLoading(false)
        setSuccess(false);
        navigate(-1);
      }, 1000);
    } catch (error) {
      if (
        error.name !== "AbortError" &&
        error.response &&
        (error.response.status === 401 ||
          error.response.data.message ===
            "Credential Invalid or Expired Please Login Again")
      ) {
        setTimeout(() => {
          clearAuthState();
        }, 2000);
      }
    }
  };

  const selectedLearnerDetails = learners.find(
    (learner) => learner._id === selectedLearner
  );

  const filteredLearners = learners.filter((learner) =>
    learner.fullName.toLowerCase().includes(searchLearner.toLowerCase())
  );

  const filteredCourses = courses.filter((course) =>
    course.courseName.toLowerCase().includes(searchCourse.toLowerCase())
  );

  return (
    <div className="p-4">
      <h2 className="sm:text-3xl md:text-2xl font-semibold mb-4">
        Assign Course
      </h2>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex flex-col gap-6">
            {/* Learner Dropdown */}
            <div ref={learnerRef} className="relative w-full">
              <label
                className={`absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none ${
                  selectedLearner || isLearnerOpen
                    ? "text-xs -top-2.5 text-blue-600"
                    : "top-3 text-sm text-gray-500"
                }`}
              >
                Select Learner
              </label>
              <button
                type="button"
                onClick={() => setIsLearnerOpen((prev) => !prev)}
                className={`w-full h-12 px-3 pt-4 text-left rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  selectedLearner || isLearnerOpen
                    ? "border border-blue-600"
                    : "border border-gray-300 text-gray-700"
                }`}
              >
                {selectedLearnerDetails
                  ? selectedLearnerDetails.fullName
                  : ""}
              </button>
              {isLearnerOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                  <input
                    type="text"
                    placeholder="Search learners..."
                    className="w-full p-3 text-sm border-b border-gray-200"
                    value={searchLearner}
                    onChange={(e) => setSearchLearner(e.target.value)}
                    autoFocus
                  />
                  <div className="max-h-60 overflow-y-auto">
                    {filteredLearners.length > 0 ? (
                      filteredLearners.map((learner) => (
                        <button
                          key={learner._id}
                          type="button"
                          onClick={() => {
                            setSelectedLearner(learner._id);
                            setIsLearnerOpen(false);
                            setSearchLearner("");
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                        >
                          {learner.fullName}
                        </button>
                      ))
                    ) : (
                      <p className="p-4 text-gray-500">No learners found</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Learner Preview (Mobile) */}
            {selectedLearnerDetails && (
              <div className="block md:hidden w-full border p-4 rounded-md">
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={`${URL}/api/image-proxy/${extractDriveFileId(
                      selectedLearnerDetails.photo
                    )}`}
                    alt={selectedLearnerDetails.fullName}
                    className="w-14 h-14 rounded-full border"
                  />
                  <p className="text-base font-semibold">
                    {selectedLearnerDetails.fullName}
                  </p>
                  <p className="text-sm text-gray-600">
                    ID: {selectedLearnerDetails.admissionNumber}
                  </p>
                </div>
              </div>
            )}

            {/* Course Dropdown */}
            <div ref={courseRef} className="relative w-full">
              <label
                className={`absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none ${
                  selectedCourse || isCourseOpen
                    ? "text-xs -top-2.5 text-blue-600"
                    : "top-3 text-sm text-gray-500"
                }`}
              >
                Select Course
              </label>
              <button
                type="button"
                onClick={() => setIsCourseOpen((prev) => !prev)}
                className={`w-full h-12 px-3 pt-4 text-left rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  selectedCourse || isCourseOpen
                    ? "border border-blue-600"
                    : "border border-gray-300 text-gray-700"
                }`}
              >
                {courses.find((c) => c._id === selectedCourse)?.courseName ||
                  ""}
              </button>
              {isCourseOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                  <input
                    type="text"
                    placeholder="Search courses..."
                    className="w-full p-3 text-sm border-b border-gray-200"
                    value={searchCourse}
                    onChange={(e) => setSearchCourse(e.target.value)}
                    autoFocus
                  />
                  <div className="max-h-60 overflow-y-auto">
                    {filteredCourses.length > 0 ? (
                      filteredCourses.map((course) => (
                        <button
                          key={course._id}
                          type="button"
                          onClick={() => {
                            setSelectedCourse(course._id);
                            setIsCourseOpen(false);
                            setSearchCourse("");
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                        >
                          {course.courseName}
                        </button>
                      ))
                    ) : (
                      <p className="p-4 text-gray-500">No courses found</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Learner Preview (Desktop) */}
          {selectedLearnerDetails && (
            <div className="hidden md:flex flex-col items-center gap-3 border p-5 rounded-md shadow-sm">
              <img
                src={`${URL}/api/image-proxy/${extractDriveFileId(
                  selectedLearnerDetails.photo
                )}`}
                alt={selectedLearnerDetails.fullName}
                className="w-16 h-16 rounded-full border"
              />
              <p className="text-base font-semibold">
                {selectedLearnerDetails.fullName}
              </p>
              <p className="text-sm text-gray-600">
                ID: {selectedLearnerDetails.admissionNumber}
              </p>
            </div>
          )}
        </div>

          <div className="flex flex-col md:flex-row md:justify-end space-y-4 md:space-y-0 md:space-x-4 mt-6">
        <button
  onClick={() => navigate(-1)}
  disabled={dataloading}
  className={`bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800 
    ${dataloading ? "opacity-50 cursor-not-allowed" : ""}`}
>
  Back
</button>
   {dataloading? (<button disabled type="button" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-800">
<svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
</svg>Loading...</button>
):( <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-800"
          >
            Save
          </button>)}
         
        </div>
      </form>

      {success && (
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
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 11.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
            </svg>
            <span className="sr-only">Success icon</span>
          </div>
          <div className="ml-3 text-sm font-normal">
            Course assigned successfully!
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignCourse;
