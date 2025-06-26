import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { URL as BURL } from "../../App";
import axios from "axios";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../Components/AuthContext/AuthContext";

const InsEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { clearAuthState } = useRole();

  const [newInstructor, setNewInstructor] = useState({
    fullName: "",
    fathersName: "",
    mobileNumber: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    address: "",
    username: "",
    password: "",
    photo: null,
  });

  const [loading, setLoading] = useState(true);
    const [dataloading, setDataLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [error, setError] = useState(null);

  const formatDate = (isoDate) => (isoDate ? isoDate.split("T")[0] : "");

  const handleTokenError = (error) => {
    if (
      error?.response &&
      (error.response.status === 401 || error.response.data.message === "Credential Invalid or Expired Please Login Again")
    ) {
      setTimeout(() => {
        clearAuthState();
        // navigate("/");
      }, 2000);
    }
  };

  const fetchInstructor = async () => {
    try {
      const response = await axios.get(`${BURL}/api/user/instructor/${id}`, {
        withCredentials: true,
      });

      const instructor = response.data;
      if (instructor) {
        setNewInstructor({
          fullName: instructor.fullName || "",
          fathersName: instructor.fathersName || "",
          mobileNumber: instructor.mobileNumber || "",
          dateOfBirth: formatDate(instructor.dateOfBirth),
          gender: instructor.gender || "",
          bloodGroup: instructor.bloodGroup || "",
          address: instructor.address || "",
          username: instructor.userId?.username || "",
          password: instructor.userId?.password || "",
          photo: instructor.photo || null,
        });

        if (instructor.photo) {
          const driveId = extractDriveFileId(instructor.photo);
          const imageUrl = driveId
            ? `${BURL}/api/image-proxy/${driveId}`
            : `${instructor.photo}?t=${Date.now()}`;
          setSelectedFile(imageUrl);
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
      handleTokenError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructor();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInstructor((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(newInstructor).forEach((key) => {
      if (key !== "photo") {
        formData.append(key, newInstructor[key]);
      }
    });

    if (selectedFile instanceof File) {
      formData.append("photo", selectedFile);
    }

    try {
      setDataLoading(true)
      await axios.put(`${BURL}/api/user/instructor/${id}`, formData, {
        withCredentials: true,
      });

      setToastOpen(true);
      setTimeout(() => {
      setDataLoading(false)
        setToastOpen(false);
        navigate("/admin/instructor/list");
      }, 2000);

      fetchInstructor();
    } catch (err) {
      if (err.name !== "AbortError") {
        handleTokenError(err);
      }
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file instanceof File) {
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  if (loading) return <p className="py-5 text-lg font-semibold text-center text-blue-600">Loading....</p>;
 return (
    <div className="p-6">
      <h3 className="text-xl font-bold mb-6">Update Instructor Details</h3>

      <form onSubmit={handleUpdateSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-10">
          <div className="relative">
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder=" "
              value={newInstructor.fullName}
              onChange={handleInputChange}
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
              value={newInstructor.fathersName}
              onChange={handleInputChange}
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
              value={newInstructor.mobileNumber}
              onChange={handleInputChange}
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
              className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 bg-white px-2 peer-placeholder-shown:top-1/2"
            >
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={newInstructor.dateOfBirth}
              onFocus={(event) => (event.nativeEvent.target.defaultValue = "")}
              onChange={handleInputChange}
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer"
            />
          </div>
          <div className="relative">
            <label
              htmlFor="gender"
              className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 bg-white px-2 peer-placeholder-shown:top-1/2"
            >
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={newInstructor.gender}
              onChange={handleInputChange}
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
              className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 bg-white px-2 peer-placeholder-shown:top-1/2"
            >
              Blood Group
            </label>
            <select
              id="bloodGroup"
              name="bloodGroup"
              value={newInstructor.bloodGroup}
              onChange={handleInputChange}
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

          <div className="relative mt-6">
            <textarea
              id="address"
              name="address"
              placeholder=" "
              value={newInstructor.address}
              onChange={handleInputChange}
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-500 peer h-40 resize-none"
            ></textarea>
            <label
              htmlFor="address"
              className="absolute text-sm text-gray-500 dark:text-blue-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white dark:bg-gray-900 px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-2"
            >
              Address
            </label>
          </div>
          <div className="flex flex-col w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Photo
            </label>

            <label
              htmlFor="dropzone-file"
              className={`flex items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer
      ${selectedFile ? "" : "bg-gray-50 dark:bg-gray-700"}
      dark:border-gray-600 relative overflow-hidden`}
            >
              {selectedFile ? (
                <img
                  src={
                    typeof selectedFile === "string"
                      ? selectedFile
                      : URL.createObjectURL(selectedFile)
                  }
                  alt="Instructor"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <span className="text-gray-400 dark:text-gray-300 text-sm">
                  Click to upload or drag an image
                </span>
              )}

              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                key={selectedFile?.name || selectedFile}
              />
            </label>

            {selectedFile && (
              <div className="mt-2 flex justify-between items-center">
                <p className="text-sm text-gray-800 dark:text-gray-200 truncate max-w-[80%]">
                  {selectedFile instanceof File ? selectedFile.name : ""}
                </p>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-6">Login Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-10">
            <div className="relative mb-4">
              <input
                type="text"
                id="username"
                name="username"
                placeholder=" "
                value={newInstructor.username}
                onChange={handleInputChange}
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
                value={newInstructor.password}
                onChange={handleInputChange}
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
  onClick={() => navigate(-1)}
  disabled={dataloading}
  className={`bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800 
    ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
>
  Back
</button>
   {dataloading? (<button disabled type="button" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-800">
<svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
</svg>Update...</button>
):( <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-800"
          >
            Update
          </button>)}
         
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
          <div className="ms-3 text-sm font-normal">Updated successfully</div>
        </div>
      )}
    </div>
  );
};

export default InsEdit;
