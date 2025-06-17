import { useState, useEffect } from "react";
import { URL } from "../../App";
import axios from "axios";
import Pagination from "../../Components/Pagination";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import moment from "moment";

const LearnerSingleTest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tests, setTests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [testType, setTestType] = useState("");
  const [result, setResult] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);

  const limit = 5;

  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const testId = decoded?.user_id;

  const formatDate = (date) => {
    return date ? new Date(date).toISOString().split("T")[0] : "";
  };

  const updateURLParams = ({
    search,
    testType,
    result,
    fromDate,
    toDate,
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

    if (testType !== undefined) {
      if (testType && testType !== "All") {
        params.set("testType", testType);
      } else {
        params.delete("testType");
      }
    }

    if (result !== undefined) {
      if (result && result !== "All") {
        params.set("result", result);
      } else {
        params.delete("result");
      }
    }

    if (fromDate !== undefined) {
      if (fromDate) {
        params.set("fromdate", formatDate(fromDate));
      } else {
        params.delete("fromdate");
      }
    }

    if (toDate !== undefined) {
      if (toDate) {
        params.set("todate", formatDate(toDate));
      } else {
        params.delete("todate");
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

    const fetchTests = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
          console.error(
            "Invalid date range. 'From Date' cannot be greater than 'To Date'."
          );
          return;
        }

        const queryParams = {
          page: currentPage,
          limit,
          search: searchQuery,
          testType,
          result,
          fromdate: formatDate(fromDate),
          todate: formatDate(toDate),
        };

        const response = await axios.get(`${URL}/api/tests/${testId}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: queryParams,
          signal: controller.signal,
        });

        setTests(response.data.tests || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        if (error.name !== "AbortError") {
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

    if (searchQuery) {
      debounceTimer = setTimeout(() => {
        fetchTests();
      }, 2000);
    } else {
      fetchTests();
    }

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [
    searchQuery,
    testType,
    result,
    fromDate,
    toDate,
    currentPage,
    limit,
    testId,
  ]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setSearchQuery(urlParams.get("search") || "");
    setTestType(urlParams.get("testType") || "");
    setResult(urlParams.get("result") || "");
    setFromDate(urlParams.get("fromdate") || "");
    setToDate(urlParams.get("todate") || "");
    setCurrentPage(Number(urlParams.get("page")) || 1);
  }, [location.search]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);
    updateURLParams({
      search: value,
      testType,
      result,
      fromDate,
      toDate,
      page: 1,
    });
  };

  const handleTestTypeChange = (e) => {
    const value = e.target.value;
    setTestType(value);
    setCurrentPage(1);
    updateURLParams({
      search: searchQuery,
      testType: value,
      result,
      fromDate,
      toDate,
      page: 1,
    });
  };

  const handleResultChange = (e) => {
    const value = e.target.value;
    setResult(value);
    setCurrentPage(1);
    updateURLParams({
      search: searchQuery,
      testType,
      result: value,
      fromDate,
      toDate,
      page: 1,
    });
  };

  const handleFromDateChange = (e) => {
    const value = e.target.value;
    setFromDate(value);
    setCurrentPage(1);
    updateURLParams({
      search: searchQuery,
      testType,
      result,
      fromDate: value,
      toDate,
      page: 1,
    });
  };

  const handleToDateChange = (e) => {
    const value = e.target.value;
    setToDate(value);
    setCurrentPage(1);
    updateURLParams({
      search: searchQuery,
      testType,
      result,
      fromDate,
      toDate: value,
      page: 1,
    });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      updateURLParams({
        search: searchQuery,
        testType,
        result,
        fromDate,
        toDate,
        page,
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-row justify-between items-center gap-4 mb-4">
        <h3 className="text-xl font-bold text-center md:text-left">
          Test History
        </h3>
      </div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div className="relative w-full md:w-64">
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
            value={searchQuery}
            onChange={handleSearch}
          />

          {searchQuery && (
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500"
              onClick={() => {
                setSearchQuery("");
                updateURLParams({
                  search: "",
                  testType,
                  result,
                  fromDate,
                  toDate,
                  page: 1,
                });
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

        <div className="flex flex-col sm:grid sm:grid-cols-2 md:flex md:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-36">
            <select
              id="floating_testType"
              className="peer block w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600 px-3 py-2"
              value={testType}
              onChange={handleTestTypeChange}
            >
              <option value="">All</option>
              <option value="Theory Test">Theory Test</option>
              <option value="Practical Test">Practical Test</option>
            </select>
            <label
              htmlFor="floating_testType"
              className={`absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500 peer-focus:text-blue-600 ${
                testType ? "text-blue-600" : ""
              }`}
            >
              Test Type
            </label>
          </div>

          <div className="relative w-full md:w-36">
            <select
              id="floating_result"
              className="peer block w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600 px-3 py-2"
              value={result}
              onChange={handleResultChange}
            >
              <option value="">All</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
            </select>
            <label
              htmlFor="floating_result"
              className={`absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500 peer-focus:text-blue-600 ${
                result ? "text-blue-600" : ""
              }`}
            >
              Result Type
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
      ) : tests.length === 0 ? (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-center text-gray-500 dark:text-gray-400">
            <thead className="text-sm text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr className="bg-gray-100">
                <th className="px-4 py-2">S.No</th>
                <th className="px-4 py-2">Test Type</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Result</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-red-600">
                  Tests not found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-sm text-gray-700 bg-gray-50">
                <tr>
                  <th className="px-4 py-2">S.No</th>
                  <th className="px-4 py-2">Test Type</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Result</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test, index) => (
                  <tr
                    key={test._id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    <td className="px-6 py-4">
                      {(currentPage - 1) * limit + index + 1}
                    </td>
                    <td className="px-6 py-4">{test.testType}</td>
                    <td className="px-6 py-4">
                      {moment(test.date).format("DD-MM-YYYY")}
                    </td>
                    <td
                      className={`px-6 py-4 ${
                        test.result === "Pass"
                          ? "text-green-600"
                          : test.result === "Scheduled"
                          ? "text-blue-600"
                          : test.result === "Fail"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {test.result}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            CurrentPage={currentPage}
            TotalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default LearnerSingleTest;
