import "@fortawesome/fontawesome-free/css/all.min.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Pagination from "../../Components/Pagination";
import axios from "axios";
import moment from "moment";
import { URL } from "../../App";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../Components/AuthContext/AuthContext"; // adjust path as needed

const LearnerTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {role, user,setUser,setRole,clearAuthState} =  useRole();

  // State
  const [search, setSearch] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [learners, setLearners] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
const [toDateConfirmed, setToDateConfirmed] = useState(false);
const [dayPicked, setDayPicked] = useState(false);

  // To avoid running API call on initial URL param sync set
  const isInitialLoad = useRef(true);

  // Function to update URL params in the browser
  const updateURLParams = ({ search, gender, fromdate, todate, page }) => {
    const params = new URLSearchParams(location.search);

    if (search !== undefined) {
      if (search) params.set("search", search);
      else params.delete("search");
    }

    if (gender !== undefined) {
      if (gender && gender !== "All") params.set("gender", gender);
      else params.delete("gender");
    }

    if (fromdate !== undefined) {
      if (fromdate) params.set("fromdate", fromdate);
      else params.delete("fromdate");
    }

    if (todate !== undefined) {
      if (todate) params.set("todate", todate);
      else params.delete("todate");
    }

    if (page !== undefined) {
      if (page && page > 1) params.set("page", page);
      else params.delete("page");
    }

    // Use replace to avoid extra entries in history on param updates
    navigate({ search: params.toString() }, { replace: true });
  };

  // Sync component state from URL params on mount and when location.search changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    setSearch(params.get("search") || "");
    setSelectedGender(params.get("gender") || "");
    setFromDate(params.get("fromdate") || "");
    setToDate(params.get("todate") || "");
    setCurrentPage(parseInt(params.get("page")) || 1);

    isInitialLoad.current = false;
  }, [location.search]);

  // Fetch data API call with debounce and proper filter validation
  useEffect(() => {
  if (isInitialLoad.current) return;
  if (fromDate && !toDateConfirmed) return;

  const controller = new AbortController();
  let debounceTimer;

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${URL}/api/user/learners`, {
        params: {
          search,
          gender: selectedGender,
          fromdate: fromDate ? moment(fromDate).format("YYYY-MM-DD") : "",
          todate: toDate ? moment(toDate).format("YYYY-MM-DD") : "",
          page: currentPage,
          limit: 10,
        },
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });

      setLearners(response.data.learners);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log("API call cancelled");
      } else {
        setError(err.message || "Error fetching data");
        if (
          err.response &&
          (err.response.status === 401 ||
            err.response.data.message === "Invalid token")
        ) {
          setTimeout(() => {
            sessionStorage.clear();
            navigate("/");
          }, 2000);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  debounceTimer = setTimeout(fetchData, search ? 2000 : 0);

  return () => {
    clearTimeout(debounceTimer);
    controller.abort();
  };
}, [search, selectedGender, fromDate, toDateConfirmed, currentPage, navigate]);

  // Handlers that update state + URL params + reset page to 1 on filters change
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    updateURLParams({
      search: val,
      gender: selectedGender,
      fromdate: fromDate,
      todate: toDate,
      page: 1,
    });
    setCurrentPage(1);
  };

  const handleGenderChange = (e) => {
    const val = e.target.value;
    setSelectedGender(val);
    updateURLParams({
      search,
      gender: val,
      fromdate: fromDate,
      todate: toDate,
      page: 1,
    });
    setCurrentPage(1);
  };

  const handleFromDateChange = (e) => {
    const val = e.target.value;
    setFromDate(val);
    updateURLParams({
      search,
      gender: selectedGender,
      fromdate: val,
      todate: toDate,
      page: 1,
    });
    setCurrentPage(1);
  };

//  const prevToDateRef = useRef("");

const handleToDateChange = (e) => {
  setToDate(e.target.value);
  setDayPicked(true); // only when a day is actually picked
};

const handleToDateBlur = () => {
  if (
    dayPicked &&
    fromDate &&
    toDate &&
    new Date(toDate) >= new Date(fromDate)
  ) {
    setToDateConfirmed(true);
    updateURLParams({
      search,
      gender: selectedGender,
      fromdate: fromDate,
      todate: toDate,
      page: 1,
    });
    setCurrentPage(1);
  }
  setDayPicked(false); // reset after blur
};

  // Pagination page change
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);
    updateURLParams({
      search,
      gender: selectedGender,
      fromdate: fromDate,
      todate: toDate,
      page,
    });
  };

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
        <h3 className="text-xl font-bold text-center md:text-left">Learner Details</h3>
        <button
          onClick={() => navigate("/admin/learner/new")}
          className="w-full px-4 py-2 text-white transition bg-blue-500 rounded-md hover:bg-blue-600 md:w-auto"
        >
          Register
        </button>
      </div>

      <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:w-1/3">
          <div className="relative">
            <div className="absolute inset-y-0 flex items-center pointer-events-none left-3">
              <svg
                className="w-4 h-4 mr-2 text-gray-500"
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
            </div>
            <input
              type="search"
              className="w-full py-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="Search..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className="flex flex-col w-full gap-4 sm:flex-row sm:items-center md:w-auto md:justify-end">
          <div className="relative w-full sm:w-40">
            <select
              id="floating_gender"
              className="block w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg peer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={selectedGender}
              onChange={handleGenderChange}
            >
              <option value="">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Others">Others</option>
            </select>
            <label
              htmlFor="floating_gender"
              className={`absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500 peer-focus:text-blue-600 ${
                selectedGender ? "text-blue-600" : ""
              }`}
            >
              Gender
            </label>
          </div>

          <div className="relative w-full sm:w-40">
            <input
              type="date"
              value={fromDate}
              onChange={handleFromDateChange}
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg peer"
            />
            <label className="absolute left-3 top-[-8px] text-xs bg-white px-1 text-gray-500">From</label>
          </div>

          <div className="relative w-full sm:w-40">
                  <input
                  type="date"
                  value={toDate}
                  onChange={handleToDateChange}
                  onBlur={handleToDateBlur}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg peer"
                  min={fromDate || undefined}
                  
                   />
            <label className="absolute left-3 top-[-8px] text-xs bg-white px-1 text-gray-500">To</label>
          </div>
          


        </div>
      </div>

      {loading ? (
        <div className="py-5 text-lg font-semibold text-center text-blue-600">Loading...</div>
      ) : error ? (
        <div className="py-5 text-lg font-semibold text-center text-red-600">{error}</div>
      ) : (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-gray-700 bg-gray-50">
              <tr>
                <th className="px-6 py-4">S.No</th>
                <th className="px-6 py-4">Photo</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Admission No</th>
                <th className="px-6 py-4">Gender</th>
                <th className="px-6 py-4">Mobile No</th>
                <th className="px-6 py-4">Registration Date</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {learners.length > 0 ? (
                learners.map((learner, index) => (
                  <tr key={learner._id} className="bg-white border-b">
                    <td className="px-6 py-4">{(currentPage - 1) * 10 + index + 1}</td>
                    <td className="px-4 py-4">
                      <img
                        src={`${URL}/api/image-proxy/${extractDriveFileId(learner.photo)}`}
                        alt="Learner"
                        className="object-cover w-16 h-16 border-4 border-gray-100 rounded-full shadow-md"
                      />
                    </td>
                    <td className="px-6 py-4">{learner.fullName}</td>
                    <td className="px-6 py-4">{learner.admissionNumber}</td>
                    <td className="px-6 py-4">{learner.gender}</td>
                    <td className="px-6 py-4">{learner.mobileNumber}</td>
                    <td className="px-6 py-4">{moment(learner.createdAt).format("DD-MM-YYYY")}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/learner/${learner._id}/view`)}
                          className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          <i className="text-blue-600 fa-solid fa-eye"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/admin/learner/${learner.admissionNumber}/${learner._id}/edit`)
                          }
                          className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          <i className="text-blue-600 fa-solid fa-pen-to-square"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-red-600">
                    Learner not found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {learners.length > 0 && (
        <Pagination CurrentPage={currentPage} TotalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </div>
  );
};

export default LearnerTable;
