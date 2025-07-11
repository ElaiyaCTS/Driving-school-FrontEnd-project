import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { URL } from "../../App";
import axios from "axios";
import moment from "moment";
import { useRole } from "../../Components/AuthContext/AuthContext";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useLocation } from "react-router-dom";

// ✅ Custom toast component
const Toast = ({ message }) => (
  <div className="fixed z-50 px-6 py-3 text-sm font-medium text-white -translate-x-1/2 bg-red-500 rounded-lg shadow-md top-5 left-1/2">
    {message}
  </div>
);

const LearnerProfile = () => {
  const location = useLocation();

  const navigate = useNavigate();
  const { role, user, setUser, setRole, clearAuthState } = useRole();

  const [learner, setLearner] = useState(null);
  const [loading, setLoading] = useState(true);

  const [errorMsg, setErrorMsg] = useState("");
  const profileId = user?.user_id;

  useEffect(() => {
    const fetchLearner = async () => {
      try {
        const token = user;
        if (!token) {
          setErrorMsg("Token is missing");
          return;
        }
        if (!profileId) {
          setErrorMsg("Profile ID is missing");
          return;
        }

        const { data } = await axios.get(`${URL}/api/user/learner/${profileId}`, {
          withCredentials: true,
        });

        setLearner(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching data:", error);

          // ✅ 401 handling
          if (
            error.response &&
            (error.response.status === 401 ||
              error.response.data?.message ===
                "Credential Invalid or Expired Please Login Again")
          ) {
            setErrorMsg("Session expired. Redirecting to login...");
            return setTimeout(() => {
              clearAuthState();
            }, 2000);
          }

          // ✅ Handle custom error messages
          const errorData = error?.response?.data;
          const errors = errorData?.errors || errorData?.message || "An error occurred";

          if (Array.isArray(errors)) {
            setErrorMsg(errors.join(", "));
          } else {
            setErrorMsg(errors);
          }

          // ✅ Auto-clear error toast
          setTimeout(() => {
            setErrorMsg("");
          }, 4000);
        }
      } finally {
        setLoading(false); // ✅ cleanup loader
      }
    };

    fetchLearner();
  }, [profileId,location.key]);

  if (loading) {
    return <div className="mt-10 text-center">Loading...</div>;
  }

  if (!learner) {
    return (
      <div className="mt-10 text-center text-red-600">No learner found</div>
    );
  }

  return (
    <div className="p-4">
      {errorMsg && <Toast message={errorMsg} />}

      <section className="flex flex-col p-5 mb-20 space-y-10 bg-white rounded-t-lg">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate(-1)}>
              <i className="text-xl fa-solid fa-arrow-left-long"></i>
            </button>
            <h3 className="text-xl font-semibold">Learner Details</h3>
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          <div className="w-full h-full min-h-[20rem] md:min-h-[30rem] bg-gray-300 rounded-lg border-2">
            <div className="relative flex flex-col items-center h-full overflow-hidden bg-slate-50">
              <div className="h-[30%] md:h-[40%] w-full flex flex-col items-center rounded-t-lg bg-blue-100"></div>

              <div className="h-[70%] md:h-[60%] flex flex-col items-center space-y-8 absolute inset-0 top-1/4 md:top-1/4">
                <img
                  src={`${URL}/api/image-proxy/${extractDriveFileId(
                    learner.photo
                  )}?t=${Date.now()}`}
                  alt={learner.fullName}
                  className="object-cover w-56 h-56 border-4 border-white rounded-full shadow-md"
                />
                <div className="flex flex-col items-center space-y-3 text-center">
                  <h1 className="text-lg font-semibold break-words">
                    {learner.fullName}
                  </h1>
                  <h6 className="text-xs font-medium text-gray-700 break-words">
                    {learner.admissionNumber}
                  </h6>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full h-full p-6 space-y-5 border-2 rounded-lg md:col-span-3 md:p-8">
            <h3 className="text-base font-semibold">Personal details</h3>
            <table className="w-full text-xs text-left text-gray-500">
              <tbody>
                {[
                  { label: "Full Name", value: learner.fullName },
                  { label: "Father's Name", value: learner.fathersName },
                  { label: "Mobile Number", value: learner.mobileNumber },
                  { label: "Gender", value: learner.gender },
                  {
                    label: "Date of Birth",
                    value: learner.dateOfBirth
                      ? moment(learner.dateOfBirth).format("DD-MM-YYYY")
                      : "no",
                  },
                  { label: "Blood Group", value: learner.bloodGroup },
                  { label: "Address", value: learner.address },
                  {
                    label: "Joining Date",
                    value: learner.createdAt
                      ? moment(learner.createdAt).format("DD-MM-YYYY")
                      : "no",
                  },
                  {
                    label: "Updated At",
                    value: learner.updatedAt
                      ? moment(learner.updatedAt).format("DD-MM-YYYY")
                      : "no",
                  },
                  { label: "License Number", value: learner.licenseNumber },
                  { label: "LLR Number", value: learner.llrNumber },
                  { label: "Admission Number", value: learner.admissionNumber },
                ].map(({ label, value }) => (
                  <tr key={label} className="align-top">
                    <td className="px-4 py-3 text-base font-medium text-gray-700">
                      {label}
                    </td>
                    <td className="px-4 py-3 text-sm">{value || "no"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LearnerProfile;
