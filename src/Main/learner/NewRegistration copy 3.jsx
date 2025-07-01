import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { URL as BURL } from "../../App";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useRole } from "../../Components/AuthContext/AuthContext.jsx";

const schema = yup.object().shape({
  fullName: yup.string().required("Full Name is required."),
  fathersName: yup.string().required("Father's Name is required."),
  mobileNumber: yup
    .string()
    .matches(/^\d{10}$/, "Mobile Number must be 10 digits."),
  dateOfBirth: yup.string().required("Date of Birth is required."),
  gender: yup.string().required("Gender is required."),
  bloodGroup: yup.string().required("Blood Group is required."),
  address: yup.string().required("Address is required."),
  licenseNumber: yup.string().required("License number is required."),
  llrNumber: yup.string().required("LLR number is required."),
  username: yup.string().required("Username is required."),
  password: yup.string().required("Password is required."),
   photo: yup.mixed().test("required", "Photo is required", (value) => value?.length > 0),
  signature: yup.mixed().test("required", "Signature is required", (value) => value?.length > 0),
  aadharCard: yup.mixed().test("required", "Aadhar Card is required", (value) => value?.length > 0),
  educationCertificate: yup.mixed().test("required", "Education Certificate is required", (value) => value?.length > 0),
  passport: yup.mixed().test("required", "Passport is required", (value) => value?.length > 0),
  notary: yup.mixed().test("required", "Notary is required", (value) => value?.length > 0),
});

const floatingInputClass =
  "peer block w-full appearance-none border border-gray-300 bg-transparent px-2.5 pt-4 pb-2.5 text-sm text-gray-900 rounded-lg focus:outline-none focus:ring-0 focus:border-blue-500 dark:text-white dark:border-gray-600 dark:focus:border-blue-400";
const floatingLabelClass =
  "absolute start-1 z-10 origin-[0] scale-75 transform -translate-y-4 top-2 bg-white dark:bg-gray-900 px-2 text-sm text-gray-500 dark:text-gray-400 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-500 peer-focus:dark:text-blue-400";

const NewRegistration = () => {
  const navigate = useNavigate();
  const { clearAuthState } = useRole();
  const [filePreviews, setFilePreviews] = useState({});
  const [modalState, setModalState] = useState({});
  const [toastOpen, setToastOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (value instanceof FileList && value.length > 0) {
        formData.append(key, value[0]);
      } else if (value) {
        formData.append(key, value);
      }
    });
    formData.append("role", "Learner");

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
      if (
        error.response?.status === 401 ||
        error.response?.data?.message ===
          "Credential Invalid or Expired Please Login Again"
      ) {
        setTimeout(clearAuthState, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (name, label, type = "text") => (
    <div className="relative w-full">
      <input
        type={type}
        id={name}
        placeholder=" "
        {...register(name)}
        className={floatingInputClass}
      />
      <label htmlFor={name} className={floatingLabelClass}>
        {label}
      </label>
      {errors[name] && (
        <p className="mt-1 text-sm text-red-500">{errors[name].message}</p>
      )}
    </div>
  );

  const renderSelect = (name, label, options) => (
    <div className="relative w-full">
      <select id={name} {...register(name)} className={floatingInputClass}>
        <option value="" disabled hidden>
          Select an option
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <label htmlFor={name} className={floatingLabelClass}>
        {label}
      </label>
      {errors[name] && (
        <p className="mt-1 text-sm text-red-500">{errors[name].message}</p>
      )}
    </div>
  );

  const renderTextarea = (name, label) => (
    <div className="relative w-full">
      <textarea
        id={name}
        placeholder=" "
        {...register(name)}
        className={floatingInputClass + " resize-none h-24"}
      />
      <label htmlFor={name} className={floatingLabelClass}>
        {label}
      </label>
      {errors[name] && (
        <p className="mt-1 text-sm text-red-500">{errors[name].message}</p>
      )}
    </div>
  );

  const renderFileInput = (fieldName, label, acceptOnlyImages = false) => {
    const previewObj = filePreviews[fieldName];
    const file = previewObj?.file;
    const previewUrl = previewObj?.url;
    const isPDF = file?.type === "application/pdf";
    const isModalOpen = modalState[fieldName] || false;

    const openModal = () =>
      setModalState((prev) => ({ ...prev, [fieldName]: true }));
    const closeModal = () =>
      setModalState((prev) => ({ ...prev, [fieldName]: false }));

    const handleRemove = () => {
      setFilePreviews((prev) => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
      setValue(fieldName, null);
      closeModal();
    };

    const handleFileChange = (e) => {
      const { files } = e.target;
      if (files && files.length > 0) {
        const file = files[0];
        const url = URL.createObjectURL(file);
        setValue(fieldName, files);
        setFilePreviews((prev) => ({
          ...prev,
          [fieldName]: { file, url },
        }));
      }
      };

    const acceptTypes = acceptOnlyImages ? "image/*" : "image/*,.pdf";

    return (
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700 capitalize">
          {label}
        </label>

        <label
          htmlFor={fieldName}
          className="flex flex-col items-center justify-center w-full overflow-hidden border-2 border-gray-300 border-dashed rounded-lg cursor-pointer h-36"
        >
          {file ? (
            !isPDF ? (
              <img
                src={previewUrl}
                alt="Uploaded Preview"
                className="object-contain w-full h-full rounded-lg"
              />
            ) : (
              <iframe
                src={previewUrl}
                title="PDF Preview"
                className="w-full h-full border rounded"
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-4 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5A5.5 5.5 0 0 0 5.2 5.02C5.14 5.02 5.07 5 5 5a4 4 0 0 0 0 8h2.17M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500">
                {acceptOnlyImages
                  ? "JPG, PNG, JPEG (Max ~5MB)"
                  : "PDF, JPG, PNG, JPEG (Max ~5MB)"}
              </p>
            </div>
          )}
          <input
            id={fieldName}
            type="file"
            name={fieldName}
            accept={acceptTypes}
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {file && (
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm truncate">{file.name}</p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={openModal}
                className="text-sm text-blue-600 hover:underline"
              >
                View
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="text-sm text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {isModalOpen && previewUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-11/12 max-w-2xl p-6 bg-white rounded-lg shadow-xl">
              <button
                className="absolute text-red-600 right-1 top-2 hover:text-gray-700"
                onClick={closeModal}
              >
                ✕
              </button>
              <div className="w-full h-[80vh] flex items-center justify-center">
                {!isPDF ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="object-contain max-w-full max-h-full"
                  />
                ) : (
                  <iframe
                    src={previewUrl}
                    title="PDF Preview"
                    className="w-full h-full border rounded"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 font-semibold sm:text-3xl md:text-2xl">
        Learner Registration
      </h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 gap-y-10">
          {renderInput("fullName", "Full Name")}
          {renderInput("fathersName", "Father's Name")}
          {renderInput("mobileNumber", "Mobile Number")}
          {renderInput("dateOfBirth", "Date of Birth", "date")}
          {renderSelect("gender", "Gender", ["Male", "Female", "Other"])}
          {renderSelect("bloodGroup", "Blood Group", [
            "A+",
            "A-",
            "B+",
            "B-",
            "O+",
            "O-",
            "AB+",
            "AB-",
          ])}
          {renderFileInput("photo", "Photo", true)}
          {renderFileInput("signature", "Signature")}
          {renderFileInput("aadharCard", "Aadhar Card")}
          {renderFileInput("educationCertificate", "Education Certificate")}
          {renderFileInput("passport", "Passport")}
          {renderFileInput("notary", "Notary")}
      
        </div>

         <div className="grid py-10 grid-row-1 md:grid-row-2 gap-y-10" >
                    {renderTextarea("address", "Address")}
          
          </div>
        
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 gap-y-10">
      {renderInput("licenseNumber", "License Number")}
          {renderInput("llrNumber", "LLR Number")}
          {renderInput("username", "Username")}
          {renderInput("password", "Password")}
  </div>
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-800"
            disabled={loading}
          >
            Submit
          </button>
        </div>
      </form>

      {toastOpen && (
        <div className="fixed p-4 text-white bg-blue-700 rounded shadow top-20 right-5">
          Learner created successfully
        </div>
      )}
    </div>
  );
};

export default NewRegistration;
