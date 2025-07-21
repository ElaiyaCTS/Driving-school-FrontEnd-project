import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { URL } from "../../App";
import SingleTest from "../../Main/test/SingleTest";
import SinglePayment from "../../Main/payment/SinglePayment";
import SingleCourseAssign from "../../Main/courseAssigned/SingleCourseAssign";
import SingleAttendance from "../attendance/learner/SingleAttendance";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../Components/AuthContext/AuthContext"; // adjust path as needed
const LearnPreview = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {role, user,setUser,setRole,clearAuthState} =  useRole();
  const [learner, setLearner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchLearner = async () => {
      try {
        const response = await axios.get(`${URL}/api/user/learner/${id}`, {
          withCredentials: true,
        });
        setLearner(response.data);
      }catch (err) {
         if (!axios.isCancel(err)) {
            // setError(err.response.data.message);
        if (err.response &&(err.response.status === 401 ||err.response.data.message === "Credential Invalid or Expired Please Login Again")) {
            setTimeout(() => {
              // clearAuthState();
              // navigate("/");
            }, 3000);
          }
        }
      
      } finally {
        setLoading(false);
      }
    };

    fetchLearner();
  }, [id, navigate]);

  const handleNavigation = (path, data) => {
    navigate(path, { state: data });
    setIsOpen(false);
  };

  const profileImage = learner?.photo
    ? `${URL}/api/image-proxy/${extractDriveFileId(learner.photo)}`
    : null;

  const personalDetails = [
    { label: "Full Name", value: learner?.fullName },
    { label: "Father's Name", value: learner?.fathersName },
    { label: "Mobile Number", value: learner?.mobileNumber },
    { label: "Gender", value: learner?.gender },
    {
      label: "Date of Birth",
      value: learner?.dateOfBirth
        ? moment(learner.dateOfBirth).format("DD-MM-YYYY")
        : "",
    },
    { label: "Blood Group", value: learner?.bloodGroup },
    { label: "Address", value: learner?.address },
    {
      label: "Joining Date",
      value: learner?.createdAt
        ? moment(learner.createdAt).format("DD-MM-YYYY")
        : "",
    },
    {
      label: "Updated At",
      value: learner?.updatedAt
        ? moment(learner.updatedAt).format("DD-MM-YYYY")
        : "",
    },
    { label: "License Number", value: learner?.licenseNumber },
    { label: "LLR Number", value: learner?.llrNumber },
    { label: "Admission Number", value: learner?.admissionNumber },
  ];

  if (loading) {
    return (
         <div className="py-5 text-lg font-semibold text-center text-blue-600">Loading...</div>

      // <div className="p-10 text-center text-lg font-medium text-gray-600">
      //   Loading learner details...
      // </div>
    );
  }
return (
  <div className="px-4 md:px-10 xl:px-20 py-6 bg-gray-50">
    <section className="max-w-screen-2xl mx-auto flex flex-col bg-white p-5 mb-20 space-y-10 rounded-t-lg shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate(-1)}>
            <i className="fa-solid fa-arrow-left-long text-xl"></i>
          </button>
          <h3 className="font-semibold text-2xl">Learner Details</h3>
        </div>
        <button
          onClick={() =>
            navigate(`/admin/learner/${learner.admissionNumber}/${learner._id}/edit`)
          }
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          Edit
        </button>
      </div>

      {/* Top Section: Profile + Info */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="m-5 w-full   bg-gray-300 border-2 rounded-lg min-h-[30rem] md:min-h-[30rem] flex items-center justify-center">
          <div className="relative w-full h-full flex flex-col just items-center bg-slate-50">
            <div className="h-[40%] md:h-[40%] w-full bg-blue-100 rounded-t-lg" />
            <div className="absolute top-[20%] md:top-[25%] flex flex-col items-center space-y-4">
              {profileImage && (
                <img
                  src={profileImage}
                  alt={`${learner.fullName}'s profile`}
                  className="w-56 h-56 rounded-full border-4 border-white shadow-md object-cover"
                />
              )}
              <div className="text-center space-y-2">
                <h1 className="text-lg font-semibold break-words">
                  {learner?.fullName}
                </h1>
                <h6 className="text-xs text-gray-700 font-medium break-words">
                  {learner?.admissionNumber}
                </h6>
              </div>
            </div>
          </div>
        </div>

        {/* Details + Dropdown */}
        <div className="col-span-2 border-2 rounded-lg p-6 md:p-8 relative space-y-5">
          <h3 className="text-lg font-semibold">Personal details</h3>

          <div className="absolute top-1 right-4">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 h-10 md:h-10 w-32 md:w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-700 hover:bg-gray-50 shadow-sm"
            >
              Generate Form & Certificate
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="py-1">
                  {[
                    { label: "Form 14 Register", path: "/form" },
                    { label: "Form 15", path: "/form15" },
                    { label: "Driving Certificate Form 5", path: "/Driving5" },
                  ].map(({ label, path }) => (
                    <button
                      key={label}
                      onClick={() => handleNavigation(path, learner)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <table className="w-full text-xs md:text-sm text-left text-gray-600">
            <tbody>
              {personalDetails.map(({ label, value }) => (
                <tr key={label} className="align-top">
                  <td className="px-4 py-3 font-medium text-gray-800">{label}</td>
                  <td className="px-4 py-3">{value || "no"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sub-Sections */}
      {[SingleCourseAssign, SingleTest, SinglePayment, SingleAttendance].map(
        (Component, index) => (
          <div
            key={index}
            className="border-2 rounded-lg p-6 md:p-8 space-y-5"
          >
            <section>
              <Component />
            </section>
          </div>
        )
      )}
    </section>
  </div>
);

};

export default LearnPreview;
