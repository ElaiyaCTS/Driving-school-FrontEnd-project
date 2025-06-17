import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { URL } from "../../App";
import Pagination from "../../Components/Pagination";

const CourseTable = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const itemsPerPage = 10;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const debounceTimer = setTimeout(async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          search: searchTerm,
          page: currentPage,
          limit: itemsPerPage,
        });

        const response = await axios.get(
          `${URL}/api/courses?${queryParams.toString()}`,
          {
            headers: {
              "Cache-Control": "no-cache",
              Authorization: `Bearer ${token}`,
            },
            signal,
          }
        );

        const data = response.data.courses || [];
        setCourses(data);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        if (axios.isCancel(error) || error.name === "AbortError") {
          console.log("Request canceled");
        } else {
          console.error("Error fetching courses:", error);
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
    }, 2000);
    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [searchTerm, currentPage]);

  useEffect(() => {
    if (location.state?.courseAdded) {
      fetchCourses();
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div>
      <div className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h3 className="text-xl font-bold text-center md:text-left">
            Course Details
          </h3>
          <button
            onClick={() => navigate("/admin/Course/new")}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition w-full md:w-auto"
          >
            Add Course
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <div className="relative w-full md:w-1/3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m1.85-6.65a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
              />
            </svg>
            <input
              type="search"
              className="w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 pl-10 py-2"
              placeholder="Search Course"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="hidden md:block" />
        </div>

        {loading ? (
          <div className="text-center py-5 text-blue-600 font-semibold text-lg">
            Loading...
          </div>
        ) : errorMessage ? (
          <p className="text-red-600">{errorMessage}</p>
        ) : (
          <div className="overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-gray-500">
              <thead className="text-sm text-gray-700 text-left bg-gray-50">
                <tr>
                  <th className="px-6 py-4">S.No</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Duration (Days)</th>
                  <th className="px-6 py-4">Practical (Days)</th>
                  <th className="px-6 py-4">Theory (Days)</th>
                  <th className="px-6 py-4">Fees (₹)</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {courses.length > 0 ? (
                  courses.map((course, index) => (
                    <tr key={course._id} className="bg-white border-b">
                      <td className="px-6 py-4">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4">{course.courseName}</td>
                      <td className="px-6 py-4">{course.duration}</td>
                      <td className="px-6 py-4">{course.practicalDays}</td>
                      <td className="px-6 py-4">{course.theoryDays}</td>
                      <td className="px-4 py-2">{course.fee}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            navigate(`/admin/Course/${course._id}/edit`)
                          }
                          className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                        >
                          <i className="fa-solid fa-pen-to-square text-blue-600"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-red-600 py-4">
                      Course not found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {courses.length > 0 && (
              <Pagination
                CurrentPage={currentPage}
                TotalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default CourseTable;
