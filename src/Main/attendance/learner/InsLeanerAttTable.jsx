import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import Pagination from "../../../Components/Pagination";
import { extractDriveFileId } from "../../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole  } from "../../../Components/AuthContext/AuthContext";
import { URL } from "../../../App";

const InsLearnerAttTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
   const {role, user,setUser,setRole,clearAuthState} =  useRole();
  const instructorId = user?.user_id;

  const [attendanceData, setAttendanceData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [classType, setClassType] = useState("");
  const [date, setDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const limit = 10;

  const abortControllerRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  const updateURLParams = (paramsToUpdate) => {
    const current = new URLSearchParams(location.search);
    const newParams = new URLSearchParams();

    const {
      search = debouncedSearch,
      fromdate = fromDate,
      todate = toDate,
      date: selectedDate = date,
      page = currentPage,
      classType: selectedClassType = classType,
    } = paramsToUpdate;

    if (search?.trim()) newParams.set("search", search.trim());
    if (fromdate) newParams.set("fromdate", fromdate);
    if (todate) newParams.set("todate", todate);
    if (selectedDate) newParams.set("date", selectedDate);
    if (selectedClassType) newParams.set("classType", selectedClassType);
    if (page > 1) newParams.set("page", page);

    if (newParams.toString() !== current.toString()) {
      navigate({ search: newParams.toString() }, { replace: true });
    }
  };

  const fetchAttendance = async (signal) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit,
        search: debouncedSearch,
        classType,
        fromdate: fromDate,
        todate: toDate,
        date,
      };

      const res = await axios.get(`${URL}/api/learner-attendance/createdBy/${instructorId}`, {
        params,
        withCredentials: true,
        signal,
      });

      setAttendanceData(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
         if (!axios.isCancel(err)) {
            setError(err.response.data.message);
        if (err.response &&(err.response.status === 401 ||err.response.data.message === "Invalid token")) {
            setTimeout(() => {
              clearAuthState();
              // navigate("/");
            }, 3000);
          }
        }
      }finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    setSearchTerm(params.get("search") || "");
    setDebouncedSearch(params.get("search") || "");
    setFromDate(params.get("fromdate") || "");
    setToDate(params.get("todate") || new Date().toISOString().split("T")[0]);
    setDate(params.get("date") || "");
    setClassType(params.get("classType") || "");
    setCurrentPage(parseInt(params.get("page") || "1", 10));
  }, [location.search]);

  useEffect(() => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
      updateURLParams({ search: searchTerm, page: 1 });
    }, 2000);

    return () => clearTimeout(debounceTimeoutRef.current);
  }, [searchTerm]);

  useEffect(() => {
    if (!instructorId) return;
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    fetchAttendance(controller.signal);
    return () => controller.abort();
  }, [debouncedSearch, fromDate, toDate, classType, date, currentPage]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleClassTypeChange = (e) => {
    const value = e.target.value;
    setClassType(value);
    setCurrentPage(1);
    updateURLParams({ classType: value, page: 1 });
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    setDate(value);
    setCurrentPage(1);
    updateURLParams({ date: value, page: 1 });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      updateURLParams({ page });
    }
  };
  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h3 className="text-xl font-bold text-center md:text-left">Learner Attendance Details</h3>
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
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
                setDebouncedSearch("");
                updateURLParams({ search: "", fromdate: fromDate, todate: toDate, page: 1 });
                setCurrentPage(1);
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
              className={`absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500 peer-focus:text-blue-600 ${
                classType ? "text-blue-600" : ""
              }`}
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
            <label className="absolute left-3 top-[-8px] text-xs bg-white px-1 text-gray-500">Date</label>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center font-semibold text-blue-600">Loading...</div>
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
                    <td className="px-6 py-4">{index + 1 + (currentPage - 1) * limit}</td>
                    <td className="px-6 py-4">
                      <img
                        src={`${URL}/api/image-proxy/${extractDriveFileId(item?.learner?.photo)}`}
                        alt={item.learner.fullName}
                        className="w-16 h-16 object-cover rounded-full border-4 border-white shadow-md"
                      />
                    </td>
                    <td className="px-6 py-4">{item.learner?.fullName}</td>
                    <td className="px-6 py-4">{item.learner?.admissionNumber}</td>
                    <td className="px-6 py-4">{item.course?.courseName}</td>
                    <td className="px-6 py-4">{item.classType}</td>
                    <td className="px-6 py-4">
                      {item?.date ? moment(item.date).format("DD-MM-YYYY") : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {item.checkIn ? moment(item.checkIn).format("hh:mm A") : "-"}
                    </td>
                    <td className="px-6 py-4">
                      {item.checkOut ? moment(item.checkOut).format("hh:mm A") : "-"}
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
        <Pagination CurrentPage={currentPage} TotalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </div>
  );
};

export default InsLearnerAttTable;
