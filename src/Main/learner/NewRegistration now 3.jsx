// ✅ NewRegistration.jsx (Refactored with react-hook-form + yup + custom Tailwind CSS)
import { useNavigate } from "react-router-dom";
import { URL as BURL } from "../../App";
import axios from "axios";
import { useRole } from "../../Components/AuthContext/AuthContext.jsx";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import FileUpload from "./FileUpload";

const learnerSchema = yup.object().shape({
  fullName: yup.string().required("Full Name is required"),
  fathersName: yup.string().required("Father's Name is required"),
  mobileNumber: yup
    .string()
    .required("Mobile Number is required")
    .matches(/^\d{10}$/, "Mobile Number must be 10 digits"),
  dateOfBirth: yup.string().required("Date of Birth is required"),
  gender: yup.string().required("Gender is required"),
  bloodGroup: yup.string().required("Blood Group is required"),
  address: yup.string().required("Address is required"),
  licenseNumber: yup.string().required("License number is required"),
  llrNumber: yup.string().required("LLR number is required"),
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),
  
});


  //  <div className="grid py-10 grid-row-1 md:grid-row-2 gap-y-10" >
  //                   {renderTextarea("address", "Address")}
          
  //         </div>

const inputClass = (hasError) =>
  `block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-400 focus:outline-none focus:ring-0 focus:border-blue-500 peer ${
    hasError ? "border-red-500" : "border-gray-300"
  }`;

const labelClass =
  "absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-500 peer-focus:dark:text-blue-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1";

const NewRegistration = () => {
  const navigate = useNavigate();
  const { user, clearAuthState } = useRole();
  const [toastOpen, setToastOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({ resolver: yupResolver(learnerSchema) });

  const onSubmit = async (data) => {
    const formData = new FormData();
    for (const key in data) {
      if (data[key]) {
        formData.append(key, data[key]);
      }
    }
    formData.append("role", "Learner");

    try {
      setLoading(true);
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
        error.response &&
        (error.response.status === 401 ||
          error.response.data.message ===
            "Credential Invalid or Expired Please Login Again")
      ) {
        return setTimeout(() => {
          clearAuthState();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 font-semibold sm:text-3xl md:text-2xl">
        Learner Registration
      </h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 gap-y-10">
          <div className="relative w-full">
            <input
              type="text"
              id="fullName"
              {...register("fullName")}
              className={inputClass(errors.fullName)}
              placeholder=" "
            />
            <label htmlFor="fullName" className={labelClass}>Full Name</label>
            {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>}
          </div>

          <div className="relative w-full">
            <input
              type="text"
              id="fathersName"
              {...register("fathersName")}
              className={inputClass(errors.fathersName)}
              placeholder=" "
            />
            <label htmlFor="fathersName" className={labelClass}>Father's Name</label>
            {errors.fathersName && <p className="mt-1 text-sm text-red-500">{errors.fathersName.message}</p>}
          </div>

          <div className="relative w-full">
            <input
              type="text"
              id="mobileNumber"
              maxLength={10}
              {...register("mobileNumber")}
              className={inputClass(errors.mobileNumber)}
              placeholder=" "
            />
            <label htmlFor="mobileNumber" className={labelClass}>Mobile Number</label>
            {errors.mobileNumber && <p className="mt-1 text-sm text-red-500">{errors.mobileNumber.message}</p>}
          </div>

          <div className="relative w-full">
            <input
              type="date"
              id="dateOfBirth"
              {...register("dateOfBirth")}
              className={inputClass(errors.dateOfBirth)}
              placeholder=" "
            />
            <label htmlFor="dateOfBirth" className={labelClass}>Date of Birth</label>
            {errors.dateOfBirth && <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth.message}</p>}
          </div>

          <div className="relative w-full">
            <select
              id="gender"
              {...register("gender")}
              className={inputClass(errors.gender)}
            >
              <option value="" disabled hidden>Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <label htmlFor="gender" className={labelClass}>Gender</label>
            {errors.gender && <p className="mt-1 text-sm text-red-500">{errors.gender.message}</p>}
          </div>

          <div className="relative w-full">
            <select
              id="bloodGroup"
              {...register("bloodGroup")}
              className={inputClass(errors.bloodGroup)}
            >
              <option value="" disabled hidden>Select Blood Group</option>
              {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((group) => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
            <label htmlFor="bloodGroup" className={labelClass}>Blood Group</label>
            {errors.bloodGroup && <p className="mt-1 text-sm text-red-500">{errors.bloodGroup.message}</p>}
          </div>

          <div className="relative md:col-span-2">
            <textarea
              {...register("address")}
              placeholder=" "
              className={`h-24 ${inputClass(errors.address)}`}
            />
            <label htmlFor="address" className={labelClass}>Address</label>
            {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
          </div>

          <div className="relative w-full">
            <input
              type="text"
              id="licenseNumber"
              {...register("licenseNumber")}
              className={inputClass(errors.licenseNumber)}
              placeholder=" "
            />
            <label htmlFor="licenseNumber" className={labelClass}>License Number</label>
            {errors.licenseNumber && <p className="mt-1 text-sm text-red-500">{errors.licenseNumber.message}</p>}
          </div>

          <div className="relative w-full">
            <input
              type="text"
              id="llrNumber"
              {...register("llrNumber")}
              className={inputClass(errors.llrNumber)}
              placeholder=" "
            />
            <label htmlFor="llrNumber" className={labelClass}>LLR Number</label>
            {errors.llrNumber && <p className="mt-1 text-sm text-red-500">{errors.llrNumber.message}</p>}
          </div>

          <div className="relative w-full">
            <input
              type="text"
              id="username"
              {...register("username")}
              className={inputClass(errors.username)}
              placeholder=" "
            />
            <label htmlFor="username" className={labelClass}>Username</label>
            {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>}
          </div>

          <div className="relative w-full">
            <input
              type="text"
              id="password"
              {...register("password")}
              className={inputClass(errors.password)}
              placeholder=" "
            />
            <label htmlFor="password" className={labelClass}>Password</label>
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mt-8 md:grid-cols-2 gap-y-10">
          {["photo", "signature", "aadharCard", "educationCertificate", "passport", "notary"].map((field) => (
            <Controller
              key={field}
              name={field}
              control={control}
              defaultValue={null}
              render={({ field: { value, onChange } }) => (
                <FileUpload
                  fieldName={field}
                  file={value}
                  onChange={onChange}
                />
              )}
            />
          ))}
        </div>

        <div className="flex flex-col mt-6 space-y-4 md:flex-row md:justify-end md:space-y-0 md:space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-800"
          >
            Back
          </button>
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
