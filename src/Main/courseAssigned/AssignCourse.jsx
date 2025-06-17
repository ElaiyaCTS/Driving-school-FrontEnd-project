import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { URL } from "../../App";
import axios from "axios";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";

const AssignCourse = () => {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedLearner, setSelectedLearner] = useState("");
  const [learners, setLearners] = useState([]);
  const [courses, setCourses] = useState([]);
  const [success, setSuccess] = useState(false);
  const [isLearnerOpen, setIsLearnerOpen] = useState(false);
  const [isCourseOpen, setIsCourseOpen] = useState(false);
  const [searchLearner, setSearchLearner] = useState("");
  const [searchCourse, setSearchCourse] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [learnersRes, coursesRes] = await Promise.all([
          axios.get(`${URL}/api/user/learners`, { headers }),
          axios.get(`${URL}/api/courses`, { headers }),
        ]);

        setLearners(
          Array.isArray(learnersRes.data.learners)
            ? learnersRes.data.learners
            : []
        );
        setCourses(
          Array.isArray(coursesRes.data.courses) ? coursesRes.data.courses : []
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          if (
            error.response &&
            (error.response.status === 401 ||
              error.response.data.message === "Invalid token")
          ) {
            setTimeout(() => {
              window.localStorage.clear();
              navigate("/");
            }, 2000);
          }
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
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${URL}/api/course-assigned`, requestData, { headers });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate(-1);
      }, 1000);
    } catch (error) {
      if (error.name !== "AbortError") {
        if (
          error.response &&
          (error.response.status === 401 || error.response.data.message === "Invalid token")
        ) {
          setTimeout(() => {
            window.localStorage.clear();
            navigate("/");
          }, 2000);
        } 
      }
    }
  };

  const selectedLearnerDetails = Array.isArray(learners)
    ? learners.find((learner) => learner._id === selectedLearner)
    : null;

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
            <div className="relative w-full">
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
                {selectedLearnerDetails ? selectedLearnerDetails.fullName : "Choose a learner"}
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

            <div className="relative w-full">
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
                {courses.find((c) => c._id === selectedCourse)?.courseName || "Choose a course"}
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
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-800"
          >
            Back
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-md disabled:opacity-50"
          >
            Save
          </button>
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
