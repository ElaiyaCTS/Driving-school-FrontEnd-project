import { useState, useEffect } from "react";
import axios from "axios";
import { URL } from "../../App";
import { useNavigate, useLocation } from "react-router-dom";
import Pagination from "../../Components/Pagination";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../Components/AuthContext/AuthContext"; // adjust path as needed

const InstructorTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {role, user,setUser,setRole,clearAuthState} =  useRole();

  const [instructors, setInstructors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [TotalPages, setTotalPages] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGender, setSelectedGender] = useState("");

 
// On first load, if page or limit is missing in URL, add default values to URL
useEffect(() => {
  const params = new URLSearchParams(location.search);
  let shouldUpdate = false;

  if (!params.get("page")) {
    params.set("page", "1");
    shouldUpdate = true;
  }

  if (!params.get("limit")) {
    params.set("limit", limit.toString());
    shouldUpdate = true;
  }

  if (shouldUpdate) {
    navigate({ search: params.toString() }, { replace: true });
  }
}, [location.search]);

const updateURLParams = ({ search, gender, page }) => {
  const params = new URLSearchParams(location.search);

  if (search !== undefined) {
    if (search) params.set("search", search);
    else params.delete("search");
  }

  if (gender !== undefined) {
    if (gender) params.set("gender", gender);
    else params.delete("gender");
  }

  if (page !== undefined) {
    if (page) params.set("page", page);
    else params.delete("page");
  }

  params.set("limit", limit); // Always keep limit synced

  navigate({ search: params.toString() });
};


  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {

        const response = await axios.get(`${URL}/api/admin/instructors`, {
       
          params: {
            search: searchQuery,
            gender: selectedGender,
            page: currentPage,
            limit: limit,
          },
          withCredentials: true,
          signal: searchQuery ? controller.signal : undefined,
        });

        setInstructors(response.data.instructorsWithDecrypted);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Request canceled");
        } else {
          console.error("Error fetching instructors:", error);
          setError(error.message);
          if (
            error.response &&
            (error.response.status === 401 ||
              error.response.data.message === "Invalid token")
          ) {
            setTimeout(() => {
             clearAuthState()
              // navigate("/");
            }, 2000);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    if (searchQuery.trim()) {
      const debounceTimer = setTimeout(() => {
        fetchData();
      }, 1000);

      return () => {
        clearTimeout(debounceTimer);
        controller.abort();
      };
    } else {
      fetchData();
      return () => {};
    }
  }, [searchQuery, selectedGender, currentPage]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchFromURL = params.get("search") || "";
    const genderFromURL = params.get("gender") || "";
    const pageFromURL = parseInt(params.get("page")) || 1;

    setSearchQuery(searchFromURL);
    setSelectedGender(genderFromURL);
    setCurrentPage(pageFromURL);
    
  }, [location.search]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    updateURLParams({ search: value, gender: selectedGender, page: 1 });
    setCurrentPage(1);
  };

  const handleGenderChange = (e) => {
    const value = e.target.value;
    setSelectedGender(value);
    updateURLParams({ search: searchQuery, gender: value, page: 1 });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= TotalPages) {
      setCurrentPage(page);
      updateURLParams({ search: searchQuery, gender: selectedGender, page });
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h3 className="text-xl font-bold text-center md:text-left">
          Instructor Details
        </h3>
        <button
          onClick={() => navigate("/admin/instructor/new")}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition w-full md:w-auto"
        >
          Register
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <div className="relative w-full md:w-1/3">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="search"
            className="w-full border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 pl-10 py-2"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <div className="relative w-full sm:w-36 md:w-1/4 lg:w-1/6">
          <select
            id="floating_gender"
            className="peer block w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 px-3 py-2"
            value={selectedGender}
            onChange={handleGenderChange}
          >
            <option value="">All</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Others">Others</option>
          </select>
          <label
            htmlFor="floating_gender"
            className={`absolute text-xs left-3 top-[-8px] bg-white px-1 text-gray-500 peer-focus:text-blue-600 ${
              selectedGender ? "text-blue-600" : ""
            }`}
          >
            Gender
          </label>
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
                <tr className="">
                  <th className="px-6 py-4">S.No</th>
                  <th className="px-6 py-4">Profile</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Gender</th>
                  <th className="px-6 py-4">Mobile No</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {instructors && instructors.length > 0 ? (
                  instructors.map((instructor, index) => (
                    <tr key={instructor._id} className="bg-white border-b">
                      <th className="px-6 py-4 font-medium text-gray-900">
                        {index + 1}
                      </th>
                      <td className="px-6 py-4">
                        <img
                          src={`${URL}/api/image-proxy/${extractDriveFileId(
                            instructor.photo
                          )}`}
                          alt={`${instructor.fullName}'s profile`}
                          className="w-16 h-16 rounded-full object-cover border shadow-sm"
                        />
                      </td>
                      <td className="px-6 py-4">{instructor.fullName}</td>
                      <td className="px-6 py-4">{instructor.gender}</td>
                      <td className="px-6 py-4">{instructor.mobileNumber}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mt-4">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/instructor/${instructor._id}/view`
                              )
                            }
                            className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                          >
                            <i className="fa-solid fa-eye text-blue-600"></i>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/instructor/${instructor._id}/edit`
                              )
                            }
                            className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                          >
                            <i className="fa-solid fa-pen-to-square text-blue-600"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-red-600">
                      Instructor not found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {instructors && instructors.length > 0 && (
            <Pagination
              CurrentPage={currentPage}
              TotalPages={TotalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default InstructorTable;
