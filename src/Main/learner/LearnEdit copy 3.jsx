import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useRole } from "../../Components/AuthContext/AuthContext.jsx";
import { URL as BURL } from "../../App";

const schema = yup.object().shape({
  fullName: yup.string().required("Full Name is required."),
  fathersName: yup.string().required("Father's Name is required."),
  mobileNumber: yup.string().matches(/^[0-9]{10}$/, "Mobile Number must be 10 digits."),
  dateOfBirth: yup.string().required("Date of Birth is required."),
  gender: yup.string().required("Gender is required."),
  bloodGroup: yup.string().required("Blood Group is required."),
  address: yup.string().required("Address is required."),
  licenseNumber: yup.string().required("License number is required."),
  llrNumber: yup.string().required("LLR number is required."),
  username: yup.string().required("Username is required."),
  password: yup.string().required("Password is required."),
  photo: yup.mixed(),
  signature: yup.mixed(),
  aadharCard: yup.mixed(),
  educationCertificate: yup.mixed(),
  passport: yup.mixed(),
  notary: yup.mixed(),
});

const LearnerEdit = () => {
  const { id } = useParams(); // Learner ID from route
  const { clearAuthState } = useRole();
  const navigate = useNavigate();
  const [filePreviews, setFilePreviews] = useState({});
  const [modalState, setModalState] = useState({});
  const [loading, setLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  // 🔄 Fetch learner details and populate
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`${BURL}/api/admin/learner/${id}`, {
          withCredentials: true,
        });

        Object.keys(data).forEach((key) => {
          if (key === "files") {
            for (const fileKey in data.files) {
              setFilePreviews((prev) => ({
                ...prev,
                [fileKey]: {
                  file: { name: data.files[fileKey].split("/").pop(), type: data.files[fileKey].includes(".pdf") ? "application/pdf" : "image/*" },
                  url: data.files[fileKey],
                },
              }));
            }
          } else {
            setValue(key, data[key]);
          }
        });
      } catch (err) {
        console.error("Failed to fetch learner", err);
      }
    };

    fetchData();
  }, [id, setValue]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (value instanceof FileList && value.length > 0) {
        formData.append(key, value[0]);
      } else {
        formData.append(key, value);
      }
    });

    try {
      setLoading(true);
      await axios.put(`${BURL}/api/admin/update-learner/${id}`, formData, {
        withCredentials: true,
      });

      reset();
      setFilePreviews({});
      setToastOpen(true);
      setTimeout(() => {
        setToastOpen(false);
        navigate(-1);
      }, 1000);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Something went wrong";
      setErrorMessage(message);
      if (err?.response?.status === 401) {
        return setTimeout(clearAuthState, 2000);
      }
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const floatingInputClass =
    "peer block w-full appearance-none border border-gray-300 bg-transparent px-2.5 pt-4 pb-2.5 text-sm text-gray-900 rounded-lg focus:outline-none focus:ring-0 focus:border-blue-500";
  const floatingLabelClass =
    "absolute start-1 z-10 origin-[0] scale-75 transform -translate-y-4 top-2 bg-white px-2 text-sm text-gray-500 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-500";

  const renderInput = (name, label, type = "text") => (
    <div className="relative w-full">
      <input type={type} id={name} placeholder=" " {...register(name)} className={floatingInputClass} />
      <label htmlFor={name} className={floatingLabelClass}>{label}</label>
      {errors[name] && <p className="mt-1 text-sm text-red-500">{errors[name].message}</p>}
    </div>
  );

  const renderTextarea = (name, label) => (
    <div className="relative w-full">
      <textarea id={name} placeholder=" " {...register(name)} className={`${floatingInputClass} resize-none h-24`} />
      <label htmlFor={name} className={floatingLabelClass}>{label}</label>
      {errors[name] && <p className="mt-1 text-sm text-red-500">{errors[name].message}</p>}
    </div>
  );

  const renderSelect = (name, label, options) => (
    <div className="relative w-full">
      <select id={name} {...register(name)} className={floatingInputClass}>
        <option value="" disabled hidden>Select an option</option>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <label htmlFor={name} className={floatingLabelClass}>{label}</label>
      {errors[name] && <p className="mt-1 text-sm text-red-500">{errors[name].message}</p>}
    </div>
  );

  const renderFileInput = (fieldName, label, onlyImage = false) => {
    const previewObj = filePreviews[fieldName];
    const file = previewObj?.file;
    const previewUrl = previewObj?.url;
    const isPDF = file?.type === "application/pdf";
    const isModalOpen = modalState[fieldName] || false;

    const openModal = () => setModalState(prev => ({ ...prev, [fieldName]: true }));
    const closeModal = () => setModalState(prev => ({ ...prev, [fieldName]: false }));

    const handleFileChange = async (e) => {
      const files = e.target.files;
      if (files?.length) {
        const file = files[0];

        if (onlyImage && !file.type.startsWith("image/")) {
          setValue(fieldName, null);
          await trigger(fieldName);
          return;
        }

        const url = URL.createObjectURL(file);
        setValue(fieldName, files);
        setFilePreviews(prev => ({ ...prev, [fieldName]: { file, url } }));
        await trigger(fieldName);
      }
    };

    const handleRemove = () => {
      setFilePreviews(prev => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
      setValue(fieldName, null);
      closeModal();
    };

    const acceptType = onlyImage ? "image/*" : "image/*,.pdf";

    return (
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium text-gray-700 capitalize">{label}</label>
        <label htmlFor={fieldName} className="flex flex-col items-center justify-center w-full overflow-hidden border-2 border-gray-300 border-dashed rounded-lg cursor-pointer h-36">
          {file ? (
            !onlyImage && isPDF ? (
              <iframe src={previewUrl} className="w-full h-full border rounded" title="PDF Preview" />
            ) : (
              <img src={previewUrl} alt="Preview" className="object-contain w-full h-full rounded-lg" />
            )
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6A5.5 5.5 0 0 0 5 5a4 4 0 0 0 0 8h2M10 15V6m0 0L8 8m2-2 2 2" />
              </svg>
              <p className="mb-2 text-sm text-gray-500">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500">Accepted: {acceptType}</p>
            </div>
          )}
          <input id={fieldName} type="file" name={fieldName} className="hidden" accept={acceptType} onChange={handleFileChange} />
        </label>

        {file && (
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm truncate">{file.name}</p>
            <div className="flex gap-2">
              <button onClick={openModal} type="button" className="text-sm text-blue-600 hover:underline">View</button>
              <button onClick={handleRemove} type="button" className="text-sm text-red-500 hover:underline">Remove</button>
            </div>
          </div>
        )}

        {isModalOpen && previewUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-11/12 max-w-2xl p-6 bg-white rounded-lg shadow-xl">
              <button onClick={closeModal} className="absolute text-red-500 top-2 right-2 hover:text-gray-700">✕</button>
              <div className="w-full h-[80vh] flex items-center justify-center">
                {!onlyImage && isPDF ? (
                  <iframe src={previewUrl} title="Preview" className="w-full h-full border rounded" />
                ) : (
                  <img src={previewUrl} alt="Preview" className="object-contain max-w-full max-h-full" />
                )}
              </div>
            </div>
          </div>
        )}

        {errors[fieldName] && <p className="mt-1 text-sm text-red-500">{errors[fieldName]?.message}</p>}
      </div>
    );
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 text-2xl font-semibold">Edit Learner</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {renderInput("fullName", "Full Name")}
          {renderInput("fathersName", "Father's Name")}
          {renderInput("mobileNumber", "Mobile Number")}
          {renderInput("dateOfBirth", "Date of Birth", "date")}
          {renderSelect("gender", "Gender", ["Male", "Female", "Other"])}
          {renderSelect("bloodGroup", "Blood Group", ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"])}
          {renderFileInput("photo", "Photo", true)}
          {renderFileInput("signature", "Signature")}
          {renderFileInput("aadharCard", "Aadhar Card")}
          {renderFileInput("educationCertificate", "Education Certificate")}
          {renderFileInput("passport", "Passport")}
          {renderFileInput("notary", "Notary")}
        </div>

        <div className="py-10">{renderTextarea("address", "Address")}</div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {renderInput("licenseNumber", "License Number")}
          {renderInput("llrNumber", "LLR Number")}
          {renderInput("username", "Username")}
          {renderInput("password", "Password")}
        </div>

        <div className="flex justify-end mt-6">
          <button disabled={loading} type="submit" className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-800">
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </form>

      {toastOpen && (
        <div className="fixed px-4 py-2 text-white bg-green-700 rounded shadow top-20 right-5">
          Learner updated successfully
        </div>
      )}
      {errorMessage && (
        <div className="fixed px-4 py-2 text-white bg-red-600 rounded shadow top-32 right-5">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default LearnerEdit;

