import { useEffect, useState } from "react";
import axios from "axios";
import { URL } from "../../App";
import Pagination from "../../Components/Pagination";
import moment from "moment";
import { useNavigate, useLocation } from "react-router-dom";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../Components/AuthContext/AuthContext";

const PaymentTable = () => {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
        const {role, user,setUser,setRole,clearAuthState} =  useRole();

  const itemsPerPage = 10;

  const formatDate = (date) => {
    return date ? new Date(date).toISOString().split("T")[0] : "";
  };

  const updateURLParams = ({
    searchTerm,
    paymentMethod,
    fromDate,
    toDate,
    page,
  }) => {
    const params = new URLSearchParams();

    if (searchTerm) params.set("search", searchTerm);
    if (paymentMethod && paymentMethod !== "All")
      params.set("paymentMethod", paymentMethod);
    if (fromDate) params.set("fromdate", formatDate(fromDate));
    if (toDate) params.set("todate", formatDate(toDate));
    params.set("page", page);
    params.set("limit", itemsPerPage);

    navigate({ search: params.toString() });
  };

useEffect(() => {
  const controller = new AbortController();
  let debounceTimer;

  const fetchPayments = async () => {
    setLoading(true);
    try {

      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      if (paymentMethod && paymentMethod !== "All")
        params.set("paymentMethod", paymentMethod);
      if (fromDate && toDate) {
        params.set("fromdate", formatDate(fromDate));
        params.set("todate", formatDate(toDate));
      }
      params.set("page", currentPage);
      params.set("limit", itemsPerPage);

      updateURLParams({
        searchTerm,
        paymentMethod,
        fromDate,
        toDate,
        page: currentPage,
      });

      const response = await axios.get(`${URL}/api/payments`, {
        params,
        withCredentials: true,
        signal: searchTerm.trim() ? controller.signal : undefined,
      });

      setPayments(response.data.payments);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 401 ||
          error.response.data.message === "Invalid token")
      ) {
        setTimeout(() => {
         clearAuthState();
          navigate("/");
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const isSearchDebounced = searchTerm.trim().length > 0;

  if (isSearchDebounced) {
    debounceTimer = setTimeout(fetchPayments, 2000);
  } else if (
    searchTerm === "" &&
    (paymentMethod || (fromDate && toDate) || (!fromDate && !toDate))
  ) {
    // Only call if:
    // - no search (normal)
    // - and either filter or full valid date range
    fetchPayments();
  }

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    if (isSearchDebounced) controller.abort();
  };
}, [searchTerm, paymentMethod, fromDate, toDate, currentPage]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchFromURL = params.get("search") || "";
    const paymentMethodFromURL = params.get("paymentMethod") || "";
    const fromDateFromURL = params.get("fromdate") || "";
    const toDateFromURL = params.get("todate") || "";
    const pageFromURL = parseInt(params.get("page")) || 1;
  // If no params found, set default ?page=1&limit=10
  if (!currentPage || !itemsPerPage) {
    const query = new URLSearchParams();
    query.set("page", "1");
    query.set("limit", "10");
    navigate({ search: query.toString() }, { replace: true });
    return;
  }
    setSearchTerm(searchFromURL);
    setPaymentMethod(paymentMethodFromURL);
    setFromDate(fromDateFromURL);
    setToDate(toDateFromURL);
    setCurrentPage(pageFromURL);
  }, [location.search]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    updateURLParams({
      searchTerm: value,
      paymentMethod,
      fromDate,
      toDate,
      page: 1,
    });
    setCurrentPage(1);
  };

  const handlePaymentMethodChange = (e) => {
    const value = e.target.value;
    setPaymentMethod(value);
    updateURLParams({
      searchTerm,
      paymentMethod: value,
      fromDate,
      toDate,
      page: 1,
    });
    setCurrentPage(1);
  };



 const handleFromDateChange = (e) => {
  const value = e.target.value;

  if (!value) {
    setFromDate("");
    setToDate("");
  } else {
    setFromDate(value);
    setToDate(""); // reset toDate if fromDate changes
  }

  setCurrentPage(1);

  if (value && toDate) {
    updateURLParams({
      searchTerm,
      paymentMethod,
      fromDate: value,
      toDate,
      page: 1,
    });
  }
};

 

const handleToDateChange = (e) => {
  const value = e.target.value;
  setToDate(value);
  setCurrentPage(1);
  updateURLParams({
    searchTerm,
    paymentMethod,
    fromDate,
    toDate: value,
    page: 1,
  });
};


  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateURLParams({ searchTerm, paymentMethod, fromDate, toDate, page });
  };

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h3 className="text-xl font-bold text-center md:text-left">
          Payment Details
        </h3>
        <button
          onClick={() => navigate("/admin/payment/add")}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition w-full md:w-auto"
        >
          Add
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
        <div className="w-full md:w-1/3">
          <div className="relative">
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
              className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
            />

            {searchTerm && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-500"
                onClick={() => {
                  setSearchTerm("");
                  updateURLParams({
                    searchTerm: "",
                    paymentMethod,
                    fromDate,
                    toDate,
                    page: 1,
                  });
                  setCurrentPage(1);
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
        </div>

        <div className="w-full md:w-auto flex flex-wrap md:flex-nowrap gap-4 justify-end">
          <div className="relative w-full sm:w-36">
            <select
              id="floating_payment"
              className="peer block w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 px-3 py-2"
              value={paymentMethod}
              onChange={handlePaymentMethodChange}
            >
              <option value="">All</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
            </select>
            <label
              htmlFor="floating_payment"
              className={`absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500
        peer-focus:text-blue-600 ${paymentMethod ? "text-blue-600" : ""}`}
            >
              Payment
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
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg peer disabled:bg-gray-100 disabled:cursor-not-allowed"
              min={fromDate || undefined}
               disabled={!fromDate}
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
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-gray-500">
            <thead className="text-sm text-gray-700 text-left bg-gray-50">
              <tr className="">
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
                    <th className="px-6 py-4">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </th>
                    <td className="px-6 py-4">
                      {/* <img
                      src={payment.learner.photo}
                      alt={payment.learner.fullName}
                      className="w-10 h-10 rounded-full"
                    /> */}
                      <img
                        src={`${URL}/api/image-proxy/${extractDriveFileId(
                          payment.learner.photo
                        )}`}
                        alt={payment.learner.fullName}
                        className="w-16 h-16 object-cover rounded-full border-4 border-white shadow-md"
                      />
                    </td>
                    <td className="px-6 py-4">{payment.learner.fullName}</td>
                    <td className="px-6 py-4">
                      {payment.learner.admissionNumber}
                    </td>
                    <td className="px-6 py-4">{payment.paymentMethod}</td>
                    <td className="px-6 py-4">
                      {moment(payment.date).format("DD-MM-YYYY")}
                    </td>
                    <td className="px-6 py-4">{payment.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-red-800 py-4">
                    Payment not found
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

export default PaymentTable;
