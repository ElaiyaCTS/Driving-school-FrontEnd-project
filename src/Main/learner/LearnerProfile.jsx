import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { URL } from "../../App";
import axios from "axios";
import moment from "moment";
import { jwtDecode } from "jwt-decode";
import { useRole } from "../../Components/AuthContext/AuthContext";

import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";

const LearnerProfile = () => {
  const navigate = useNavigate();
    const {role, user,setUser,setRole,clearAuthState} =  useRole();

  const [learner, setLearner] = useState(null);
  const [loading, setLoading] = useState(true);
  const profileId = user?.user_id;

  useEffect(() => {
    const fetchLearner = async () => {
      try {
        const token =user;
        if (!token) {
          alert("Token is missing");
          setLoading(false);
          return;
        }
        if (!profileId) {
          console.error("Profile ID is missing");
          return;
        }

        const { data } = await axios.get(
          `${URL}/api/user/learner/${profileId}`,
          {withCredentials: true,
          }
        );
        setLearner(data);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching data:", error);
          if (
            error.response &&
            (error.response.status === 401 ||
              error.response.data.message === "Invalid token")
          ) {
            return setTimeout(() => {
              window.localStorage.clear();
              navigate("/");
            }, 2000);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLearner();
  }, [profileId]);

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (!learner) {
    return (
      <div className="text-center text-red-600 mt-10">No learner found</div>
    );
  }

  return (
    <div className="p-4">
      <section className="flex flex-col bg-white p-5 mb-20 space-y-10 rounded-t-lg">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate(-1)}>
              <i className="fa-solid fa-arrow-left-long text-xl"></i>
            </button>
            <h3 className="font-semibold text-xl">Learner Details</h3>
          </div>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="w-full h-full min-h-[20rem] md:min-h-[30rem] bg-gray-300 rounded-lg border-2">
            <div className="relative h-full flex flex-col items-center bg-slate-50 overflow-hidden">
              <div className="h-[30%] md:h-[40%] w-full flex flex-col items-center rounded-t-lg bg-blue-100"></div>

              <div className="h-[70%] md:h-[60%] flex flex-col items-center space-y-8 absolute inset-0 top-1/4 md:top-1/4">
                <img
                  src={`${URL}/api/image-proxy/${extractDriveFileId(
                    learner.photo
                  )}`}
                  alt={learner.fullName}
                  className="w-56 h-56 object-cover rounded-full border-4 border-white shadow-md"
                />
                <div className="flex flex-col items-center space-y-3 text-center">
                  <h1 className="text-lg font-semibold break-words">
                    {learner.fullName}
                  </h1>
                  <h6 className="text-gray-700 text-xs font-medium break-words">
                    {learner.admissionNumber}
                  </h6>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:col-span-3 space-y-5 h-full border-2 rounded-lg flex flex-col p-6 md:p-8">
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
