"use client";
import { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import "./SustainableCoach.css";

const validationSchema = Yup.object({
  image: Yup.mixed()
    .required("Please select an image")
    .test(
      "fileFormat",
      "Only image files are allowed",
      (value) => value && value.type.startsWith("image/")
    ),
});

const SustainableCoach = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const analyzeImage = async (file) => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setPrediction(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setPrediction(result);
    } catch (err) {
      setError(`Failed to analyze image: ${err.message}`);
      console.error("API call failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="customContainer">
      <h1>Sustainable Coach</h1>
      <p>Upload an image to analyze its sustainability factors</p>

      <div className="uploadSection">
        <Formik
          initialValues={{ image: null }}
          validationSchema={validationSchema}
          onSubmit={() => {}}
        >
          {({ setFieldValue, errors, touched }) => (
            <Form>
              <div className="file-input-container">
                <input
                  id="image"
                  name="image"
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFieldValue("image", file);
                      setImagePreview(URL.createObjectURL(file));
                      analyzeImage(file);
                    }
                  }}
                  className="file-input"
                />
                {prediction && !isLoading ? (
                  <button
                    type="button"
                    onClick={() => document.getElementById("image").click()}
                    className="upload-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Select Image"}
                  </button>
                ) : (
                  <img
                    src="/assets/images/fileUpload.png"
                    alt="Upload Icon"
                    onClick={() => document.getElementById("image").click()}
                    className="imageUploadIcon"
                  />
                )}

                {errors.image && touched.image && (
                  <div className="error-message">{errors.image}</div>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </div>

      <div className="trashBinsCnt">
        <div className="trashBin redBin active">
          <object type="image/svg+xml" data="/assets/svg/redBin.svg" />
        </div>
        <div className="trashBin greyBin">
          <object type="image/svg+xml" data="/assets/svg/greyBin.svg" />
        </div>
        <div className="trashBin blueBin">
          <object type="image/svg+xml" data="/assets/svg/blueBin.svg" />
        </div>
        <div className="trashBin whiteBin">
          <object type="image/svg+xml" data="/assets/svg/whiteBin.svg" />
        </div>
      </div>

      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Analyzing your image...</p>
        </div>
      )}

      {imagePreview && !isLoading && (
        <div className="image-preview">
          <img src={imagePreview} alt="Preview" />
        </div>
      )}

      {error && !isLoading && <div className="error-message">{error}</div>}

      {prediction && !isLoading && (
        <div className="prediction-results">
          <h2>Analysis Results</h2>
          <pre>{JSON.stringify(prediction, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default SustainableCoach;
