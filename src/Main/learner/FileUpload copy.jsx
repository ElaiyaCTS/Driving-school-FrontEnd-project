import { useEffect, useState } from "react";

const FileUpload = ({ fieldName, file, onChange }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    if (typeof file === "string") {
      setPreviewUrl(file);
    } else {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [file]);

  // const handleFileChange = (e) => {
  //   const selectedFile = e.target.files[0];
  //   if (selectedFile) {
  //     onChange(selectedFile);
  //   }
  // };

  const handleFileChange = (e) => {
  const selectedFile = e.target.files[0];

  if (selectedFile) {
    //  Restrict photo field to only image types
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
      <label
        htmlFor={fieldName}
        className="flex flex-col items-center justify-center w-full overflow-hidden border-2 border-gray-300 border-dashed rounded-lg cursor-pointer h-36"
      >
        {file ? (
          isPDF ? (
            <embed
              src={previewUrl}
              type="application/pdf"
              className="w-full h-full"
            />
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

      {file && (
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm truncate">{file.name || "Selected file"}</p>
          <button
            type="button"
            onClick={handleRemove}
            className="text-sm text-red-500"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
