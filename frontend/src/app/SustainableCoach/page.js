"use client";
import { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

// Define validation schema
const validationSchema = Yup.object({
  image: Yup.mixed()
    .required('Please select an image')
    .test(
      'fileFormat',
      'Only image files are allowed',
      (value) => value && value.type.startsWith('image/')
    )
});

const SustainableCoach = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (values, { setSubmitting }) => {
    setError(null);

    const formData = new FormData();
    formData.append('file', values.image);

    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
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
      setSubmitting(false);
    }
  };

  return (
    <div className="customContainer">
      <h1>Sustainable Coach</h1>
      <p>Upload an image to analyze its sustainability factors</p>

      <div className="upload-section">
        <Formik
          initialValues={{ image: null }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, setFieldValue, errors, touched, values }) => (
            <Form>
              <div className="file-input-container">
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFieldValue('image', file);
                      setImagePreview(URL.createObjectURL(file));
                      setPrediction(null);
                    }
                  }}
                  className="file-input"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('image').click()}
                  className="upload-btn"
                >
                  Select Image
                </button>
                {errors.image && touched.image && (
                  <div className="error-message">{errors.image}</div>
                )}
              </div>
              
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
              
              <button
                type="submit"
                disabled={!values.image || isSubmitting}
                className="analyze-btn"
              >
                {isSubmitting ? 'Analyzing...' : 'Analyze Image'}
              </button>
            </Form>
          )}
        </Formik>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {prediction && (
        <div className="prediction-results">
          <h2>Analysis Results</h2>
          <pre>{JSON.stringify(prediction, null, 2)}</pre>
        </div>
      )}

      <style jsx>{`
        .upload-section {
          margin-top: 2rem;
          padding: 2rem;
          background: #f9f9f9;
          border-radius: 8px;
        }
        .file-input {
          display: none;
        }
        .upload-btn, .analyze-btn {
          padding: 10px 20px;
          background: #25CD25;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-right: 10px;
        }
        .analyze-btn:disabled {
          background: #cccccc;
          cursor: not-allowed;
        }
        .image-preview {
          margin: 20px 0;
          max-width: 500px;
        }
        .image-preview img {
          max-width: 100%;
          border-radius: 4px;
        }
        .error-message {
          color: red;
          margin-top: 0.5rem;
        }
        .prediction-results {
          margin-top: 2rem;
          padding: 1rem;
          background: #f0f8f0;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default SustainableCoach;
