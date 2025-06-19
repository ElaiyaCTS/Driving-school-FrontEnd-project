import { useEffect, useState } from "react";
import { URL as BURL } from "../../App";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../Components/AuthContext/AuthContext";

const LearEdit = () => {
  const navigate = useNavigate();
    const {role, user,setUser,setRole,clearAuthState} =  useRole();

  const { id, admissionNumber } = useParams();
  const [learner, setLearner] = useState({
    fullName: "",
    fathersName: "",
    mobileNumber: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    address: "",
    licenseNumber: "",
    llrNumber: "",
    admissionNumber: "",
    username: "",
    password: "",
    photo: null,
    signature: null,
    aadharCard: null,
    educationCertificate: null,
    passport: null,
    notary: null,
  });
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState({
    photo: null,
    signature: null,
    aadharCard: null,
    educationCertificate: null,
    passport: null,
    notary: null,
  });
  const [toastOpen, setToastOpen] = useState(false);

  const getPreviewUrl = (url) => {
    const driveId = extractDriveFileId(url);
    return driveId
      ? `${BURL}/api/image-proxy/${driveId}`
      : `${url}?t=${Date.now()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const fetchLearner = async () => {
    try {
      const response = await axios.get(`${BURL}/api/admin/learner/${id}`, {
        withCredentials: true,
      });

      if (response.data) {
        const learnerData = response.data;
        setLearner({
          ...learnerData,
          dateOfBirth: formatDate(learnerData.dateOfBirth),
          username: learnerData.userId?.username || "",
          password: learnerData.userId?.password || "",
        });

        setSelectedFile({
          photo: learnerData.photo ? getPreviewUrl(learnerData.photo) : null,
          signature: learnerData.signature
            ? getPreviewUrl(learnerData.signature)
            : null,
          aadharCard: learnerData.aadharCard
            ? getPreviewUrl(learnerData.aadharCard)
            : null,
          educationCertificate: learnerData.educationCertificate
            ? getPreviewUrl(learnerData.educationCertificate)
            : null,
          passport: learnerData.passport
            ? getPreviewUrl(learnerData.passport)
            : null,
          notary: learnerData.notary ? getPreviewUrl(learnerData.notary) : null,
        });
      }
    } catch (error) {
      // console.error("Error fetching learner:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearner();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLearner((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      const file = files[0];
      setLearner((prev) => ({ ...prev, [name]: file }));
      setSelectedFile((prev) => ({ ...prev, [name]: file }));
    }
  };

  const handleRemoveFile = (fieldName) => {
    setLearner((prev) => ({ ...prev, [fieldName]: null }));
    setSelectedFile((prev) => ({ ...prev, [fieldName]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    Object.entries(learner).forEach(([key, value]) => {
      if (key === "userId") {
        formData.append(key, value?._id || value?.id || value || "");
      } else {
        formData.append(key, value);
      }
    });

    try {
      await axios.put(`${BURL}/api/user/learner/${admissionNumber}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setToastOpen(true);
      setTimeout(() => {
        setToastOpen(false);
        navigate(-1);
      }, 2000);

      fetchLearner();
    } catch (error) {
      // console.error("Error updating learner:", error);
      if (error.response?.data?.message === "Invalid token") {
        setTimeout(() => {
          window.localStorage.clear();
          navigate("/");
        }, 2000);
      }
    }
  };

  const renderImageField = (label, field) => (
    <div className="flex flex-col w-full mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>

      <label
        htmlFor={`${field}-file`}
        className={`flex items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer 
        ${!selectedFile[field] ? "dark:bg-gray-700" : ""} 
        dark:border-gray-600 relative overflow-hidden`}
      >
        {selectedFile[field] ? (
          <img
            src={
              typeof selectedFile[field] === "string"
                ? selectedFile[field]
                : URL.createObjectURL(selectedFile[field])
            }
            alt={field}
            className="w-full h-full object-contain rounded-lg"
          />
        ) : (
          <span className="text-gray-400 dark:text-gray-300 text-sm">
            Click to upload
          </span>
        )}

        <input
          id={`${field}-file`}
          type="file"
          name={field}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          key={selectedFile[field]?.name || selectedFile[field] || ""}
        />
      </label>

      {selectedFile[field] && (
        <div className="mt-2 flex justify-between items-center">
          <p className="text-sm text-gray-800 dark:text-gray-200">
            {typeof selectedFile[field] === "string"
              ? ""
              : selectedFile[field].name}
          </p>
          <button
            type="button"
            onClick={() => handleRemoveFile(field)}
            className="text-red-500 text-sm"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );

  if (loading) return <p>Loading ...</p>;

  return (
    <div className="p-6">
      <h3 className="text-xl font-bold mb-6">Update learner Details</h3>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-10">
          <div className="relative">
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder=" "
              value={learner.fullName}
              onChange={handleChange}
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
            />
            <label
              htmlFor="fullName"
              className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2"
            >
              Full name
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              id="fathersName"
              name="fathersName"
              placeholder=" "
              value={learner.fathersName}
              onChange={handleChange}
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
            />
            <label
              htmlFor="fathersName"
              className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2"
            >
              Father&apos;s name
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              id="mobileNumber"
              name="mobileNumber"
              placeholder=" "
              maxLength={10}
              value={learner.mobileNumber}
              onChange={handleChange}
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
            />
            <label
              htmlFor="mobileNumber"
              className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2"
            >
              Mobile number
            </label>
          </div>
          <div className="relative">
            <label
              htmlFor="dateOfBirth"
              className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2"
            >
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={learner.dateOfBirth}
              onChange={handleChange}
              onFocus={(event) => (event.nativeEvent.target.defaultValue = "")}
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
            />
          </div>
          <div className="relative">
            <label
              htmlFor="gender"
              className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2"
            >
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={learner.gender}
              onChange={handleChange}
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
            >
              <option value="" disabled hidden>
                Select Gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="relative">
            <label
              htmlFor="bloodGroup"
              className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2"
            >
              Blood Group
            </label>
            <select
              id="bloodGroup"
              name="bloodGroup"
              value={learner.bloodGroup}
              onChange={handleChange}
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
            >
              <option value="" disabled hidden>
                Select Blood Group
              </option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          {renderImageField("Photo", "photo")}
          {renderImageField("Signature", "signature")}
          {renderImageField("Aadhar Card", "aadharCard")}
          {renderImageField("Education Certificate", "educationCertificate")}
          {renderImageField("Passport", "passport")}
          {renderImageField("Notary", "notary")}

          <div className="relative">
            <textarea
              id="address"
              name="address"
              placeholder=" "
              value={learner.address}
              onChange={handleChange}
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer h-40 resize-none"
            ></textarea>
            <label
              htmlFor="address"
              className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2"
            >
              Address
            </label>
          </div>
        </div>

        <div className="mt-8">
          <h5 className="sm:text-2xl md:text-xl font-normal mb-8">
            Login Details
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-10">
            <div className="relative mb-4">
              <input
                type="text"
                id="username"
                name="username"
                placeholder=" "
                value={learner.username}
                onChange={handleChange}
                className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
              />
              <label
                htmlFor="username"
                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2"
              >
                Username
              </label>
            </div>

            <div className="relative">
              <input
                type="password"
                id="password"
                name="password"
                placeholder=" "
                value={learner.password}
                onChange={handleChange}
                className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
              />
              <label
                htmlFor="password"
                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2"
              >
                Password
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:justify-end space-y-4 md:space-y-0 md:space-x-4 mt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800"
          >
            Back
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-800"
          >
            Submit
          </button>
        </div>
      </form>
      {toastOpen && (
        <div
          id="toast-success"
          className="fixed top-20 right-5 flex items-center justify-center w-full max-w-xs p-4 text-white bg-blue-700 rounded-md shadow-md"
          role="alert"
        >
          <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-green-700 bg-green-100 rounded-md dark:bg-green-800 dark:text-green-400">
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
            </svg>
            <span className="sr-only">Check icon</span>
          </div>
          <div className="ms-3 text-sm font-normal">
            Learner updated successfully
          </div>
        </div>
      )}
    </div>
  );
};

export default LearEdit;
