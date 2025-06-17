import { useState, useEffect, useRef } from "react";
import axios from "axios";
import moment from "moment";
import { useNavigate, useLocation } from "react-router-dom";
import { URL } from "../../../App";
import Pagination from "../../../Components/Pagination";
import { jwtDecode } from "jwt-decode";

const LearnerSingleAttendance = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [attendanceData, setAttendanceData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [toDate, setToDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [search, setSearch] = useState("");
  const [classType, setClassType] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [date, setDate] = useState("");

  const limit = 5;

  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const id = decoded?.user_id;
  const debounceTimeout = useRef(null);

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
      if (search.trim().length >= 3) {
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

  useEffect(() => {
    const controller = new AbortController();
    const fetchAttendanceData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!token || !id) return;

        const formattedFromDate = fromDate
          ? moment(fromDate).format("YYYY-MM-DD")
          : "";
        const formattedToDate = toDate
          ? moment(toDate).format("YYYY-MM-DD")
          : "";
        const formattedDate = date ? moment(date).format("YYYY-MM-DD") : "";

        if ((fromDate && !toDate) || (!fromDate && toDate)) return;

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
          `${URL}/api/learner-attendance/${id}`,
          {
            params,
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        setAttendanceData(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        setError(error.message);
        if (
          error.response &&
          (error.response.status === 401 ||
            error.response.data.message === "Invalid token")
        ) {
          setTimeout(() => {
            localStorage.clear();
            navigate("/");
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();

    return () => controller.abort();
  }, [fromDate, toDate, currentPage, classType, date, debouncedSearch]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newSearch = params.get("search") || "";
    const newFromDate = params.get("fromdate") || "";
    const newToDate = params.get("todate") || "";
    const newPage = parseInt(params.get("page")) || 1;
    const newClassType = params.get("classType") || "";
    const newDate = params.get("date") || "";

    if (newSearch !== search) setSearch(newSearch);
    if (newFromDate !== fromDate) setFromDate(newFromDate);
    if (newToDate !== toDate) setToDate(newToDate);
    if (newPage !== currentPage) setCurrentPage(newPage);
    if (newClassType !== classType) setClassType(newClassType);
    if (newDate !== date) setDate(newDate);
  }, [location.search]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearch(value);
      updateURLParams({
        search: value,
        fromdate: fromDate,
        todate: toDate,
        date: date,
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
  // const handleDateChange = (e) => {
  //   const value = e.target.value;
  //   setDate(value);
  //   updateURLParams({
  //     date: value,
  //     search,
  //     classType,
  //     page: 1,
  //   });
  //   setCurrentPage(1);
  // };

  const handleFromDateChange = (e) => {
    const value = e.target.value;
    setFromDate(value);
    updateURLParams({
      fromdate: value,
      todate: toDate,
      search,
      page: 1,
    });
    setCurrentPage(1);
  };

  const handleToDateChange = (e) => {
    const value = e.target.value;
    setToDate(value);
    updateURLParams({
      fromdate: fromDate,
      todate: value,
      search,
      page: 1,
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      updateURLParams({
        search,
        fromdate: fromDate,
        todate: toDate,
        page,
      });
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-row justify-between items-center gap-4 mb-4">
        <h3 className="text-xl font-bold text-center md:text-left">
          Attendance History
        </h3>
      </div>

      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative w-full md:max-w-md">
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
            type="search"
            className="w-full border border-gray-300 text-gray-900 text-sm rounded-lg pl-10 py-2"
            placeholder="Search"
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-36">
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
              className={`absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500 peer-focus:text-blue-600 ${
                classType ? "text-blue-600" : ""
              }`}
            >
              Class Type
            </label>
          </div>

          <div className="relative w-full md:w-40">
            <input
              type="date"
              value={fromDate}
              onChange={handleFromDateChange}
              onFocus={(event) => (event.nativeEvent.target.defaultValue = "")}
              className="peer border border-gray-300 text-gray-900 text-sm rounded-lg px-3 py-2 w-full"
            />
            <label className="absolute left-3 top-[-8px] text-xs bg-white px-1 text-gray-500">
              From
            </label>
          </div>

          <div className="relative w-full md:w-40">
            <input
              type="date"
              value={toDate}
              onChange={handleToDateChange}
              onFocus={(event) => (event.nativeEvent.target.defaultValue = "")}
              className="peer border border-gray-300 text-gray-900 text-sm rounded-lg px-3 py-2 w-full"
            />
            <label className="absolute left-3 top-[-8px] text-xs bg-white px-1 text-gray-500">
              To
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
                <th className="px-6 py-4">Course Type</th>
                <th className="px-6 py-4">Class Type</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Check-in</th>
                <th className="px-6 py-4">Check-out</th>
                <th className="px-6 py-4">Marked By</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData && attendanceData.length > 0 ? (
                attendanceData.map((record, index) => (
                  <tr key={record._id} className="bg-white border-b">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">{record.course?.courseName}</td>
                    <td className="px-6 py-4">{record.classType}</td>
                    <td className="px-6 py-4">
                      {moment(record.date).format("DD-MM-YYYY")}
                    </td>
                    <td className="px-6 py-4">
                      {record.checkIn
                        ? moment(record.checkIn).format("hh:mm A")
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      {record.checkOut
                        ? moment(record.checkOut).format("hh:mm A")
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span>{record.createdBy.username}</span>
                        <span
                          className={`text-sm ${
                            record.createdBy.role === "Admin"
                              ? "text-green-500"
                              : record.createdBy.role === "Instructor"
                              ? "text-blue-500"
                              : "text-orange-500"
                          }`}
                        >
                          {record.createdBy.role}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-red-600 py-6">
                    Attendance not found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* {error && <div className="text-center text-red-600">{error}</div>} */}
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

export default LearnerSingleAttendance;
