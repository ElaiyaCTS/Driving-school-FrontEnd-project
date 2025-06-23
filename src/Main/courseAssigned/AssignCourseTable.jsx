import { useState, useEffect } from "react";
import { URL } from "../../App";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Pagination from "../../Components/Pagination";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";

const AssignCourseTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [learners, setLearners] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusOne, setStatusOne] = useState("");
  const [statusTwo, setStatusTwo] = useState("");
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let updated = false;

    if (!params.has("page")) {
      params.set("page", 1);
      updated = true;
    }

    if (!params.has("limit")) {
      params.set("limit", limit);
      updated = true;
    }

    if (updated) navigate({ search: params.toString() }, { replace: true });
  }, []);

  const updateURLParams = ({ search, statusOne, statusTwo, page }) => {
    const params = new URLSearchParams(location.search);

    if (search !== undefined) {
      if (search.length >= 3) {
        params.set("search", search);
      } else {
        params.delete("search");
      }
    }

    if (statusOne !== undefined) {
      statusOne ? params.set("statusOne", statusOne) : params.delete("statusOne");
    }

    if (statusTwo !== undefined) {
      statusTwo ? params.set("statusTwo", statusTwo) : params.delete("statusTwo");
    }

    if (page !== undefined) {
      page > 1 ? params.set("page", page) : params.delete("page");
    }

    navigate({ search: params.toString() });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get("search") || "");
    setStatusOne(params.get("statusOne") || "");
    setStatusTwo(params.get("statusTwo") || "");
    setCurrentPage(parseInt(params.get("page")) || 1);
  }, [location.search]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    let debounceTimeout;

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${URL}/api/course-assigned`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            search: search.length >= 3 ? search : undefined,
            statusOne: statusOne || undefined,
            statusTwo: statusTwo || undefined,
            page: currentPage,
            limit,
          },
          signal: search.length >= 3 ? signal : undefined,
        });

        setLearners(response.data.assignments || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        if (axios.isCancel(error) || error.name === "AbortError") {
          console.log("Search request aborted");
        } else {
          console.error("Error fetching data:", error);
          if (
            error.response &&
            (error.response.status === 401 ||
              error.response.data.message === "Credential Invalid or Expired Please Login Again")
          ) {
            setTimeout(() => {
              localStorage.clear();
              navigate("/");
            }, 2000);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (search.length >= 3 || search.length === 0) {
      debounceTimeout = setTimeout(fetchData, 2000);
    }

    return () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
      controller.abort();
    };
  }, [search, currentPage, statusOne, statusTwo]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setCurrentPage(1);
    updateURLParams({ search: value, statusOne, statusTwo, page: 1 });
  };

  const handleStatusOneChange = (e) => {
    const value = e.target.value;
    setStatusOne(value);
    setCurrentPage(1);
    updateURLParams({ search, statusOne: value, statusTwo, page: 1 });
  };

  const handleStatusTwoChange = (e) => {
    const value = e.target.value;
    setStatusTwo(value);
    setCurrentPage(1);
    updateURLParams({ search, statusOne, statusTwo: value, page: 1 });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      updateURLParams({ search, statusOne, statusTwo, page });
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h3 className="text-xl font-bold text-center md:text-left">
          Course Assigned List
        </h3>
        <button
          onClick={() => navigate("/admin/course-assigned/new")}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition w-full md:w-auto"
        >
          Add
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4 w-full">
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
              onClick={() => {
                setSearch("");
                updateURLParams({ search: "", statusOne, statusTwo, page: 1 });
              }}
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

        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto md:justify-end">
          <div className="relative w-full md:w-48">
            <select
              className="peer block w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 px-3 py-2"
              value={statusOne}
              onChange={handleStatusOneChange}
            >
              <option value="">All</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <label className="absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500 peer-focus:text-blue-600">
              Status
            </label>
          </div>

          <div className="relative w-full md:w-48">
            <select
              className="peer block w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 px-3 py-2"
              value={statusTwo}
              onChange={handleStatusTwoChange}
            >
              <option value="">All</option>
              <option value="Ready to test">Ready to test</option>
              <option value="Extra class">Extra class</option>
            </select>
            <label className="absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500 peer-focus:text-blue-600">
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
        <>
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-gray-500">
              <thead className="text-sm text-gray-700 text-left bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4">S.No</th>
                  <th className="px-6 py-4">Profile</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Admission No</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Duration (Days)</th>
                  <th className="px-6 py-4">Remaining (Days)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {learners.length > 0 ? (
                  learners.map((assignment, index) => (
                    <tr key={assignment._id} className="bg-white border-b">
                      <th className="px-6 py-4">{index + 1}</th>
                      <td className="px-2 py-4">
                        <img
                          src={`${URL}/api/image-proxy/${extractDriveFileId(
                            assignment.learner.photo
                          )}`}
                          alt="Learner"
                          className="w-16 h-16 object-cover rounded-full border-4 border-white shadow-md"
                        />
                      </td>
                      <td className="px-6 py-4 truncate" title={assignment.learner.fullName}>
                        {assignment.learner.fullName}
                      </td>
                      <td className="px-6 py-4">{assignment.learner.admissionNumber}</td>
                      <td className="px-6 py-4">{assignment.course.courseName}</td>
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
                      <td className="px-6 py-4">{assignment.statusTwo || "--"}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            navigate(`/admin/course-assigned/${assignment._id}/edit`, {
                              state: { assignment },
                            })
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
                    <td colSpan="10" className="text-center text-red-600 py-4">
                      Course assigned not found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {learners.length > 0 && (
            <Pagination
              CurrentPage={currentPage}
              TotalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AssignCourseTable;
