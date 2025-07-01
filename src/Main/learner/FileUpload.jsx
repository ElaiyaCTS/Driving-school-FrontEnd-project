import { useEffect, useState } from "react";

const FileUpload = ({ fieldName, file, onChange }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use FileReader for mobile-safe previews
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    if (typeof file === "string") {
      setPreviewUrl(file);
    } else {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  }, [file]);



  useEffect(() => {
    
    return () => {
      
    };
  }, );
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      if (fieldName === "photo" && !selectedFile.type.startsWith("image/")) {
        alert("Only image files (JPG, PNG, etc.) are allowed for photo");
        return;
      }
      onChange(selectedFile);
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  const isPDF = file && file.type === "application/pdf";

  return (
    <div className="mb-4">
      <label className="block mb-1 text-sm font-medium text-gray-700 capitalize">
        {fieldName}
      </label>

      {/* Upload Box */}
      <label
        htmlFor={fieldName}
        className="flex flex-col items-center justify-center w-full overflow-hidden border-2 border-gray-300 border-dashed rounded-lg cursor-pointer h-36"
      >
        {file ? (
          isPDF ? (
            <iframe src={previewUrl} type="application/pdf" className="w-full h-full overflow-ellipsis" allow="fullscreen"/>
          ) : (
            <img
              src={previewUrl}
              alt="Uploaded Preview"
              className="object-contain w-full h-full rounded-lg"
            />
          )
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-8 h-8 mb-4 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
              aria-hidden="true"
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
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              PDF, JPG, PNG, JPEG (Max ~5MB)
            </p>
          </div>
        )}
        <input
          id={fieldName}
          type="file"
          name={fieldName}
          accept="image/*,.pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      {/* Action Buttons */}
      {file && (
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm truncate">{file.name || "Selected file"}</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
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

      {/* Modal Preview */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-11/12 max-w-2xl p-6 bg-white rounded-lg shadow-xl">
            <button
              className="absolute text-red-600 right-1 top-2 hover:text-gray-700"
              onClick={() => setIsModalOpen(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#e02424"
                  fillRule="evenodd"
                  d="M18.645 5.291a1 1 0 0 1 .004 1.414L13.41 11.97l5.298 5.325a1 1 0 0 1-1.418 1.41L12 13.388l-5.291 5.317a1 1 0 0 1-1.418-1.41l5.298-5.325-5.238-5.265a1 1 0 0 1 1.418-1.41L12 10.552l5.231-5.257a1 1 0 0 1 1.414-.004Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div className="w-full h-[80vh] flex items-center justify-center">
              {isPDF ? (
                <iframe
                allow="fullscreen"
                  src={previewUrl}
                  title="PDF Preview"
                  // className="w-full h-full border rounded"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Image Preview"
                  className="object-contain max-w-full max-h-full"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
