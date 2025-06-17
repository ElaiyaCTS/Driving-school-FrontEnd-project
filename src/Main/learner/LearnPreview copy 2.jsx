import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { URL } from "../../App";
import SingleTest from "../../Main/test/SingleTest";
import SinglePayment from "../../Main/payment/SinglePayment";
import SingleCourseAssign from "../../Main/courseAssigned/SingleCourseAssign";
import SingleAttendance from "../attendance/learner/SingleAttendance";
import axios from "axios";
import moment from "moment";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";

const LearnPreview = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  console.log("id", id);
  const [learner, setLearner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchLearner = async () => {
      try {
        console.log("Effect triggered");
        console.log("Learner ID:", id);
        console.log("Base URL:", URL);

        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token is missing");
          return;
        }

        console.log("Token:", token);

        const response = await axios.get(`${URL}/api/user/learner/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("API response:", response.data);
        setLearner(response.data);
      } catch (error) {
        console.error("Error fetching learner:", error);
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
      } finally {
        setLoading(false);
      }
    };

    fetchLearner();
  }, [id]);

  const handleNavigation = (path, data) => {
    navigate(path, { state: data });
    setIsOpen(false);
  };

  return (
    <div className="p-4">
      <section className="flex flex-col bg-white p-5 mb-20 space-y-10 rounded-t-lg">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate(-1)}>
              <i className="fa-solid fa-arrow-left-long text-xl"></i>
            </button>
            <h3 className="font-semibold text-xl ">Learner Details</h3>
          </div>
          <button
            onClick={() =>
              navigate(
                `/admin/learner/${learner.admissionNumber}/${learner._id}/edit`
              )
            }
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
          >
            Edit
          </button>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="w-full h-full min-h-[20rem] md:min-h-[30rem] bg-gray-300 rounded-lg border-2">
            <div className="relative h-full flex flex-col items-center bg-slate-50 overflow-hidden">
              <div className="h-[30%] md:h-[40%] w-full flex flex-col items-center rounded-t-lg bg-blue-100"></div>

              <div className="h-[70%] md:h-[60%] flex flex-col items-center space-y-8 absolute top-[20%] md:top-[25%]">
                {learner && learner.photo && (
                  <img
                    src={`${URL}/api/image-proxy/${extractDriveFileId(
                      learner.photo
                    )}`}
                    alt={`${learner?.fullName}'s profile`}
                    className="w-56 h-56 object-cover rounded-full border-4 border-white shadow-md"
                  />
                )}

                <div className="flex flex-col items-center space-y-3 text-center">
                  <h1 className=" text-lg font-semibold break-words">
                    {learner?.fullName}
                  </h1>
                  <h6 className="text-gray-700 text-xs font-medium break-words">
                    {learner?.admissionNumber}
                  </h6>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full relative md:col-span-3 space-y-5 h-full border-2 rounded-lg flex flex-col p-6 md:p-8">
            <h3 className="text-base  font-semibold">Personal details</h3>
            <div className="w-56 absolute top-1 right-0 ">
              <div>
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex h-10 w-auto  justify-center items-center flex-wrap   rounded-md border border-gray-300 shadow-sm px-2 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Generate Form & Certificate
                
                </button>
              </div>

              {isOpen && (
                <div className="origin-top-right absolute mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <button
                      onClick={() => handleNavigation("/form", learner)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Form 14 Register
                    </button>
                    <button
                      onClick={() => handleNavigation("/form15", learner)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Form 15
                    </button>
                    <button
                      onClick={() => handleNavigation("/Driving5", learner)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Driving Certificate Form 5
                    </button>
                  </div>
                </div>
              )}
            </div>

            <table className="w-full text-xs text-left text-gray-500">
              <tbody>
                {[
                  { label: "Full Name", value: learner?.fullName },
                  { label: "Father's Name", value: learner?.fathersName },
                  { label: "Mobile Number", value: learner?.mobileNumber },
                  { label: "Gender", value: learner?.gender },
                  {
                    label: "Date of Birth",
                    value: moment(learner?.dateOfBirth).format("DD-MM-YYYY"),
                  },
                  { label: "Blood Group", value: learner?.bloodGroup },
                  { label: "Address", value: learner?.address },
                  {
                    label: "Joining Date",
                    value: moment(learner?.createdAt).format("DD-MM-YYYY"),
                  },
                  {
                    label: "Updated At",
                    value: moment(learner?.updatedAt).format("DD-MM-YYYY"),
                  },
                  { label: "License Number", value: learner?.licenseNumber },
                  { label: "LLR Number", value: learner?.llrNumber },
                  { label: "Admission Number", value: learner?.admissionNumber },
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

        <div className="w-full col-span-1 md:col-span-4 space-y-5 h-full border-2 rounded-lg flex flex-col p-6 md:p-8">
          <section className="">
            <SingleCourseAssign />
          </section>
        </div>

        <div className="w-full col-span-1 md:col-span-4 space-y-5 h-full border-2 rounded-lg flex flex-col p-6 md:p-8">
          <section className="">
            <SingleTest />
          </section>
        </div>

        <div className="w-full col-span-1 md:col-span-4 space-y-5 h-full border-2 rounded-lg flex flex-col p-6 md:p-8">
          <section className="">
            <SinglePayment />
          </section>
        </div>

        <div className="w-full col-span-1 md:col-span-4 space-y-5 h-full border-2 rounded-lg flex flex-col p-6 md:p-8">
          <section className="">
            <SingleAttendance />
          </section>
        </div>
      
      </section>
    </div>
  );
};

export default LearnPreview;
