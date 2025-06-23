import { useEffect, useState, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { URL } from "../../../App";
import axios from "axios";
import moment from "moment";
import { useNavigate, useLocation } from "react-router-dom";
import Pagination from "../../../Components/Pagination";
import { extractDriveFileId } from "../../../Components/ImageProxyRouterFunction/funtion.js";

const InsLearnerAttTable = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [attendanceData, setAttendanceData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(today);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const instructorId = decoded?.user_id;
  const debounceTimeout = useRef(null);

  const [classType, setClassType] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [date, setDate] = useState("");

  const limit = 10;

  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const updateURLParams = ({
    search,
    fromdate,
    todate,
    date,
    page,
    classType,
  }) => {
    const params = new URLSearchParams(location.search);

    if (search !== undefined) {
      if (search) {
        params.set("search", search);
      } else {
        params.delete("search");
      }
    }

    if (fromdate !== undefined) {
      fromdate ? params.set("fromdate", fromdate) : params.delete("fromdate");
    }

    if (todate !== undefined) {
      todate ? params.set("todate", todate) : params.delete("todate");
    }

    if (date !== undefined) {
      date ? params.set("date", date) : params.delete("date");
    }

    if (classType !== undefined) {
      classType
        ? params.set("classType", classType)
        : params.delete("classType");
    }

    if (page !== undefined) {
      page > 1 ? params.set("page", page) : params.delete("page");
    }

    navigate({ search: params.toString() });
  };

  const formattedFromDate = fromDate
    ? new Date(fromDate).toISOString().split("T")[0]
    : "";
  const formattedToDate = toDate
    ? new Date(toDate).toISOString().split("T")[0]
    : "";
  const formattedDate = date ? moment(date).format("YYYY-MM-DD") : "";

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit,
        search: debouncedSearch,
        classType,
        fromdate: formattedFromDate,
        todate: formattedToDate,
        date: formattedDate,
      };

      const response = await axios.get(
        `${URL}/api/learner-attendance/createdBy/${instructorId}`,
        {
          withCredentials: true,
          params, 
        }
      );

      setAttendanceData(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setError(error.message);
      if (
        error.response &&
        (error.response.status === 401 ||
          error.response.data.message === "Credential Invalid or Expired Please Login Again")
      ) {
        window.localStorage.clear();
        setTimeout(() => navigate("/"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newSearch = params.get("search") || "";
    const newFromDate = params.get("fromdate") || "";
    const newToDate = params.get("todate") || "";
    const newPage = parseInt(params.get("page")) || 1;
    const newClassType = params.get("classType") || "";
    const newDate = params.get("date") || today;

    if (newSearch !== debouncedSearch) setDebouncedSearch(newSearch);
    if (newFromDate !== fromDate) setFromDate(newFromDate);
    if (newToDate !== toDate) setToDate(newToDate);
    if (newPage !== currentPage) setCurrentPage(newPage);
    if (newClassType !== classType) setClassType(newClassType);
    if (newDate !== date) setDate(newDate);
  }, [location.search]);

  useEffect(() => {
    if ((fromDate && !toDate) || (!fromDate && toDate)) {
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const debouncedFetch = debounce(() => {
      fetchAttendance(signal);
    }, 300);

    debouncedFetch();

    return () => controller.abort();
  }, [fromDate, toDate, currentPage, classType, date, debouncedSearch]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setSearchTerm(value);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearch(value);
      updateURLParams({
        search: searchTerm,
        fromdate: fromDate,
        todate: toDate,
        page: 1,
      });
    }, 2000);
  };
  const handleClassTypeChange = (e) => {
    const value = e.target.value;
    setClassType(value);
    updateURLParams({
      search,
      fromdate: fromDate,
      todate: toDate,
      classType: value,
      page: 1,
    });
    setCurrentPage(1);
  };
  const handleDateChange = (e) => {
    const value = e.target.value;
    setDate(value);
    updateURLParams({
      date: value,
      search,
      classType,
      page: 1,
    });
    setCurrentPage(1);
  };

  // const handleFromDateChange = (e) => {
  //   const value = e.target.value;
  //   setFromDate(value);
  //   updateURLParams({
  //     search: searchTerm,
  //     fromDate: value,
  //     toDate,
  //     page: 1,
  //   });
  //   setCurrentPage(1);
  // };

  // const handleToDateChange = (e) => {
  //   const value = e.target.value;
  //   setToDate(value);
  //   updateURLParams({
  //     search: searchTerm,
  //     fromDate,
  //     toDate: value,
  //     page: 1,
  //   });
  //   setCurrentPage(1);
  // };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      updateURLParams({
        search: searchTerm,
        fromDate,
        toDate,
        page,
      });
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h3 className="text-xl font-bold text-center md:text-left">
          Learner Attendance Details
        </h3>
        <button
          onClick={() => navigate("/instructor/attendance/add")}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition w-full md:w-auto"
        >
          Mark
        </button>
      </div>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
        <div className="relative w-full md:max-w-md lg:max-w-sm">
          <svg
            className="absolute left-3 top-2.5 text-gray-400 w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35"
            />
            <circle cx="10" cy="10" r="7" />
          </svg>

          <input
            type="text"
            className="w-full border border-gray-300 text-gray-900 text-sm rounded-lg pl-10 py-2"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
          />

          {searchTerm && (
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-600 hover:text-blue-500"
              onClick={() => {
                setSearchTerm("");
                setSearch("");
                setDebouncedSearch("");
                updateURLParams({
                  search: "",
                  fromdate: fromDate,
                  todate: toDate,
                  page: 1,
                });
                setCurrentPage(1);
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-48">
            <select
              id="floating_class"
              className="peer block w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 px-3 py-2"
              value={classType}
              onChange={handleClassTypeChange}
            >
              <option value="">All</option>
              <option value="Practical">Practical</option>
              <option value="Theory">Theory</option>
            </select>
            <label
              htmlFor="floating_class"
              className={`absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500
        peer-focus:text-blue-600
        ${classType ? "text-blue-600" : ""}`}
            >
              Class Type
            </label>
          </div>

          <div className="relative w-full sm:w-48">
            <input
              type="date"
              value={date}
              onChange={handleDateChange}
              onFocus={(e) => (e.nativeEvent.target.defaultValue = "")}
              className="peer border border-gray-300 text-gray-900 text-sm rounded-lg px-3 py-2 w-full"
            />
            <label className="absolute left-3 top-[-8px] text-xs bg-white px-1 text-gray-500">
              Date
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
                <th className="px-6 py-4">Profile</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Admission No</th>
                <th className="px-6 py-4">Course Type</th>
                <th className="px-6 py-4">Class Type</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Check-In</th>
                <th className="px-6 py-4">Check-Out</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.length > 0 ? (
                attendanceData.map((item, index) => (
                  <tr key={index} className="bg-white border-b">
                    <td className="px-6 py-4">
                      {index + 1 + (currentPage - 1) * limit}
                    </td>
                    <td className="px-6 py-4">
                      <img
                        src={`${URL}/api/image-proxy/${extractDriveFileId(
                          item?.learner?.photo
                        )}`}
                        alt={item.learner.fullName}
                        className="w-16 h-16 object-cover rounded-full border-4 border-white shadow-md"
                      />
                    </td>
                    <td className="px-6 py-4">{item.learner?.fullName}</td>
                    <td className="px-6 py-4">
                      {item.learner?.admissionNumber}
                    </td>
                    <td className="px-6 py-4">{item.course?.courseName}</td>
                    <td className="px-6 py-4">{item.classType}</td>
                    <td className="px-6 py-4">
                      {item?.date
                        ? moment(item.date).format("DD-MM-YYYY")
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {item.checkIn
                        ? moment(item.checkIn).format("hh:mm A")
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      {item.checkOut
                        ? moment(item.checkOut).format("hh:mm A")
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center text-red-600 py-6">
                    Attendance not found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && attendanceData.length > 0 && (
        <Pagination
          CurrentPage={currentPage}
          TotalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default InsLearnerAttTable;
