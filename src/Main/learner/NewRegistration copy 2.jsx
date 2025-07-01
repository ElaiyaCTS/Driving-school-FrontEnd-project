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
    if (!newLearner.photo) errors.photo = "photo is file required.";
    if (!newLearner.signature) errors.signature = "signature is file required.";
    if (!newLearner.aadharCard) errors.aadharCard = "aadharCard is file required.";
    if (!newLearner.educationCertificate) errors.educationCertificate = "educationCertificate is file required.";
    if (!newLearner.passport) errors.passport = "passport is file required.";
    if (!newLearner.notary) errors.notary = "notary is file required.";

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
          clearAuthState();
            // navigate("/");
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
      <h2 className="mb-4 font-semibold sm:text-3xl md:text-2xl">
        Learner Registration
      </h2>

      <h5 className="mb-4 font-normal sm:text-2xl md:text-xl">
        Personal Details
      </h5>

      <form onSubmit={handleRegisterSubmit}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 gap-y-10">
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
              <p className="mt-1 text-sm text-red-500">
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
              <p className="mt-1 text-sm text-red-500">
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
              <p className="mt-1 text-sm text-red-500">
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
              <p className="mt-1 text-sm text-red-500">
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
              <p className="mt-1 text-sm text-red-500">
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
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.bloodGroup}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              photo
            </label>
            <label
              htmlFor="photo"
              className="flex flex-col items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer h-36"
            >
              {newLearner.photo ? (
                <img
                  src={filePreviews.photo}
                  alt="Uploaded Preview"
                  className="object-contain w-full h-full rounded-lg"
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
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm">{newLearner.photo.name}</p>
                <button
                  type="button"
                  onClick={() => removeFile("photo")}
                  className="text-sm text-red-500"
                >
                  Remove
                </button>
                
              </div>
            )}
             {validationErrors.photo && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.photo}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              signature
            </label>
            <label
              htmlFor="signature"
              className="flex flex-col items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer h-36"
            >
              {newLearner.signature ? (
                <img
                  src={filePreviews.signature}
                  alt="Uploaded Preview"
                  className="object-contain w-full h-full rounded-lg"
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
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm">{newLearner.signature.name}</p>
                <button
                  type="button"
                  onClick={() => removeFile("signature")}
                  className="text-sm text-red-500"
                >
                  Remove
                </button>
              </div>
            )}
             {validationErrors.signature && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.signature}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              aadharCard
            </label>
            <label
              htmlFor="aadharCard"
              className="flex flex-col items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer h-36"
            >
              {newLearner.aadharCard ? (
                <img
                  src={filePreviews.aadharCard}
                  alt="Uploaded Preview"
                  className="object-contain w-full h-full rounded-lg"
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
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm">{newLearner.aadharCard.name}</p>
                <button
                  type="button"
                  onClick={() => removeFile("aadharCard")}
                  className="text-sm text-red-500"
                >
                  Remove
                </button>
              </div>
            )}
             {validationErrors.aadharCard && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.aadharCard}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              educationCertificate
            </label>
            <label
              htmlFor="educationCertificate"
              className="flex flex-col items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer h-36"
            >
              {newLearner.educationCertificate ? (
                <img
                  src={filePreviews.educationCertificate}
                  alt="Uploaded Preview"
                  className="object-contain w-full h-full rounded-lg"
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
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm">
                  {newLearner.educationCertificate.name}
                </p>
                <button
                  type="button"
                  onClick={() => removeFile("educationCertificate")}
                  className="text-sm text-red-500"
                >
                  Remove
                </button>
              </div>
            )}
             {validationErrors.educationCertificate && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.educationCertificate}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              passport
            </label>
            <label
              htmlFor="passport"
              className="flex flex-col items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer h-36"
            >
              {newLearner.passport ? (
                <img
                  src={filePreviews.passport}
                  alt="Uploaded Preview"
                  className="object-contain w-full h-full rounded-lg"
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
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm">{newLearner.passport.name}</p>
                <button
                  type="button"
                  onClick={() => removeFile("passport")}
                  className="text-sm text-red-500"
                >
                  Remove
                </button>
              </div>
            )}
             {validationErrors.passport && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.passport}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">
              notary
            </label>
            <label
              htmlFor="notary"
              className="flex flex-col items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer h-36"
            >
              {newLearner.notary ? (
                <img
                  src={filePreviews.notary}
                  alt="Uploaded Preview"
                  className="object-contain w-full h-full rounded-lg"
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
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm">{newLearner.notary.name}</p>
                <button
                  type="button"
                  onClick={() => removeFile("notary")}
                  className="text-sm text-red-500"
                >
                  Remove
                </button>
              </div>
            )}
             {validationErrors.notary && (
              <p className="mt-1 text-sm text-red-500">
                {validationErrors.notary}
              </p>
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
              <p className="text-sm text-red-500">{validationErrors.address}</p>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h5 className="mb-4 font-normal sm:text-2xl md:text-xl">
            Additional Details
          </h5>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 gap-y-10">
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
                <p className="mt-1 text-sm text-red-500">
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
                  <p className="mt-1 text-sm text-red-500">
                    {validationErrors.llrNumber}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h5 className="mb-4 font-normal sm:text-2xl md:text-xl">
            Login Details
          </h5>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 gap-y-10">
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
                <p className="mt-1 text-sm text-red-500">
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
                <p className="mt-1 text-sm text-red-500">
                  {validationErrors.password}
                </p>
              )}
            </div>{" "}
          </div>
        </div>

        <div className="flex flex-col mt-6 space-y-4 md:flex-row md:justify-end md:space-y-0 md:space-x-4">
        <button
  onClick={() => navigate(-1)}
  disabled={loading}
  className={`bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800 
    ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
>
  Back
</button>
   {loading? (<button disabled type="button" className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-800">
<svg aria-hidden="true" role="status" className="inline w-4 h-4 text-white me-3 animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
</svg>Loading...</button>
):( <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-800"
          >
            Submit
          </button>)}
         
        </div>
      </form>
      {toastOpen && (
        <div
          id="toast-success"
          className="fixed flex items-center justify-center w-full max-w-xs p-4 text-white bg-blue-700 rounded-md shadow-md top-20 right-5"
          role="alert"
        >
          <div className="inline-flex items-center justify-center w-8 h-8 text-green-700 bg-green-100 rounded-md shrink-0 dark:bg-green-800 dark:text-green-400">
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
          <div className="text-sm font-normal ms-3">
            Learner created successfully
          </div>
        </div>
      )}
    </div>
  );
};

export default NewRegistration;
