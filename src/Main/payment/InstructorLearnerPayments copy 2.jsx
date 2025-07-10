import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import Pagination from "../../Components/Pagination";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion";
import { useRole } from "../../Components/AuthContext/AuthContext";
import { URL } from "../../App";

const InstructorLearnerPayments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuthState } = useRole();
  const instructorId = user?.user_id;

  const controllerRef = useRef(null);
  const debounceRef = useRef(null);

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const itemsPerPage = 10;

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toISOString().split("T")[0] : "";

  const updateURLParams = (paramsObj) => {
    const newParams = new URLSearchParams();

    if (paramsObj.search) newParams.set("search", paramsObj.search);
    if (paramsObj.paymentMethod) newParams.set("paymentMethod", paramsObj.paymentMethod);
    if (paramsObj.fromdate) newParams.set("fromdate", formatDate(paramsObj.fromdate));
    if (paramsObj.todate) newParams.set("todate", formatDate(paramsObj.todate));
    newParams.set("page", paramsObj.page ? String(paramsObj.page) : "1");
    newParams.set("limit", String(itemsPerPage));

    const currentParams = new URLSearchParams(location.search);
    if (newParams.toString() !== currentParams.toString()) {
      navigate({ search: newParams.toString() }, { replace: true });
    }
  };

  const fetchPayments = async () => {
    if (!instructorId) return;

    if ((fromDate && !toDate) || (!fromDate && toDate) || (fromDate && toDate && new Date(fromDate) > new Date(toDate))) {
      setPayments([]);
      return;
    }

    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();

    setLoading(true);
    try {
      const { data } = await axios.get(`${URL}/api/payments/createdBy/${instructorId}`, {
        params: {
          search: searchTerm || undefined,
          paymentMethod: paymentMethod || undefined,
          fromdate: fromDate || undefined,
          todate: toDate || undefined,
          page: currentPage,
          limit: itemsPerPage,
        },
        withCredentials: true,
        signal: controllerRef.current.signal,
      });

      setPayments(data.payments || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      if (
        error?.response?.status === 401 ||
        error?.response?.data?.message === "Credential Invalid or Expired Please Login Again"
      ) {
        clearAuthState();
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  // Sync from URL on first load
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const search = params.get("search") || "";
    const payment = params.get("paymentMethod") || "";
    const from = params.get("fromdate") || "";
    const to = params.get("todate") || "";
    const page = Number(params.get("page")) || 1;

    setSearchTerm(search);
    setPaymentMethod(payment);
    setFromDate(from);
    setToDate(to);
    setCurrentPage(page);

    // Ensure URL is clean and contains limit
    updateURLParams({
      search,
      paymentMethod: payment,
      fromdate: from,
      todate: to,
      page,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Instant fetch for non-search filters
  useEffect(() => {
    if (!searchTerm) fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod, fromDate, toDate, currentPage]);

  // Debounced fetch for search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPayments();
    }, 2000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setCurrentPage(1);
    updateURLParams({
      search: val,
      paymentMethod,
      fromdate: fromDate,
      todate: toDate,
      page: 1,
    });
  };

  const handlePaymentMethodChange = (e) => {
    const val = e.target.value;
    setPaymentMethod(val);
    setCurrentPage(1);
    updateURLParams({
      search: searchTerm,
      paymentMethod: val,
      fromdate: fromDate,
      todate: toDate,
      page: 1,
    });
  };

  const handleFromDateChange = (e) => {
    const val = e.target.value;
    setFromDate(val);
    if (!val) setToDate("");
    setCurrentPage(1);
    updateURLParams({
      search: searchTerm,
      paymentMethod,
      fromdate: val,
      todate: "",
      page: 1,
    });
  };

  const handleToDateChange = (e) => {
    const val = e.target.value;
    setToDate(val);
    setCurrentPage(1);
    updateURLParams({
      search: searchTerm,
      paymentMethod,
      fromdate: fromDate,
      todate: val,
      page: 1,
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateURLParams({
      search: searchTerm,
      paymentMethod,
      fromdate: fromDate,
      todate: toDate,
      page,
    });
  };

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h3 className="text-xl font-bold text-center md:text-left">
          Learner Payment Details
        </h3>

        <button
          onClick={() => navigate("/instructor/payment/add")}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300 w-full md:w-auto"
        >
          Add Payment
        </button>
      </div>

      <div className="flex flex-col gap-4 md:flex-wrap md:flex-row md:items-end md:justify-between mb-4">
        <div className="relative w-full md:w-auto md:max-w-md lg:max-w-sm flex-1">
          <svg
            className="absolute left-3 top-2.5 text-gray-400 w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
            <circle cx="10" cy="10" r="7" />
          </svg>
          <input
            type="text"
            className="w-full border border-gray-300 text-gray-900 text-sm rounded-lg pl-10 pr-8 py-2"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-blue-500"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
                updateURLParams({
                  search: "",
                  paymentMethod,
                  fromdate: fromDate,
                  todate: toDate,
                  page: 1,
                });
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 w-full md:flex-1 md:justify-end">
          <div className="relative w-full sm:w-40">
            <select
              className="peer block w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 px-3 py-2"
              value={paymentMethod}
              onChange={handlePaymentMethodChange}
            >
              <option value="">All</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
            </select>
            <label className="absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500 peer-focus:text-blue-600">
              Payment
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-40">
              <input
                type="date"
                value={fromDate}
                onChange={handleFromDateChange}
                className="peer border border-gray-300 text-gray-900 text-sm rounded-lg px-3 py-2 w-full"
              />
              <label className="absolute left-3 top-[-8px] text-xs bg-white px-1 text-gray-500">
                From
              </label>
            </div>
            <div className="relative w-full sm:w-40">
              <input
                type="date"
                value={toDate}
                onChange={handleToDateChange}
                disabled={!fromDate}
                min={fromDate}
                className="peer border border-gray-300 text-gray-900 text-sm rounded-lg px-3 py-2 w-full disabled:bg-gray-100"
              />
              <label className="absolute left-3 top-[-8px] text-xs bg-white px-1 text-gray-500">
                To
              </label>
            </div>
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
                <th className="px-6 py-4">Payment Method</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Fees (₹)</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map((payment, index) => (
                  <tr key={payment._id} className="bg-white border-b">
                    <td className="px-6 py-4">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <img
                        src={`${URL}/api/image-proxy/${extractDriveFileId(payment.learner?.photo)}`}
                        alt={payment.learner?.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </td>
                    <td className="px-6 py-4">{payment.learner?.fullName}</td>
                    <td className="px-6 py-4">{payment.learner?.admissionNumber}</td>
                    <td className="px-6 py-4">{payment.paymentMethod}</td>
                    <td className="px-6 py-4">
                      {moment(payment.date).format("DD-MM-YYYY")}
                    </td>
                    <td className="px-6 py-4">{payment.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-red-600">
                    Payments not found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {payments.length > 0 && (
            <Pagination
              CurrentPage={currentPage}
              TotalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default InstructorLearnerPayments;
