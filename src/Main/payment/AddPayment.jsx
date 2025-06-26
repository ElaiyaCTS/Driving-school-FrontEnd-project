import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { URL } from "../../App";
import axios from "axios";
import { extractDriveFileId } from "../../Components/ImageProxyRouterFunction/funtion.js";
import { useRole } from "../../Components/AuthContext/AuthContext";

const AddPayment = () => {
      const {role, user,setUser,setRole,clearAuthState} =  useRole();

  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [learners, setLearners] = useState([]);
  const [selectedLearner, setSelectedLearner] = useState("");
  // const [isLearnerOpen, setIsLearnerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [amount, setAmount] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [dataloading, setDataLoading] = useState(false);

  useEffect(() => {
    const fetchLearners = async () => {
      try {
       
        const response = await axios.get(`${URL}/api/user/learners`, {
        withCredentials: true,
        });

       console.log(response.data);
       
       return setLearners(response.data.learners);
      } catch (error) {
        console.error("Error fetching learners:", error.message);
      }
    };

    fetchLearners();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!selectedLearner)
      newErrors.selectedLearner = "Please select a learner.";
    if (!paymentMethod)
      newErrors.paymentMethod = "Please select a payment method.";
    if (!paymentDate)
      newErrors.paymentDate = "Please select a valid payment date.";
    if (!amount || amount <= 0)
      newErrors.amount = "Please enter a valid amount.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const paymentData = {
      learnerId: learners.find(
        (learner) => learner.fullName === selectedLearner
      )?._id,
      paymentMethod,
      date: paymentDate,
      amount,
    };

    try {
              setDataLoading(true)

      await axios.post(`${URL}/api/payments`, paymentData, {
        withCredentials: true,
      });

      setToastOpen(true);

      setTimeout(() => {
                setDataLoading(false)

        setToastOpen(false);
        navigate(-1);
      }, 2000);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error fetching data:", error);
        if (
          error.response &&
          (error.response.status === 401 ||
            error.response.data.message === "Credential Invalid or Expired Please Login Again")
        ) {
          return setTimeout(() => {
            clearAuthState();
            navigate("/");
          }, 2000);
        }
      }
    }
  };
  const handleSelection = (learner) => {
    setSelectedLearner(learner.fullName);
    setSearchTerm("");
    setIsOpen(false);
    setErrors((prevErrors) => ({ ...prevErrors, selectedLearner: "" }));
  };

  const filteredLearners = learners.filter((learner) =>
    learner.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLearnerDetails = learners.find(
    (learner) => learner.fullName === selectedLearner
  );

  return (
    <>
      <div className="p-4 sm:p-6">
        <h2 className="sm:text-3xl md:text-2xl font-semibold mb-4">
          Add Payment
        </h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="col-span-3 flex flex-col lg:flex-row gap-4 sm:gap-6">
            <div className="w-full lg:w-2/3 flex flex-col gap-4">
              <div className="relative w-full">
                <label
                  className={`absolute left-3 px-1 transition-all duration-200 bg-white 
      ${
        selectedLearner || isOpen
          ? "-top-2 text-xs text-blue-600"
          : "top-3 text-gray-500"
      }
    `}
                >
                  Select a Learner
                </label>

                <button
                  type="button"
                  onClick={() => setIsOpen((prev) => !prev)}
                  className="text-left border border-gray-300 text-gray-900 text-medium rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-3 pt-5 pb-2 h-12"
                >
                  {selectedLearner}
                </button>

                {isOpen && (
                  <div className="absolute top-full mt-2 w-full bg-white border border-gray-300 shadow-lg rounded-md overflow-hidden z-50">
                    <input
                      type="text"
                      placeholder="Search learner..."
                      className="w-full px-3 pt-5 pb-2 h-12 text-sm border-b border-gray-200"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="max-h-60 overflow-y-auto">
                      {filteredLearners.length > 0 ? (
                        filteredLearners.map((learner) => (
                          <button
                            key={learner._id}
                            type="button"
                            onClick={() => handleSelection(learner)}
                            className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100"
                          >
                            {learner.fullName}
                          </button>
                        ))
                      ) : (
                        <p className="p-4 text-gray-500">No results found</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {selectedLearnerDetails && (
                <div className="block lg:hidden w-full border p-4 rounded-md">
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={`${URL}/api/image-proxy/${extractDriveFileId(
                        selectedLearnerDetails.photo
                      )}`}
                      alt={selectedLearnerDetails.fullName}
                      className="w-14 h-14 rounded-full border"
                    />
                    <p className="text-sm font-semibold">
                      {selectedLearnerDetails.fullName}
                    </p>
                    <p className="text-sm text-gray-600">
                      ID: {selectedLearnerDetails.admissionNumber}
                    </p>
                  </div>
                </div>
              )}
              <div className="relative">
                <select
                  id="payment"
                  name="payment"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="peer w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
                >
                  <option value="" disabled hidden>
                    Payment Method
                  </option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                </select>
                <label
                  htmlFor="payment"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-500 start-1"
                >
                  Payment Method
                </label>
                {errors.paymentMethod && (
                  <p className="text-red-500">{errors.paymentMethod}</p>
                )}
              </div>

              <div className="relative w-full">
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  onFocus={(event) =>
                    (event.nativeEvent.target.defaultValue = "")
                  }
                  className="peer block w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-blue-500"
                  placeholder=" "
                />
                <label
                  htmlFor="date"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-500 start-1"
                >
                  Date
                </label>
                {errors.paymentDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.paymentDate}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  id="fee"
                  name="amount"
                  placeholder=" "
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="peer w-full px-2.5 pb-2.5 pt-4 text-sm text-gray-900 bg-transparent border border-gray-300 rounded-md focus:outline-none focus:ring-0 focus:border-blue-500"
                />
                <label
                  htmlFor="amount"
                  className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-600 start-1"
                >
                  Amount
                </label>
                {errors.amount && (
                  <p className="text-red-500">{errors.amount}</p>
                )}
              </div>
            </div>

            <div className="hidden lg:block w-full lg:w-1/4">
              {selectedLearnerDetails && (
                <div className="w-full border p-4 rounded-md">
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={`${URL}/api/image-proxy/${extractDriveFileId(
                        selectedLearnerDetails.photo
                      )}`}
                      alt={selectedLearnerDetails.fullName}
                      className="w-16 h-16 rounded-full border"
                    />
                    <p className="text-sm font-semibold">
                      {selectedLearnerDetails.fullName}
                    </p>
                    <p className="text-sm text-gray-600">
                      ID: {selectedLearnerDetails.admissionNumber}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
       
           <div className="flex flex-col md:flex-row md:justify-end space-y-4 md:space-y-0 md:space-x-4 mt-6">
        <button
  onClick={() => navigate(-1)}
  disabled={dataloading}
  className={`bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-800 
    ${dataloading ? "opacity-50 cursor-not-allowed" : ""}`}
>
  Back
</button>
   {dataloading? (<button disabled type="button" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-800">
<svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
</svg>Loading...</button>
):( <button
             onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-3 rounded-md"
          >
            Save
          </button>)}
         
        </div>
      </div>
      {toastOpen && (
        <div className="fixed top-20 right-5 flex items-center justify-center w-full max-w-xs p-4 text-white bg-blue-700 rounded-md shadow-md">
          <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-green-700 bg-green-100 rounded-md">
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
            </svg>
          </div>
          <div className="ml-3 text-sm font-normal">
            Payment added successfully
          </div>
        </div>
      )}
    </>
  );
};

export default AddPayment;
