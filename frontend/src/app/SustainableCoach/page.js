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
      <div className="susCoachTop">
        <h1>Sustainable Coach</h1>
        <p>Upload an image to analyze its sustainability factors</p>
      </div>

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
                    className="uploadBtn"
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Upload a new image"}
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
        <div
          className={`trashBin redBin ${
            prediction?.mapped_biomedical_category === "Red" ? "active" : ""
          }`}
        >
          <object type="image/svg+xml" data="/assets/svg/redBin.svg" />
        </div>
        <div
          className={`trashBin greyBin ${
            prediction?.mapped_biomedical_category === "Grey" ? "active" : ""
          }`}
        >
          <object type="image/svg+xml" data="/assets/svg/greyBin.svg" />
        </div>
        <div
          className={`trashBin blueBin ${
            prediction?.mapped_biomedical_category === "Blue" ? "active" : ""
          }`}
        >
          <object type="image/svg+xml" data="/assets/svg/blueBin.svg" />
        </div>
        <div
          className={`trashBin whiteBin ${
            prediction?.mapped_biomedical_category === "White" ? "active" : ""
          }`}
        >
          <object type="image/svg+xml" data="/assets/svg/whiteBin.svg" />
        </div>
      </div>

      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Analyzing your image...</p>
        </div>
      )}

      {error && !isLoading && <div className="error-message">{error}</div>}

      {prediction && !isLoading && (
        <div className="predictionResults">
          <h3>This is a {prediction?.prediction}</h3>
          <h4>
            It should go into a{" "}
            <span style={{ color: prediction?.mapped_biomedical_category === 'White' ? "inherit" : prediction?.mapped_biomedical_category }}>
              {prediction?.mapped_biomedical_category}
            </span>
            coloured trash bin.
          </h4>

          <div className="predictionInfo">
            <div className="predictionDetails">
              {prediction?.mapped_biomedical_category === "Red" ? (
                <div>
                  <div>
                    <h4>Purpose</h4>
                    <p>
                      Collect infectious materials (blood-soaked items, bodily
                      fluids, contaminated PPE).
                    </p>
                  </div>

                  <div>
                    <h4>Handling</h4>
                    <ul>
                      <li>
                        Segregate at point of generation using color-coded bins.
                      </li>
                      <li>
                        Use puncture-resistant, leak-proof containers labeled
                        with biohazard symbols.
                      </li>
                      <li>
                        Sharps (needles, scalpels) must go into separate
                        puncture-proof containers first.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4>Disposal</h4>
                    <p>
                      Autoclaved (steam-sterilized) or incinerated to neutralize
                      pathogens.
                    </p>
                  </div>

                  <div>
                    <h4>Recycled or Not</h4>
                    <p>
                      Not recycled. Single-use red bags are incinerated or
                      landfilled after treatment.
                    </p>
                  </div>

                  <div>
                    <h4>Don'ts</h4>
                    <ul>
                      <li>
                        Mix with regular trash, radioactive waste, or loose
                        sharps.
                      </li>
                      <li>
                        Overfill containers or dispose of animal/human body
                        parts in red bags.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4>Environmental Impact</h4>
                    <p>
                      Proper segregation reduces contamination risks and
                      landfill burden. Incineration releases CO₂ but ensures
                      pathogen destruction.
                    </p>
                  </div>
                </div>
              ) : prediction?.mapped_biomedical_category === "Grey" ? (
                <div>
                  <div>
                    <h4>Purpose</h4>
                    <p>
                      Bulk chemotherapy waste (greater than 3% residual drugs),
                      hazardous pharmaceuticals (e.g., nicotine), and
                      contaminated PPE.
                    </p>
                  </div>

                  <div>
                    <h4>Handling</h4>
                    <ul>
                      <li>
                        Segregate from trace chemo waste (yellow bins) to avoid
                        penalties.
                      </li>
                      <li>
                        Use DOT-approved containers labeled for hazardous waste.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4>Disposal</h4>
                    <p>High-temperature incineration or encapsulation.</p>
                  </div>

                  <div>
                    <h4>Recycled or Not</h4>
                    <p>
                      Not recycled. Containers are disposable and incinerated.
                    </p>
                  </div>

                  <div>
                    <h4>Don'ts</h4>
                    <ul>
                      <li>
                        Never mix with trace chemo waste (yellow bins) or
                        general trash.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4>Environmental Impact</h4>
                    <p>
                      Incineration releases toxins and CO₂ but prevents
                      groundwater contamination. Overclassification increases
                      costs and emissions.
                    </p>
                  </div>
                </div>
              ) : prediction?.mapped_biomedical_category === "White" ? (
                <div>
                  <div>
                    <h4>Purpose</h4>
                    <p>
                      Dedicated to needles, syringes, lancets, and broken glass
                      to prevent injuries.
                    </p>
                  </div>

                  <div>
                    <h4>Handling</h4>
                    <ul>
                      <li>
                        Use puncture-proof, leak-resistant containers with
                        tight-fitting lids.
                      </li>
                      <li>Reusable containers reduce plastic waste.</li>
                    </ul>
                  </div>

                  <div>
                    <h4>Disposal</h4>
                    <p>Autoclaved or incinerated when ¾ full.</p>
                  </div>

                  <div>
                    <h4>Recycled or Not</h4>
                    <p>
                      <strong>Yes:</strong> Some programs clean and reuse
                      containers. Single-use containers are incinerated.
                    </p>
                  </div>

                  <div>
                    <h4>Don'ts</h4>
                    <ul>
                      <li>
                        Do not mix with other waste streams (e.g., chemotherapy
                        sharps).
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4>Environmental Impact</h4>
                    <p>
                      Reusable programs reduce plastic waste by 90% and lower
                      CO₂ emissions.
                    </p>
                  </div>
                </div>
              ) : prediction?.mapped_biomedical_category === "Blue" ? (
                <div>
                  <div>
                    <h4>Purpose</h4>
                    <p>
                      Non-hazardous medications (expired pills, empty vials) and
                      some hazardous drugs (e.g., antibiotics).
                    </p>
                  </div>

                  <div>
                    <h4>Handling</h4>
                    <ul>
                      <li>
                        Segregate from controlled substances (e.g., narcotics).
                      </li>
                      <li>Use containers labeled “non-hazardous”.</li>
                    </ul>
                  </div>

                  <div>
                    <h4>Disposal</h4>
                    <p>Incinerated or autoclaved.</p>
                  </div>

                  <div>
                    <h4>Recycled or Not</h4>
                    <p>
                      Glassware in blue bins may be recycled; pharmaceuticals
                      are not.
                    </p>
                  </div>

                  <div>
                    <h4>Don'ts</h4>
                    <ul>
                      <li>
                        Avoid placing hazardous P/U-listed drugs (e.g.,
                        warfarin) or loose sharps.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4>Environmental Impact</h4>
                    <p>
                      Prevents drug leaching into water systems. Improper
                      disposal risks antibiotic resistance and ecosystem harm.
                    </p>
                  </div>

                  <div>
                    <h4>Key Compliance Note</h4>
                    <p>
                      Misclassifying waste increases disposal costs by 3-10x and
                      environmental harm. Always follow EPA, OSHA, and state
                      guidelines.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {imagePreview && !isLoading && (
              <div className="predictionImage">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SustainableCoach;
