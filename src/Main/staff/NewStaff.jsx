import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { URL as BURL } from "../../App";
import axios from "axios";
import { useRole } from "../../Components/AuthContext/AuthContext";

const NewStaffr = () => {
  const navigate = useNavigate();
        const {role, user,setUser,setRole,clearAuthState} =  useRole();

  const [newStaff, setNewStaff] = useState({
    fullName: "",
    fathersName: "",
    mobileNumber: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    address: "",
    photo: null,
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStaff((prev) => ({
      ...prev,
      [name]: value,
    }));

    setValidationErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!newStaff.fullName) {
      errors.fullName = "Full Name is required.";
    }
    if (!newStaff.fathersName) {
      errors.fathersName = "Father's Name is required.";
    }
    if (!newStaff.mobileNumber) {
      errors.mobileNumber = "Mobile Number is required.";
    } else if (!/^\d{10}$/.test(newStaff.mobileNumber)) {
      errors.mobileNumber = "Mobile Number must be exactly 10 digits.";
    }
    if (!newStaff.dateOfBirth) {
      errors.dateOfBirth = "Date of Birth is required.";
    }
    if (!newStaff.gender) {
      errors.gender = "Gender is required.";
    }
    if (!newStaff.bloodGroup) {
      errors.bloodGroup = "Blood Group is required.";
    }
    if (!newStaff.address) {
      errors.address = "Address is required.";
    }

    return errors;
  };
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Unauthorized! Please log in.");
      setLoading(false);
      return;
    }

    if (!newStaff.photo?.file) {
      alert("Please upload a photo.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    for (const key in newStaff) {
      if (newStaff[key] && key !== "photo") {
        formData.append(key, newStaff[key]);
      }
    }
    formData.append("photo", newStaff.photo.file);

    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      await axios.post(`${BURL}/api/admin/staff/create`, formData, {
        withCredentials: true,
      });

      setToastOpen(true);
      setTimeout(() => {
        setToastOpen(false);
        navigate(-1);
      }, 1000);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching data:", error);
        if (
          error.response &&
          (error.response.status === 401 ||
            error.response.data.message === "Invalid token")
        ) {
          return setTimeout(() => {
            clearAuthState();
            navigate("/");
          }, 2000);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setNewStaff((prev) => ({
          ...prev,
          photo: {
            file: file,
            preview: reader.result,
          },
        }));
      };
    }
  };

  const removePhoto = () => {
    setNewStaff((prev) => ({
      ...prev,
      photo: null,
    }));
  };

  return (
    <>
      <div className="p-4">
        <h2 className="sm:text-3xl md:text-2xl font-semibold mb-4">
          Staff Registration
        </h2>
        <h5 className="sm:text-2xl md:text-xl font-normal mb-4">
          Personal Details
        </h5>
        <form onSubmit={handleRegisterSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-10">
            <div className="relative">
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder=" "
                value={newStaff.fullName}
                onChange={handleInputChange}
                className="peer w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
              />
              <label
                htmlFor="fullName"
                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
              >
                Full Name
              </label>
              {validationErrors.fullName && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.fullName}
                </p>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                id="fathersName"
                name="fathersName"
                placeholder=" "
                value={newStaff.fathersName}
                onChange={handleInputChange}
                className="peer w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
              />
              <label
                htmlFor="fathersName"
                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
              >
                Father&apos;s Name
              </label>
              {validationErrors.fathersName && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.fathersName}
                </p>
              )}
            </div>
            <div className="relative ">
              <input
                type="text"
                id="mobileNumber"
                name="mobileNumber"
                placeholder=" "
                maxLength={10}
                value={newStaff.mobileNumber}
                onChange={handleInputChange}
                className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer"
              />
              <label
                htmlFor="mobileNumber"
                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:text-blue-500 peer-focus:dark:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
              >
                Mobile Number
              </label>
              {validationErrors.mobileNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.mobileNumber}
                </p>
              )}
            </div>
            <div className="relative">
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={newStaff.dateOfBirth}
                onChange={handleInputChange}
                onFocus={(event) =>
                  (event.nativeEvent.target.defaultValue = "")
                }
                placeholder=" "
                className="peer w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-0 focus:border-blue-500"
              />
              <label
                htmlFor="dateOfBirth"
                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
              >
                Date of Birth
              </label>
              {validationErrors.dateOfBirth && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.dateOfBirth}
                </p>
              )}
            </div>
            <div className="relative">
              <select
                id="gender"
                name="gender"
                value={newStaff.gender}
                onChange={handleInputChange}
                className="peer w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
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
                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
              >
                Gender
              </label>
              {validationErrors.gender && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.gender}
                </p>
              )}
            </div>

            <div className="relative">
              <select
                id="bloodGroup"
                name="bloodGroup"
                value={newStaff.bloodGroup}
                onChange={handleInputChange}
                className="peer w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
              >
                <option value="" disabled hidden>
                  Select a blood group
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
              <label
                htmlFor="bloodGroup"
                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
              >
                Blood Group
              </label>
              {validationErrors.bloodGroup && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.bloodGroup}
                </p>
              )}
            </div>

            <div className="relative mt-6">
              <textarea
                id="address"
                name="address"
                placeholder=" "
                value={newStaff.address}
                onChange={handleInputChange}
                className="peer w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md resize-none h-36 focus:outline-none focus:ring-0 focus:border-blue-500"
              />
              <label
                htmlFor="address"
                className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-4 peer-placeholder-shown:-translate-y-1 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1"
              >
                Address
              </label>
              {validationErrors.address && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.address}
                </p>
              )}
            </div>
            <div className="flex flex-col w-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Photo
              </label>

              <label
                htmlFor="dropzone-file"
                className={`flex items-center justify-center w-full h-36 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer 
      ${
        !newStaff?.photo
          ? "dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          : ""
      } 
      dark:border-gray-600 dark:hover:border-gray-500 relative overflow-hidden`}
              >
                {newStaff?.photo?.preview ? (
                  <img
                    src={newStaff.photo.preview}
                    alt="staff"
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
                      SVG, PNG, JPG, or GIF (MAX. 800x400px)
                    </p>
                  </div>
                )}

                <input
                  id="dropzone-file"
                  type="file"
                  name="photo"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </label>

              {newStaff?.photo?.file && (
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-sm">{newStaff.photo.file.name}</p>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
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
              disabled={loading}
            >
              Submit
            </button>{" "}
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
              Staff created successfully
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NewStaffr;
