import { useState, useEffect, useRef } from "react";
import axios from "axios";
import moment from "moment";
import { useNavigate, useLocation } from "react-router-dom";
import { URL } from "../../App";
import Pagination from "../../Components/Pagination";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";

const TestTable = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [tests, setTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [testType, setTestType] = useState("");
  const [result, setResult] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const updateURLParams = (params) => {
    const query = new URLSearchParams();
    if (params.search?.trim()) query.set("search", params.search.trim());
    if (params.testType) query.set("testType", params.testType);
    if (params.result) query.set("result", params.result);
    if (params.fromDate) query.set("fromDate", params.fromDate);
    if (params.toDate) query.set("toDate", params.toDate);
    query.set("page", params.page || 1);
    query.set("limit", limit);
    navigate({ search: query.toString() });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get("search") || "");
    setTestType(params.get("testType") || "");
    setResult(params.get("result") || "");
    setFromDate(params.get("fromDate") || "");
    setToDate(params.get("toDate") || "");
    setCurrentPage(Number(params.get("page")) || 1);
  }, [location.search]);

  const fetchTests = async () => {
    if (!fromDate || !toDate) return;
    setLoading(true);
    try {
      const params = {
        search: searchQuery || undefined,
        testType: testType || undefined,
        result: result || undefined,
        fromDate,
        toDate,
        page: currentPage,
        limit,
      };
      const response = await axios.get(`${URL}/api/tests`, { params });
      setTests(response.data.tests || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching tests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!fromDate || !toDate) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchTests();
    }, searchQuery ? 2000 : 0);
  }, [searchQuery, testType, result, fromDate, toDate, currentPage]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);
    updateURLParams({ search: value, testType, result, fromDate, toDate, page: 1 });
  };

  const handleTestTypeChange = (e) => {
    const value = e.target.value;
    setTestType(value);
    setCurrentPage(1);
    updateURLParams({ search: searchQuery, testType: value, result, fromDate, toDate, page: 1 });
  };

  const handleResultChange = (e) => {
    const value = e.target.value;
    setResult(value);
    setCurrentPage(1);
    updateURLParams({ search: searchQuery, testType, result: value, fromDate, toDate, page: 1 });
  };

  const handleFromDateChange = (e) => {
    const value = e.target.value;
    setFromDate(value);
    const newToDate = value ? toDate : "";
    setToDate(newToDate);
    updateURLParams({ search: searchQuery, testType, result, fromDate: value, toDate: newToDate, page: 1 });
    setCurrentPage(1);
  };

  const handleToDateChange = (e) => {
    const value = e.target.value;
    setToDate(value);
    if (fromDate && value) {
      updateURLParams({ search: searchQuery, testType, result, fromDate, toDate: value, page: 1 });
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateURLParams({ search: searchQuery, testType, result, fromDate, toDate, page });
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h3 className="text-xl font-bold text-center md:text-left">Test Details</h3>
        <button
          onClick={() => navigate("/admin/test-details/new")}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition w-full md:w-auto"
        >
          Add Test
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
        <div className="w-full md:w-1/3">
          <div className="relative">
            <input
              type="text"
              className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500"
                onClick={() => {
                  setSearchQuery("");
                  updateURLParams({ search: "", testType, result, fromDate, toDate, page: 1 });
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="w-full md:w-auto flex flex-wrap md:flex-nowrap gap-4 justify-end">
          <select
            className="border rounded px-3 py-2 text-sm"
            value={testType}
            onChange={handleTestTypeChange}
          >
            <option value="">All Test Types</option>
            <option value="Theory Test">Theory Test</option>
            <option value="Practical Test">Practical Test</option>
          </select>

          <select
            className="border rounded px-3 py-2 text-sm"
            value={result}
            onChange={handleResultChange}
          >
            <option value="">All Results</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Pass">Pass</option>
            <option value="Fail">Fail</option>
          </select>

          <input
            type="date"
            value={fromDate}
            onChange={handleFromDateChange}
            className="border rounded px-3 py-2 text-sm"
          />

          <input
            type="date"
            value={toDate}
            onChange={handleToDateChange}
            onBlur={handleToDateChange}
            disabled={!fromDate}
            min={fromDate}
            className="border rounded px-3 py-2 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 text-blue-600 font-semibold text-lg">Loading...</div>
      ) : (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-sm text-gray-700 bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-2">S.No</th>
                <th className="px-4 py-2">Profile</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-6 py-2">Admission No</th>
                <th className="px-4 py-2">Test Type</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Result</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.length > 0 ? (
                tests.map((test, index) => (
                  <tr key={test._id} className="bg-white border-b">
                    <td className="px-6 py-4">{(currentPage - 1) * limit + index + 1}</td>
                    <td className="px-6 py-4">
                      <img
                        src={`${URL}/api/image-proxy/${extractDriveFileId(test.learner?.photo)}`}
                        alt={test.learner?.fullName}
                        className="w-16 h-16 object-cover rounded-full border-4 border-white shadow-md"
                      />
                    </td>
                    <td className="px-6 py-4">{test.learner?.fullName}</td>
                    <td className="px-6 py-4">{test.learner?.admissionNumber}</td>
                    <td className="px-6 py-4">{test.testType}</td>
                    <td className="px-6 py-4">{moment(test.date).format("DD-MM-YYYY")}</td>
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
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/admin/test-details/${test._id}/edit`)}
                        className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                      >
                        ✎
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-red-600">
                    Tests not found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tests.length > 0 && (
        <Pagination
          CurrentPage={currentPage}
          TotalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default TestTable;
