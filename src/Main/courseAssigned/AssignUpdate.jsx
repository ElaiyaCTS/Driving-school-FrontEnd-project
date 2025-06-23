import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";

const AssignUpdate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const [assignment, setAssignment] = useState(null);
  const [selectedStatusOne, setSelectedStatusOne] = useState("");
  const [success, setSuccess] = useState(false);
  const [learners, setLearners] = useState([]);
  const [allLearner, setAllLearner] = useState(true);
  const [allCourse, setAllCourse] = useState(true);
  const [isLearnerOpen, setIsLearnerOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [searchCourse, setSearchCourse] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedLearner, setSelectedLearner] = useState("");
  const [searchLearner, setSearchLearner] = useState("");

  const [isCourseOpen, setIsCourseOpen] = useState(false);

  const statuses = ["Completed", "Processing", "Cancelled"];

  useEffect(() => {
    fetchAssignment();
    fetchLearner();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      const response = await axios.get(
        `${URL}/api/course-assigned/ById/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAssignment(response.data);
      setSelectedLearner(response.data.learner?._id || "");
      setSelectedStatusOne(response.data.statusOne || "");
    } catch (error) {
      console.error("Error fetching assignment:", error);
      if (
        error.response &&
        (error.response.status === 401 ||
          error.response.data.message === "Credential Invalid or Expired Please Login Again")
      ) {
        localStorage.clear();
        setTimeout(() => navigate("/"), 2000);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.put(
        `${URL}/api/course-assigned/${id}`,
        {
          learner: assignment.learner._id,
          course: assignment.course._id,
          statusOne: selectedStatusOne,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate(-1);
      }, 2000);
    } catch (error) {
      console.error("Error updating status:", error);
      if (
        error.response &&
        (error.response.status === 401 ||
          error.response.data.message === "Credential Invalid or Expired Please Login Again")
      ) {
        localStorage.clear();
        setTimeout(() => navigate("/"), 2000);
      }
    }
  };

  const fetchLearner = async () => {
    try {
      const LearnerRes = await axios.get(`${URL}/api/user/learners`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLearners(LearnerRes.data.learners || []);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching data:", error);
        if (
          error.response &&
          (error.response.status === 401 ||
            error.response.data.message === "Credential Invalid or Expired Please Login Again")
        ) {
          setTimeout(() => {
            window.localStorage.clear();
            navigate("/");
          }, 2000);
        }
      }
    }
  };

  useEffect(() => {
    if (!allLearner) {
      fetchLearner();
    } else if (assignment) {
      setSelectedLearner(assignment.learner?._id || "");
    }
  }, [allLearner, assignment]);

  const fetchCourse = async () => {
    try {
      const coursesRes = await axios.get(`${URL}/api/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(coursesRes.data.courses || []);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching data:", error);
        if (
          error.response &&
          (error.response.status === 401 ||
            error.response.data.message === "Credential Invalid or Expired Please Login Again")
        ) {
          setTimeout(() => {
            window.localStorage.clear();
            navigate("/");
          }, 2000);
        }
      }
    }
  };

  useEffect(() => {
    if (!allCourse) {
      fetchCourse();
    } else if (assignment) {
      setSelectedCourse(assignment.course?._id || "");
    }
  }, [allCourse, assignment]);

  const selectedLearnerDetails =
    learners && learners.find((learner) => learner._id === selectedLearner);

  const filteredCourses =
    courses &&
    courses.filter((course) =>
      course.courseName.toLowerCase().includes(searchCourse.toLowerCase())
    );

  const filteredLearners =
    learners &&
    learners.filter((learner) =>
      learner.fullName.toLowerCase().includes(searchLearner.toLowerCase())
    );

  return (
    <div className="p-4 sm:p-6">
      <h2 className="sm:text-3xl md:text-2xl font-semibold mb-4">
        Update Course Assigned
      </h2>

      {assignment && (
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex gap-6">
            <div className="w-full lg:w-3/4 flex flex-col gap-4">
              {allLearner ? (
                <div className="flex items-center w-full gap-2">
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={assignment.learner?.fullName || ""}
                      className="peer border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-3 pt-4 pb-1.5"
                      disabled={true}
                    />
                    <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2">
                      Learner Name
                    </label>
                  </div>
                </div>
              ) : (
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
                    {selectedLearnerDetails
                      ? selectedLearnerDetails.fullName
                      : "Choose a learner"}
                  </button>
                  {isLearnerOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
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
              )}
              {allLearner ? (
                <button
                  type="button"
                  className="text-blue-700 font-medium text-sm text-end"
                  onClick={() => setAllLearner(false)}
                >
                  Change
                </button>
              ) : (
                <button
                  type="button"
                  className="text-blue-700 font-medium text-sm text-end"
                  onClick={() => setAllLearner(true)}
                >
                  Cancel
                </button>
              )}
              {selectedLearnerDetails && (
                <div className="block lg:hidden w-full border p-4 rounded-md">
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={`${URL}/api/image-proxy/${extractDriveFileId(
                        selectedLearnerDetails.photo
                      )}`}
                      alt={selectedLearnerDetails.fullName}
                      className="w-14 h-14 rounded-full border"
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
              {allCourse ? (
                <div className="flex items-end justify-between w-full gap-2">
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={assignment.course?.courseName || ""}
                      className="peer border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-3 pt-4 pb-1.5"
                      disabled={true}
                    />
                    <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2">
                      Course Name
                    </label>
                  </div>
                </div>
              ) : (
                <div className="flex items-end justify-between w-full gap-2">
                  <div className="relative w-full">
                    <label
                      className={`absolute left-3 bg-white px-1 transition-all duration-200 pointer-events-none ${
                        selectedCourse || isCourseOpen
                          ? "text-xs -top-1 text-blue-600"
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
                      {
                        courses.find((c) => c._id === selectedCourse)
                          ?.courseName
                      }
                    </button>
                    {isCourseOpen && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
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
                            <p className="p-4 text-gray-500">
                              No courses found
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {allCourse ? (
                <button
                  type="button"
                  className="text-blue-700 font-medium text-sm text-end"
                  onClick={() => setAllCourse(false)}
                >
                  Change
                </button>
              ) : (
                <button
                  type="button"
                  className="text-blue-700 font-medium text-sm text-end"
                  onClick={() => setAllCourse(true)}
                >
                  Cancel
                </button>
              )}
              <div>
                <label className="block font-semibold mb-2">Status</label>
                <div className="w-fit flex flex-col gap-2">
                  {statuses.map((status) => (
                    <label
                      key={status}
                      className="hover:cursor-pointer flex items-center gap-2 text-sm"
                    >
                      <input
                        type="radio"
                        name="statusOne"
                        value={status}
                        checked={selectedStatusOne === status}
                        onChange={() => setSelectedStatusOne(status)}
                        className="w-4 h-4"
                      />
                      <span>{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden lg:block w-full lg:w-1/4">
              {selectedLearnerDetails && (
                <div className="w-full border p-4 rounded-md">
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={`${URL}/api/image-proxy/${extractDriveFileId(
                        selectedLearnerDetails.photo
                      )}`}
                      alt={selectedLearnerDetails.fullName}
                      className="w-16 h-16 rounded-full border"
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
          <div className="flex flex-col md:flex-row md:justify-end space-y-4 md:space-y-0 md:space-x-4 mt-6">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-600 text-white px-6 py-2 rounded-md"
            >
              Back
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md"
            >
              Update
            </button>
          </div>
        </form>
      )}

      {success && (
        <div
          className="fixed top-20 right-5 flex items-center justify-center w-full max-w-xs p-4 text-white bg-blue-700 rounded-md shadow-md"
          role="alert"
        >
          <div className="inline-flex items-center justify-center w-8 h-8 text-green-700 bg-green-100 rounded-md dark:bg-green-800 dark:text-green-400">
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
          <div className="ms-3 text-sm font-normal">Updated successfully</div>
        </div>
      )}
    </div>
  );
};

export default AssignUpdate;
