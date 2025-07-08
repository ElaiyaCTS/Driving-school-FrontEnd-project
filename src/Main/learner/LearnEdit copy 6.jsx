import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion";
import { useRole } from "../../Components/AuthContext/AuthContext";
import axios from "axios";
import { URL as BURL } from "../../App";
import  getDriveFileType from "../../Components/ImageProxyRouterFunction/DriveFileType";

const schema = yup.object().shape({
  fullName: yup.string().required("Full name is required"),
  fathersName: yup.string().required("Father's name is required"),
  mobileNumber: yup.string().required("Mobile number is required").matches(/^\d{10}$/, "Must be 10 digits"),
  dateOfBirth: yup.string().required("Date of birth is required"),
  gender: yup.string().required("Gender is required"),
  bloodGroup: yup.string().required("Blood group is required"),
  address: yup.string().required("Address is required"),
  licenseNumber: yup.string().required("License number is required"),
  llrNumber: yup.string().required("LLR number is required"),
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),
});

const inputClass = "peer block w-full appearance-none border border-gray-300 bg-transparent px-2.5 pt-4 pb-2.5 text-sm text-gray-900 rounded-lg focus:outline-none focus:ring-0 focus:border-blue-500 dark:text-white dark:border-gray-600 dark:focus:border-blue-400";
const labelClass = "absolute start-1 z-10 origin-[0] scale-75 transform -translate-y-4 top-2 bg-white dark:bg-gray-900 px-2 text-sm text-gray-500 dark:text-gray-400 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-500 peer-focus:dark:text-blue-400";

const LearEdit = () => {
  const { id, admissionNumber } = useParams();
  const { clearAuthState } = useRole();
  const navigate = useNavigate();
  const [filePreviews, setFilePreviews] = useState({});
  const [modalState, setModalState] = useState({});
  const [toastOpen, setToastOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });


useEffect(() => {
  const fetchLearner = async () => {
    try {
      const res = await axios.get(`${BURL}/api/admin/learner/${id}`, { withCredentials: true });
      const data = res.data;

      Object.entries(data).forEach(([key, val]) => {
        if (key === "userId") {
          setValue("username", val?.username || "");
          setValue("password", val?.password || "");
        } else if (key === "dateOfBirth") {
          setValue(key, new Date(val).toISOString().split("T")[0]);
        } else {
          setValue(key, val);
        }
      });

    const fileKeys = ["photo", "signature", "aadharCard", "educationCertificate", "passport", "notary"];
const previews = {};

for (const key of fileKeys) {
  const fileUrl = data[key];
  if (!fileUrl) continue;

  const driveId = extractDriveFileId(fileUrl);
  const proxyUrl = driveId
    ? `${BURL}/api/image-proxy/${driveId}`
    : `${fileUrl}?t=${Date.now()}`;

  let isPDF = false;

  if (driveId) {
    try {
      const headRes = await axios.head(proxyUrl, { withCredentials: true });
      const fileType = headRes.headers["x-file-type"];
      isPDF = fileType === "pdf";
    } catch (err) {
      console.warn("HEAD request failed for", proxyUrl);
    }
  } else {
    isPDF = /\.pdf$/i.test(fileUrl);
  }

  previews[key] = {
    url: proxyUrl,
    isPDF,
  };
}


      setFilePreviews(previews);
    } catch (err) {
      console.error("Error loading learner:", err);
    }
  };

  fetchLearner();
}, [id, setValue]);

  const handleFileChange = async (e, name, onlyImage) => {
    const file = e.target.files[0];
    if (!file) return;
    if (onlyImage && !file.type.startsWith("image/")) {
      setValue(name, null);
      await trigger(name);
      return;
    }
    const url = URL.createObjectURL(file);
    setValue(name, file);
    setFilePreviews((prev) => ({
      ...prev,
      [name]: {
        file,
        url,
        isPDF: file.type === "application/pdf",
      },
    }));
    await trigger(name);
  };

  const handleRemoveFile = (name) => {
    setValue(name, null);
    setFilePreviews((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
    setModalState((prev) => ({ ...prev, [name]: false }));
  };

  const renderFileInput = (name, label, onlyImage = false) => {
    const preview = filePreviews[name];
    const previewUrl = preview?.url;
    const isPDF = preview?.isPDF;
    const isOpen = !!modalState[name];

    const openModal = () => setModalState((prev) => ({ ...prev, [name]: true }));
    const closeModal = () => setModalState((prev) => ({ ...prev, [name]: false }));

    return (
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">{label}</label>
        <label htmlFor={name} className="flex items-center justify-center w-full border-2 border-dashed rounded-lg cursor-pointer h-36">
          {previewUrl ? (
            isPDF ? (
              <iframe src={previewUrl} title="PDF" className="w-full h-full border rounded" />
            ) : (
              <img src={previewUrl} alt="Preview" className="object-contain w-full h-full rounded-lg" />
            )
          ) : (
            <span className="text-sm text-gray-400">Click to upload</span>
          )}
          <input type="file" id={name} name={name} accept={onlyImage ? "image/*" : "image/*,.pdf"} className="hidden"
            onChange={(e) => handleFileChange(e, name, onlyImage)} />
        </label>
        {previewUrl && (
          <div className="flex justify-between mt-2">
            <button type="button" className="text-sm text-blue-600" onClick={openModal}>View</button>
            <button type="button" className="text-sm text-red-500" onClick={() => handleRemoveFile(name)}>Remove</button>
          </div>
        )}
        {errors[name] && <p className="mt-1 text-sm text-red-500">{errors[name]?.message}</p>}
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-11/12 max-w-2xl p-6 bg-white rounded-lg">
              <button onClick={closeModal} className="absolute text-red-500 top-2 right-2 text-xl">✕</button>
              {isPDF ? (
                <iframe src={previewUrl} title="PDF Preview" className="w-full h-[80vh]" />
              ) : (
                <img src={previewUrl} alt="Preview" className="max-w-full max-h-[80vh]" />
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderInput = (name, label, type = "text") => (
    <div className="relative w-full">
      <input type={type} id={name} placeholder=" " {...register(name)} className={inputClass} />
      <label htmlFor={name} className={labelClass}>{label}</label>
      {errors[name] && <p className="mt-1 text-sm text-red-500">{errors[name].message}</p>}
    </div>
  );

  const renderSelect = (name, label, options) => (
    <div className="relative w-full">
      <select {...register(name)} className={inputClass}>
        <option value="">Select {label}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <label className={labelClass}>{label}</label>
      {errors[name] && <p className="mt-1 text-sm text-red-500">{errors[name].message}</p>}
    </div>
  );

  const renderTextarea = (name, label) => (
    <div className="relative w-full">
      <textarea {...register(name)} placeholder=" " className={`${inputClass} resize-none h-24`} />
      <label className={labelClass}>{label}</label>
      {errors[name] && <p className="mt-1 text-sm text-red-500">{errors[name].message}</p>}
    </div>
  );

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else if (typeof value === "string") {
        formData.append(key, value);
      }
    });

    try {
      setLoading(true);
      await axios.put(`${BURL}/api/user/learner/${admissionNumber}`, formData, { withCredentials: true });
      setToastOpen(true);
      setTimeout(() => {
        setToastOpen(false);
        navigate(-1);
      }, 1000);
    } catch (err) {
      if (err?.response?.status === 401) return setTimeout(clearAuthState, 2000);
      const msg = err?.response?.data?.message || err?.message || "Something went wrong";
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold">Update Learner</h2>
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

        <div className="py-6">
          {renderTextarea("address", "Address")}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {renderInput("licenseNumber", "License Number")}
          {renderInput("llrNumber", "LLR Number")}
          {renderInput("username", "Username")}
          {renderInput("password", "Password")}
        </div>

        <div className="flex justify-end mt-6">
          <button type="submit" disabled={loading} className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-800">
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </form>

      {toastOpen && <div className="fixed px-4 py-2 text-white bg-blue-700 rounded shadow top-20 right-5">Learner updated successfully</div>}
      {errorMsg && <div className="fixed px-4 py-2 text-white bg-red-600 rounded shadow top-32 right-5">{errorMsg}</div>}
    </div>
  );
};

export default LearEdit;
