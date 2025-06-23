import { useState, useEffect } from "react";
import { URL as BURL } from "../../App";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useRole } from "../../Components/AuthContext/AuthContext.jsx"; // adjust path as needed

const NewRegistration = () => {
  const navigate = useNavigate();
  const {role, user,setUser,setRole,clearAuthState} =  useRole();
console.log(user);

  const [newLearner, setNewLearner] = useState({
    fullName: "",
    fathersName: "",
    mobileNumber: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    address: "",
    photo: null,
    signature: null,
    aadharCard: null,
    educationCertificate: null,
    passport: null,
    notary: null,
    licenseNumber: "",
    llrNumber: "",
    username: "",
    password: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [validForm, setValidForm] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [filePreviews, setFilePreviews] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLearner((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errors = {};

    if (!newLearner.fullName) errors.fullName = "Full Name is required.";
    if (!newLearner.fathersName)
      errors.fathersName = "Father's Name is required.";
    if (!newLearner.mobileNumber)
      errors.mobileNumber = "Mobile Number is required.";
    if (!/^\d{10}$/.test(newLearner.mobileNumber))
      errors.mobileNumber = "Mobile Number must be 10 digits.";
    if (!newLearner.dateOfBirth)
      errors.dateOfBirth = "Date of Birth is required.";
    if (!newLearner.gender) errors.gender = "Gender is required.";
    if (!newLearner.bloodGroup) errors.bloodGroup = "Blood Group is required.";
    if (!newLearner.address) errors.address = "Address is required.";
    if (!newLearner.address)
      errors.licenseNumber = "License number is required.";
    if (!newLearner.address) errors.llrNumber = "LLR number is required.";
    if (!newLearner.username) errors.username = "Username is required.";
    if (!newLearner.password) errors.password = "Password is required.";

    return errors;
  };

  useEffect(() => {
    setValidForm(validateForm());
  }, [newLearner]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    setLoading(true);
    const token = user

    const formData = new FormData();
    for (const key in newLearner) {
      if (newLearner[key]) {
        formData.append(key, newLearner[key]);
      }
    }
    formData.append("role", "Learner");

    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      await axios.post(`${BURL}/api/admin/create-Learner`, formData, {
        withCredentials: true,
      });

      setToastOpen(true);
      setTimeout(() => {
        setToastOpen(false);
        navigate(-1);
      }, 1000);
    } catch (error) {
      if (error.name !== "AbortError") {
        if (
          error.response &&
          (error.response.status === 401 ||
            error.response.data.message === "Credential Invalid or Expired Please Login Again")
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

  const getPreviewURL = (file) => {
    if (!file) return null;
    return typeof file === "string" ? file : URL.createObjectURL(file);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const field = e.target.name;

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setNewLearner((prev) => ({
        ...prev,
        [field]: file,
      }));

      setFilePreviews((prev) => ({
        ...prev,
        [field]: previewUrl,
      }));
    }
  };

  const removeFile = (field) => {
    setNewLearner((prev) => ({
      ...prev,
      [field]: null,
    }));
  };

  return (
    <div className="p-4">
      <h2 className="sm:text-3xl md:text-2xl font-semibold mb-4">
        Learner Registration
      </h2>

      <h5 className="sm:text-2xl md:text-xl font-normal mb-4">
        Personal Details
      </h5>

      <form onSubmit={handleRegisterSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-10">
          <div className="relative w-full">
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={newLearner.fullName}
              onChange={handleInputChange}
              autoComplete="off"
              className={`block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-400 focus:outline-none focus:ring-0 focus:border-blue-500 peer ${
                validationErrors.username ? "border-red-500" : ""
              }`}
              placeholder=" "
            />
            <label
              htmlFor="fullName"
              className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-500 peer-focus:dark:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
            >
              Full Name
            </label>
            {validationErrors.fullName && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.fullName}
              </p>
            )}
          </div>

          <div className="relative w-full">
            <input
              type="text"
              id="fathersName"
              name="fathersName"
              value={newLearner.fathersName}
              onChange={handleInputChange}
              autoComplete="off"
              className="block w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border-1 border-gray-300 rounded-lg resize-none appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
              placeholder=" "
            />
            <label
              htmlFor="fathersName"
              className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:text-blue-500 peer-focus:dark:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
            >
              Father&apos; Name
            </label>
            {validationErrors.fathersName && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.fathersName}
              </p>
            )}
          </div>
          <div className="relative w-full">
            <input
              type="text"
              id="mobileNumber"
              name="mobileNumber"
              maxLength={10}
              value={newLearner.mobileNumber}
              onChange={handleInputChange}
              autoComplete="off"
              className="block w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border-1 border-gray-300 rounded-lg resize-none appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
              placeholder=" "
            />
            <label
              htmlFor="mobileNumber"
              className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:text-blue-500 peer-focus:dark:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
            >
              Mobile Number
            </label>
            {validationErrors.mobileNumber && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.mobileNumber}
              </p>
            )}
          </div>

          <div className="relative w-full">
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={newLearner.dateOfBirth}
              onChange={handleInputChange}
              onFocus={(event) => (event.nativeEvent.target.defaultValue = "")}
              className="block w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border-1 border-gray-300 rounded-lg resize-none appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
              placeholder=" "
            />
            <label
              htmlFor="dateOfBirth"
              className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:text-blue-500 peer-focus:dark:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
            >
              Date of Birth
            </label>
            {validationErrors.dateOfBirth && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.dateOfBirth}
              </p>
            )}
          </div>
          <div className="relative w-full">
            <select
              id="gender"
              name="gender"
              value={newLearner.gender}
              onChange={handleInputChange}
              className="block w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border-1 border-gray-300 rounded-lg resize-none appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
            >
              <option value="" disabled hidden>
                Select a gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Others</option>
            </select>
            <label
              htmlFor="gender"
              className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:text-blue-500 peer-focus:dark:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
            >
              Gender
            </label>
            {validationErrors.gender && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.gender}
              </p>
            )}
          </div>
          <div className="relative w-full">
            <select
              id="bloodGroup"
              name="bloodGroup"
              value={newLearner.bloodGroup}
              onChange={handleInputChange}
              className="block w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border-1 border-gray-300 rounded-lg resize-none appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
            >
              <option value="" disabled hidden>
                Select Blood Group
              </option>
              {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                (group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                )
              )}
            </select>
            <label
              htmlFor="bloodGroup"
              className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:text-blue-500 peer-focus:dark:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
            >
              Blood Group
            </label>
            {validationErrors.bloodGroup && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.bloodGroup}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              photo
            </label>
            <label
              htmlFor="photo"
              className="flex flex-col items-center justify-center w-full h-36 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer"
            >
              {newLearner.photo ? (
                <img
                  src={filePreviews.photo}
                  alt="Uploaded Preview"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    SVG, PNG, JPG or GIF (MAX. 800x400px)
                  </p>
                </div>
              )}
              <input
                id="photo"
                type="file"
                name="photo"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            {newLearner?.photo && (
              <div className="mt-2 flex justify-between items-center">
                <p className="text-sm">{newLearner.photo.name}</p>
                <button
                  type="button"
                  onClick={() => removeFile("photo")}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              signature
            </label>
            <label
              htmlFor="signature"
              className="flex flex-col items-center justify-center w-full h-36 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer"
            >
              {newLearner.signature ? (
                <img
                  src={filePreviews.signature}
                  alt="Uploaded Preview"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    SVG, PNG, JPG or GIF (MAX. 800x400px)
                  </p>
                </div>
              )}
              <input
                id="signature"
                type="file"
                name="signature"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            {newLearner?.signature && (
              <div className="mt-2 flex justify-between items-center">
                <p className="text-sm">{newLearner.signature.name}</p>
                <button
                  type="button"
                  onClick={() => removeFile("signature")}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              aadharCard
            </label>
            <label
              htmlFor="aadharCard"
              className="flex flex-col items-center justify-center w-full h-36 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer"
            >
              {newLearner.aadharCard ? (
                <img
                  src={filePreviews.aadharCard}
                  alt="Uploaded Preview"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    SVG, PNG, JPG or GIF (MAX. 800x400px)
                  </p>
                </div>
              )}
              <input
                id="aadharCard"
                type="file"
                name="aadharCard"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            {newLearner?.aadharCard && (
              <div className="mt-2 flex justify-between items-center">
                <p className="text-sm">{newLearner.aadharCard.name}</p>
                <button
                  type="button"
                  onClick={() => removeFile("aadharCard")}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              educationCertificate
            </label>
            <label
              htmlFor="educationCertificate"
              className="flex flex-col items-center justify-center w-full h-36 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer"
            >
              {newLearner.educationCertificate ? (
                <img
                  src={filePreviews.educationCertificate}
                  alt="Uploaded Preview"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    SVG, PNG, JPG or GIF (MAX. 800x400px)
                  </p>
                </div>
              )}
              <input
                id="educationCertificate"
                type="file"
                name="educationCertificate"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            {newLearner?.educationCertificate && (
              <div className="mt-2 flex justify-between items-center">
                <p className="text-sm">
                  {newLearner.educationCertificate.name}
                </p>
                <button
                  type="button"
                  onClick={() => removeFile("educationCertificate")}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              passport
            </label>
            <label
              htmlFor="passport"
              className="flex flex-col items-center justify-center w-full h-36 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer"
            >
              {newLearner.passport ? (
                <img
                  src={filePreviews.passport}
                  alt="Uploaded Preview"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    SVG, PNG, JPG or GIF (MAX. 800x400px)
                  </p>
                </div>
              )}
              <input
                id="passport"
                type="file"
                name="passport"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            {newLearner?.passport && (
              <div className="mt-2 flex justify-between items-center">
                <p className="text-sm">{newLearner.passport.name}</p>
                <button
                  type="button"
                  onClick={() => removeFile("passport")}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              notary
            </label>
            <label
              htmlFor="notary"
              className="flex flex-col items-center justify-center w-full h-36 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer"
            >
              {newLearner.notary ? (
                <img
                  src={filePreviews.notary}
                  alt="Uploaded Preview"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    SVG, PNG, JPG or GIF (MAX. 800x400px)
                  </p>
                </div>
              )}
              <input
                id="notary"
                type="file"
                name="notary"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            {newLearner?.notary && (
              <div className="mt-2 flex justify-between items-center">
                <p className="text-sm">{newLearner.notary.name}</p>
                <button
                  type="button"
                  onClick={() => removeFile("notary")}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <textarea
              name="address"
              value={newLearner.address}
              onChange={handleInputChange}
              placeholder=" "
              className="block w-full h-24 px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border-1 border-gray-300 rounded-lg resize-none appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
            />
            <label
              htmlFor="address"
              className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-500 peer-focus:dark:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
            >
              Address
            </label>
            {validationErrors.address && (
              <p className="text-red-500 text-sm">{validationErrors.address}</p>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h5 className="sm:text-2xl md:text-xl font-normal mb-4">
            Additional Details
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-10">
            <div className="relative w-full">
              <input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                value={newLearner.licenseNumber}
                onChange={handleInputChange}
                autoComplete="off"
                className="block w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border-1 border-gray-300 rounded-lg resize-none appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
                placeholder=" "
              />
              <label
                htmlFor="licenseNumber"
                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:text-blue-500 peer-focus:dark:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
              >
                License Number
              </label>
              {validationErrors.licenseNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.licenseNumber}
                </p>
              )}
            </div>
            <div>
              <div className="relative w-full">
                <input
                  type="text"
                  id="llrNumber"
                  name="llrNumber"
                  value={newLearner.llrNumber}
                  onChange={handleInputChange}
                  autoComplete="off"
                  className="block w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border-1 border-gray-300 rounded-lg resize-none appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
                  placeholder=" "
                />
                <label
                  htmlFor="llrNumber"
                  className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:text-blue-500 peer-focus:dark:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
                >
                  LLR Number
                </label>
                {validationErrors.llrNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.llrNumber}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h5 className="sm:text-2xl md:text-xl font-normal mb-4">
            Login Details
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-10">
            <div className="relative w-full">
              <input
                type="text"
                id="username"
                name="username"
                value={newLearner.username}
                onChange={handleInputChange}
                autoComplete="off"
                className="block w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border-1 border-gray-300 rounded-lg resize-none appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
                placeholder=" "
              />
              <label
                htmlFor="username"
                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:text-blue-500 peer-focus:dark:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
              >
                Username
              </label>
              {validationErrors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.username}
                </p>
              )}
            </div>
            <div className="relative w-full">
              <input
                type="text"
                id="password"
                name="password"
                value={newLearner.password}
                onChange={handleInputChange}
                autoComplete="off"
                className="block w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border-1 border-gray-300 rounded-lg resize-none appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
                placeholder=" "
              />
              <label
                htmlFor="password"
                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:text-blue-500 peer-focus:dark:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
              >
                Password
              </label>
              {validationErrors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.password}
                </p>
              )}
            </div>{" "}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:justify-end space-y-4 md:space-y-0 md:space-x-4 mt-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800"
          >
            Back
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-800"
            disabled={loading}
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
            Learner created successfully
          </div>
        </div>
      )}
    </div>
  );
};

export default NewRegistration;
