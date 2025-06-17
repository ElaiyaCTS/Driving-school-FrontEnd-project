import { useState, useEffect } from "react";
import { URL } from "../../App";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Pagination from "../../Components/Pagination";
import { FaSyncAlt } from "react-icons/fa";

const SingleCourseAssign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [learners, setLearners] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusOne, setStatusOne] = useState("");
  const [statusTwo, setStatusTwo] = useState("");
  const [loading, setLoading] = useState(true);

  const limit = 5;

  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem("token");

    const fetchData = async () => {
      setLoading(true);

      try {
        const queryParams = new URLSearchParams({
          page: currentPage,
          statusOne,
          statusTwo,
          search,
          limit,
        });

        const response = await axios.get(
          `${URL}/api/course-assigned/${id}?${queryParams}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        setLearners(response.data.assignments);
        setTotalPages(response.data.totalPages);
      } catch (error) {
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
      } finally {
        setLoading(false);
      }
    };

    let debounceTimeout;

    if (search) {
      debounceTimeout = setTimeout(() => {
        fetchData();
      }, 2000);
    } else {
      fetchData();
    }

    return () => {
      controller.abort();
      clearTimeout(debounceTimeout);
    };
  }, [currentPage, search, statusOne, statusTwo]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const handleRefresh = () => {
    setSearch("");
    setStatusOne("");
    setStatusTwo("");
    setCurrentPage(1);
  };

  return (
    <>
      <div className="p-4">
        <div className="flex flex-row justify-between items-center gap-4 mb-4">
          <h3 className="text-base font-semibold">Course History</h3>
          <FaSyncAlt
            className="text-blue-500 cursor-pointer hover:text-blue-600"
            onClick={handleRefresh}
            size={20}
            aria-label="Refresh Tests"
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0 mb-4">
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              className="w-full border border-gray-300 text-gray-900 text-sm rounded-lg pl-10 pr-10 py-2"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg
              className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
            {search && (
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                onClick={() => setSearch("")}
              >
                <svg
                  className="w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 6l8 8M6 14L14 6"
                  />
                </svg>
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-48">
              <select
                id="floating_status_one"
                className="peer block w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 px-3 py-2"
                value={statusOne}
                onChange={(e) => setStatusOne(e.target.value)}
              >
                <option value="">All</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <label
                htmlFor="floating_status_one"
                className={`absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500
      peer-focus:text-blue-600
      ${statusOne ? "text-blue-600" : ""}`}
              >
                Status
              </label>
            </div>

            <div className="relative w-full md:w-48">
              <select
                id="floating_status_two"
                className="peer block w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 px-3 py-2"
                value={statusTwo}
                onChange={(e) => setStatusTwo(e.target.value)}
              >
                <option value="">All</option>
                <option value="Ready to test">Ready to test</option>
                <option value="Extra class">Extra class</option>
              </select>
              <label
                htmlFor="floating_status_two"
                className={`absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500
      peer-focus:text-blue-600
      ${statusTwo ? "text-blue-600" : ""}`}
              >
                Description
              </label>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-5 text-blue-600 font-semibold text-lg">
            Loading...
          </div>
        ) : (
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-gray-500">
              <thead className="text-sm text-gray-700 text-left bg-gray-50">
                <tr>
                  <th className="px-6 py-4">S.No</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Duration (Days)</th>
                  <th className="px-6 py-4">Remaining (Days)</th>
                  <th className="px-6 py-4">Status </th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {learners.length > 0 ? (
                  learners.map((assignment, index) => (
                    <tr key={assignment._id} className="bg-white border-b">
                      <td className="px-6 py-4">{index + 1}</td>
                      <td className="px-6 py-4">
                        {assignment.course.courseName}
                      </td>
                      <td className="px-6 py-4">{assignment.totalDays}</td>
                      <td className="px-6 py-4">
                        {assignment.totalDays - assignment.attendedDays}
                      </td>
                      <td
                        className={`px-6 py-4 ${
                          assignment.statusOne === "Completed"
                            ? "text-green-600"
                            : assignment.statusOne === "Processing"
                            ? "text-blue-600"
                            : "text-red-600"
                        }`}
                      >
                        {assignment.statusOne}
                      </td>
                      <td className="px-6 py-4">
                        {assignment.statusTwo || "--"}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/course-assigned/${assignment._id}/edit`,
                              { state: { assignment } }
                            )
                          }
                          className={`text-blue-600 ${
                            assignment.statusOne === "Completed"
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          disabled={assignment.statusOne === "Completed"}
                        >
                          <i className="fa-solid fa-pen-to-square text-blue-600"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center text-red-600 py-6 bg-white border-b"
                    >
                      Courses not found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {learners.length > 0 && (
          <Pagination
            CurrentPage={currentPage}
            TotalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </>
  );
};

export default SingleCourseAssign;
