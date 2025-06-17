import { useState, useEffect } from "react";
import { URL } from "../../App";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Pagination from "../../Components/Pagination";
import { jwtDecode } from "jwt-decode";

const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

const LearnerSingleAssign = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [assignments, setAssignments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusOne, setStatusOne] = useState("");
  const [statusTwo, setStatusTwo] = useState("");
  const [loading, setLoading] = useState(false);

  const limit = 5;

  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const courseId = decoded?.user_id;

  const updateURLParams = ({ search, statusOne, statusTwo, page }) => {
    const params = new URLSearchParams(location.search);

    if (search !== undefined) {
      if (search) {
        params.set("search", search);
      } else {
        params.delete("search");
      }
    }

    if (statusOne !== undefined) {
      if (statusOne) {
        params.set("statusOne", statusOne);
      } else {
        params.delete("statusOne");
      }
    }

    if (statusTwo !== undefined) {
      if (statusTwo) {
        params.set("statusTwo", statusTwo);
      } else {
        params.delete("statusTwo");
      }
    }

    if (page !== undefined) {
      if (page && page > 1) {
        params.set("page", page);
      } else {
        params.delete("page");
      }
    }

    navigate({ search: params.toString() });
  };

  useEffect(() => {
    const controller = new AbortController();
    let debounceTimer;

    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const queryParams = new URLSearchParams({
          page: currentPage,
          statusOne,
          statusTwo,
          search,
          limit,
        });

        const response = await axios.get(
          `${URL}/api/course-assigned/${courseId}?${queryParams}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        setAssignments(response.data.assignments || []);
        setTotalPages(response.data.totalPages || 1);
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

    if (
      courseId !== undefined &&
      currentPage &&
      statusOne !== undefined &&
      statusTwo !== undefined
    ) {
      if (search?.length > 0) {
        debounceTimer = setTimeout(() => {
          fetchData();
        }, 2000);
      } else {
        fetchData();
      }
    }

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [courseId, search, statusOne, statusTwo, currentPage, limit]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchFromURL = params.get("search") || "";
    const statusOneFromURL = params.get("statusOne") || "";
    const statusTwoFromURL = params.get("statusTwo") || "";
    const pageFromURL = parseInt(params.get("page")) || 1;

    setSearch(searchFromURL);
    setStatusOne(statusOneFromURL);
    setStatusTwo(statusTwoFromURL);
    setCurrentPage(pageFromURL);
  }, [location.search]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    updateURLParams({
      search: value,
      statusOne,
      statusTwo,
      page: 1,
    });
    setCurrentPage(1);
  };

  const handleStatusOneChange = (e) => {
    const value = e.target.value;
    setStatusOne(value);
    updateURLParams({
      search,
      statusOne: value,
      statusTwo,
      page: 1,
    });
    setCurrentPage(1);
  };

  const handleStatusTwoChange = (e) => {
    const value = e.target.value;
    setStatusTwo(value);
    updateURLParams({
      search,
      statusOne,
      statusTwo: value,
      page: 1,
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      updateURLParams({
        search,
        statusOne,
        statusTwo,
        page,
      });
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-row justify-between items-center gap-4 mb-4">
        <h3 className="text-xl font-bold text-center md:text-left">
          Course History
        </h3>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0 mb-4">
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            className="w-full border border-gray-300 text-gray-900 text-sm rounded-lg pl-10 pr-10 py-2"
            placeholder="Search"
            value={search}
            onChange={handleSearchChange}
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
              onClick={() => handleSearchChange({ target: { value: "" } })}
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
              onChange={handleStatusOneChange}
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
              onChange={handleStatusTwoChange}
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
        <div className="text-center font-semibold text-blue-600">
          Loading...
        </div>
      ) : (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-sm text-gray-700 bg-gray-50">
              <tr>
                <th className="px-6 py-4">S.No</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Duration (Days)</th>
                <th className="px-6 py-4">Remaining (Days)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Description</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length > 0 ? (
                assignments.map((assignment, index) => (
                  <tr key={assignment._id} className="bg-white border-b">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">
                      {assignment.course?.courseName || "--"}
                    </td>
                    <td className="px-6 py-4">
                      {assignment.course?.duration ?? "--"}
                    </td>
                    <td className="px-6 py-4">
                      {assignment.course?.duration != null
                        ? assignment.course.duration - assignment.attendedDays
                        : "--"}
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center text-red-500 py-6 bg-white border-b"
                  >
                    No course assignments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {assignments.length > 0 && (
        <Pagination
          CurrentPage={currentPage}
          TotalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default LearnerSingleAssign;
