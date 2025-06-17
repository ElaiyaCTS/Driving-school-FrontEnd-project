import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { URL } from "../../App";
import Pagination from "../../Components/Pagination";
import moment from "moment";
import { jwtDecode } from "jwt-decode";

const LearnerSinglePayment = () => {
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

  const limit = 5;

  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const paymentId = decoded?.user_id;

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
    params.set("limit", limit);

    navigate({ search: params.toString() });
  };

  useEffect(() => {
    const controller = new AbortController();
    let debounceTimer;

    const fetchPayments = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem("token");

        const params = new URLSearchParams();
        if (searchTerm) params.set("search", searchTerm);
        if (paymentMethod && paymentMethod !== "All")
          params.set("paymentMethod", paymentMethod);
        if (fromDate) params.set("fromdate", formatDate(fromDate));
        if (toDate) params.set("todate", formatDate(toDate));
        params.set("page", currentPage);
        params.set("limit", limit);

        updateURLParams({
          searchTerm,
          paymentMethod,
          fromDate,
          toDate,
          page: currentPage,
        });

        if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
          console.error(
            "Invalid date range. 'From Date' cannot be greater than 'To Date'."
          );
          return;
        }

        const formattedFromDate = fromDate
          ? moment(fromDate).format("YYYY-MM-DD")
          : "";
        const formattedToDate = toDate
          ? moment(toDate).format("YYYY-MM-DD")
          : "";

        const queryParams = {
          page: currentPage,
          limit: limit,
          search: searchTerm,
          paymentMethod: paymentMethod,
          fromdate: formattedFromDate,
          todate: formattedToDate,
        };

        const response = await axios.get(`${URL}/api/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: queryParams,
          signal: controller.signal,
        });

        setPayments(response.data.payments);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Error fetching data:", error);
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

    if (searchTerm) {
      debounceTimer = setTimeout(() => {
        fetchPayments();
      }, 2000);
    } else {
      fetchPayments();
    }

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [searchTerm, paymentMethod, fromDate, toDate, currentPage, limit]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchFromURL = params.get("search") || "";
    const paymentMethodFromURL = params.get("paymentMethod") || "";
    const fromDateFromURL = params.get("fromdate") || "";
    const toDateFromURL = params.get("todate") || "";
    const pageFromURL = parseInt(params.get("page")) || 1;

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
    setFromDate(value);
    updateURLParams({
      searchTerm,
      paymentMethod,
      fromDate: value,
      toDate,
      page: 1,
    });
    setCurrentPage(1);
  };

  const handleToDateChange = (e) => {
    const value = e.target.value;
    setToDate(value);
    updateURLParams({
      searchTerm,
      paymentMethod,
      fromDate,
      toDate: value,
      page: 1,
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateURLParams({ searchTerm, paymentMethod, fromDate, toDate, page });
  };

  return (
    <div className="p-4">
      <div className="flex flex-row justify-between items-center gap-4 mb-4">
        <h3 className="text-xl font-bold text-center md:text-left">
          Payment History
        </h3>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="relative w-full md:w-1/2 lg:w-1/3">
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
              onClick={() => setSearchTerm("")}
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

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto md:items-center md:justify-end">
          <div className="relative w-full md:w-48">
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
              className={`absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500 peer-focus:text-blue-600 ${
                paymentMethod ? "text-blue-600" : ""
              }`}
            >
              Payment
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-40">
              <input
                type="date"
                value={fromDate}
                onChange={handleFromDateChange}
                onFocus={(event) =>
                  (event.nativeEvent.target.defaultValue = "")
                }
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
                onFocus={(event) =>
                  (event.nativeEvent.target.defaultValue = "")
                }
                className="peer border border-gray-300 text-gray-900 text-sm rounded-lg px-3 py-2 w-full"
              />
              <label className="absolute left-3 top-[-8px] text-xs bg-white px-1 text-gray-500">
                To
              </label>
            </div>
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
              <tr className="">
                <th className="px-6 py-4">S.No</th>
                <th className="px-6 py-4">Payment Method</th>
                <th className="px-6 py-4">Amount ₹</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>

            {payments.length > 0 && (
              <tbody>
                {payments.map((payment, index) => (
                  <tr key={payment._id} className="bg-white border-b">
                    <th className="px-6 py-4">
                      {(currentPage - 1) * limit + index + 1}
                    </th>
                    <td className="px-6 py-4">{payment.paymentMethod}</td>
                    <td className="px-6 py-4">{payment.amount}</td>
                    <td className="px-6 py-4">
                      {moment(payment.date).format("DD-MM-YYYY")}
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>

          {payments.length > 0 ? (
            <Pagination
              CurrentPage={currentPage}
              TotalPages={totalPages}
              onPageChange={handlePageChange}
            />
          ) : (
            <div className="text-center text-red-800 mt-4">
              Payments not found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LearnerSinglePayment;
