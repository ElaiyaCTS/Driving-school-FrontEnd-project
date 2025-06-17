import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { URL } from "../../../App";
import { useNavigate, useLocation } from "react-router-dom";
import Pagination from "../../../Components/Pagination";
import { extractDriveFileId } from "../../../Components/ImageProxyRouterFunction/funtion.js";

const LearnerAttTable = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [classType, setClassType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [date, setDate] = useState("");

  const limit = 10;

  useEffect(() => {
    setFromDate(moment().format("yyyy-MM-DD"));
    setToDate(moment().format("yyyy-MM-DD"));
  }, []);

  const updateURLParams = ({
    search,
    fromdate,
    todate,
    classType,
    date,
    page,
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
      if (fromdate) {
        params.set("fromdate", fromdate);
      } else {
        params.delete("fromdate");
      }
    }

    if (todate !== undefined) {
      if (todate) {
        params.set("todate", todate);
      } else {
        params.delete("todate");
      }
    }

    if (classType !== undefined) {
      if (classType) {
        params.set("classType", classType);
      } else {
        params.delete("classType");
      }
    }

    if (date !== undefined) {
      if (date) {
        params.set("date", date);
      } else {
        params.delete("date");
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
    let debounceTimeout;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");

        const formattedFromDate = fromDate
          ? moment(fromDate).format("YYYY-MM-DD")
          : "";
        const formattedToDate = toDate
          ? moment(toDate).format("YYYY-MM-DD")
          : "";
        const formattedDate = date ? moment(date).format("YYYY-MM-DD") : "";

        if ((fromDate && !toDate) || (!fromDate && toDate)) return;

        const response = await axios.get(`${URL}/api/learner-attendance`, {
          params: {
            fromdate: formattedFromDate,
            todate: formattedToDate,
            page: currentPage,
            limit,
            classType,
            search: searchTerm,
            date: formattedDate,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: searchTerm.trim() ? controller.signal : undefined,
        });

        setAttendanceData(response.data.data);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        if (axios.isCancel(error) || error.name === "CanceledError") {
          console.log("Request cancelled");
        } else {
          console.error("Error fetching data:", error);
          setError(error.message);
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
      } finally {
        setLoading(false);
      }
    };

    if (searchTerm.trim()) {
      debounceTimeout = setTimeout(fetchData, 2000);
    } else {
      fetchData();
    }

    return () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
      if (searchTerm.trim()) controller.abort();
    };
  }, [fromDate, toDate, currentPage, classType, date, searchTerm]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchFromURL = params.get("search") || "";
    const fromDateFromURL =
      params.get("fromdate") || moment().format("yyyy-MM-DD");
    const toDateFromURL = params.get("todate") || moment().format("yyyy-MM-DD");
    const pageFromURL = parseInt(params.get("page")) || 1;
    const classTypeFromURL = params.get("classType") || "";
    const newDateFromURL = params.get("date") || "";

    setSearchTerm(searchFromURL);
    setFromDate(fromDateFromURL);
    setToDate(toDateFromURL);
    setClassType(classTypeFromURL);
    setCurrentPage(pageFromURL);
    setDate(newDateFromURL);
  }, [location.search]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setDate("");

    updateURLParams({
      search: value,
      fromdate: fromDate,
      todate: toDate,
      date: "",
      page: 1,
    });
    setCurrentPage(1);
  };

  // const handleDateChange = (e) => {
  //   const value = e.target.value;
  //   setDate(value);
  //   setSearchTerm("");
  //   updateURLParams({
  //     date: value,
  //     search: "",
  //     classType,
  //     page: 1,
  //   });
  //   setCurrentPage(1);
  // };

  const handleFromDateChange = (e) => {
    const value = e.target.value;
    setFromDate(value);

    updateURLParams({
      search: searchTerm,
      fromdate: value,
      todate: toDate,
      page: 1,
    });
    setCurrentPage(1);
  };

  const handleToDateChange = (e) => {
    const value = e.target.value;

    setToDate(value);
    updateURLParams({
      search: searchTerm,
      fromdate: fromDate,
      todate: value,
      page: 1,
    });
    setCurrentPage(1);
  };

  const handleClassTypeChange = (e) => {
    const value = e.target.value;
    setClassType(value);
    updateURLParams({
      search: searchTerm,
      fromdate: fromDate,
      todate: toDate,
      classType: value,
      page: 1,
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      updateURLParams({
        search: searchTerm,
        fromdate: fromDate,
        todate: toDate,
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
          onClick={() => navigate("/admin/attendance/learner/mark")}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition w-full md:w-auto"
        >
          Mark
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="relative w-full md:w-1/3">
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
            <circle cx="10" cy="10" r="7"></circle>
          </svg>
          <input
            type="search"
            className="w-full border border-gray-300 text-gray-900 text-sm rounded-lg pl-10 py-2"
            placeholder="Search"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap md:flex-nowrap gap-4 w-full md:w-auto md:justify-end">
          <div className="relative w-full sm:w-36">
            <select
              id="floating_class"
              className="peer block w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 px-3 py-2"
              value={classType}
              onChange={handleClassTypeChange}
            >
              <option value="">All</option>
              <option value="Theory">Theory</option>
              <option value="Practical">Practical</option>
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

          {/* From Date */}
          <div className="relative w-full sm:w-40">
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

          {/* To Date */}
          <div className="relative w-full sm:w-40">
            <input
              type="date"
              value={toDate}
              onChange={handleToDateChange}
              className="peer border border-gray-300 text-gray-900 text-sm rounded-lg px-3 py-2 w-full"
            />
            <label className="absolute left-3 top-[-8px] text-xs bg-white px-1 text-gray-500">
              To
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
                  <th className="px-6 py-4">Marked By</th>
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
                            item.learner.photo
                          )}`}
                          alt={item.learner.fullName}
                          className="w-16 h-16 object-cover rounded-full border-4 border-white shadow-md"
                        />
                      </td>
                      <td className="px-6 py-4">{item.learner.fullName}</td>
                      <td className="px-6 py-4">
                        {item.learner.admissionNumber}
                      </td>
                      <td className="px-6 py-4">{item.course.courseName}</td>
                      <td className="px-6 py-4">{item.classType}</td>
                      <td className="px-6 py-4">
                        {item?.date
                          ? moment(item?.date).format("DD-MM-YYYY")
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
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span>{item.createdBy.username}</span>
                          {item.createdBy.role.toLowerCase() === "admin" ? (
                            <span className="text-sm text-green-500 capitalize">
                              {item.createdBy.role}
                            </span>
                          ) : (
                            <a
                              href={`/admin/${item.createdBy.role.toLowerCase()}/${
                                item.createdBy.refDetails._id
                              }/view`}
                              className={`text-sm hover:underline ${
                                item.createdBy.role.toLowerCase() ===
                                "instructor"
                                  ? "text-blue-500"
                                  : "text-orange-500"
                              } capitalize`}
                            >
                              {item.createdBy.role}
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center text-red-600 py-4">
                      Attendance not found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!loading && attendanceData.length > 0 && (
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

export default LearnerAttTable;
