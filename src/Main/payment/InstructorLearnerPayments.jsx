import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { URL } from "../../App";
import axios from "axios";
import moment from "moment";
import Pagination from "../../Components/Pagination";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";

const InstructorLearnerPayments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const instructorId = decoded?.user_id;

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const itemsPerPage = 10;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0];
  };

  const updateURLParams = ({
    search,
    paymentMethod,
    fromdate,
    todate,
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

    if (paymentMethod !== undefined) {
      if (paymentMethod) {
        params.set("paymentMethod", paymentMethod);
      } else {
        params.delete("paymentMethod");
      }
    }

    if (fromdate !== undefined) {
      if (fromdate) {
        params.set("fromdate", formatDate(fromdate));
      } else {
        params.delete("fromdate");
      }
    }

    if (todate !== undefined) {
      if (todate) {
        params.set("todate", formatDate(todate));
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

    const fetchPayments = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${URL}/api/payments/createdBy/${instructorId}`,
          {
            params: {
              search: searchTerm,
              paymentMethod: paymentMethod,
              fromdate: formatDate(fromDate),
              todate: formatDate(toDate),
              page: currentPage,
              limit: itemsPerPage,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        setPayments(response.data.payments || []);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
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
  }, [searchTerm, paymentMethod, fromDate, toDate, currentPage]);

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
      search: value,
      paymentMethod,
      fromdate: fromDate,
      todate: toDate,
      page: 1,
    });
    setCurrentPage(1);
  };

  const handlePaymentMethodChange = (e) => {
    const value = e.target.value;
    setPaymentMethod(value);
    updateURLParams({
      search: searchTerm,
      paymentMethod: value,
      fromdate: fromDate,
      todate: toDate,
      page: 1,
    });
    setCurrentPage(1);
  };

  const handleFromDateChange = (e) => {
    const value = e.target.value;
    setFromDate(value);
    updateURLParams({
      search: searchTerm,
      paymentMethod,
      fromdate: formatDate(value),
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
      paymentMethod,
      fromdate: fromDate,
      todate: formatDate(value),
      page: 1,
    });
    setCurrentPage(1);
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35"
            />
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
                updateURLParams({ search: "", fromDate, toDate, page: 1 });
                setCurrentPage(1);
              }}
            >
              <svg
                className="w-4 h-4"
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

        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 w-full md:flex-1 md:justify-end">
          <div className="relative w-full sm:w-40">
            <select
              id="floating_payment"
              className="peer block w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600 px-3 py-2"
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

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-40">
              <input
                type="date"
                value={fromDate}
                onFocus={(e) => (e.nativeEvent.target.defaultValue = "")}
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
                onFocus={(e) => (e.nativeEvent.target.defaultValue = "")}
                onChange={handleToDateChange}
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
                        src={`${URL}/api/image-proxy/${extractDriveFileId(
                          payment.learner?.photo
                        )}`}
                        alt={payment.learner?.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </td>
                    <td className="px-6 py-4">{payment.learner?.fullName}</td>
                    <td className="px-6 py-4">
                      {payment.learner?.admissionNumber}
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
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-red-600"
                  >
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
