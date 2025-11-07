import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function About() {
  const navigate = useNavigate();
  
  // Feedback form state
  const [feedbackType, setFeedbackType] = useState("General Feedback");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitStatus, setSubmitStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("📤 Sending...");

    try {
      const response = await fetch(import.meta.env.VITE_FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name,
          email: email,
          feedbackType: feedbackType,
          message: message
        })
      });

      if (response.ok) {
        setSubmitStatus("✓ Thank you! Your feedback has been submitted successfully.");
        // Clear form
        setTimeout(() => {
          setName("");
          setEmail("");
          setMessage("");
          setFeedbackType("General Feedback");
          setSubmitStatus("");
          setIsSubmitting(false);
        }, 3000);
      } else {
        setSubmitStatus("❌ Failed to send feedback. Please try again or contact us via GitHub.");
        setIsSubmitting(false);
        setTimeout(() => setSubmitStatus(""), 5000);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitStatus("❌ Failed to send feedback. Please try again or contact us via GitHub.");
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus(""), 5000);
    }
  };
  
  return (
    <div>
      <Header/>

      <div className="text-white gap-4 p-6 flex flex-col">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          style={{
            width: "fit-content",
            padding: "10px 16px",
            marginBottom: "16px",
            background: "rgba(80, 227, 194, 0.1)",
            color: "#50e3c2",
            border: "2px solid #50e3c2",
            borderRadius: "8px",
            fontFamily: "monospace",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#50e3c2";
            e.currentTarget.style.color = "#181c24";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(80, 227, 194, 0.1)";
            e.currentTarget.style.color = "#50e3c2";
          }}
          title="Go back to Home"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Home
        </button>

        <p className="text-3xl"> What is JSON?</p>

        <p>JSON (JavaScript Object Notation) is a lightweight, text-based format for storing and exchanging data. 
          It is widely used in web development, APIs, and mobile apps because it is easy for both humans and machines to 
          read and write. JSON represents data using key-value pairs and supports structures like objects and arrays, making it 
          simple and flexible.
        </p>

        <p className="text-3xl">About JsonGlance</p>

        <p>JsonGlance is a free, secure tool for viewing and analyzing JSON data. It instantly highlights, validates, and formats JSON, offering a collapsible tree view and easy editing. Built for developers and analysts, JsonGlance simplifies debugging and browsing JSON.
          <span>
            <ul className="list-disc list-inside">Key Features:
              <li>Syntax highlighting, error detection</li>
              <li>Fast formatting (pretty/compact)</li>
              <li>Collapsible nodes for large files</li>
              <li>Secure—your data is never stored</li>
            </ul>
          </span>
        </p>


       <p>
          We welcome your feedback and contributions—help us improve JsonGlance for everyone!
          For documentation, support, or to share suggestions, reach us at{' '}
          <a href={import.meta.env.VITE_GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-500">
           GitHub
          </a>
          .
        </p>

        {/* Feedback Form Section */}
        <div style={{
          marginTop: "32px",
          padding: "24px",
          background: "rgba(35, 38, 56, 0.8)",
          borderRadius: "12px",
          border: "2px solid #50e3c2"
        }}>
          <p className="text-3xl mb-4">Send Us Your Feedback</p>
          <p className="mb-6 text-gray-300">
            Help us improve JsonGlance! Share your thoughts, report bugs, or request new features.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Feedback Type */}
            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "#50e3c2", fontWeight: "bold", fontSize: "14px" }}>
                Type
              </label>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#181c24",
                  color: "#fff",
                  border: "1px solid #50e3c2",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: "monospace",
                  cursor: "pointer"
                }}
              >
                <option value="General Feedback">General Feedback</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Question">Question</option>
              </select>
            </div>

            {/* Name */}
            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "#50e3c2", fontWeight: "bold", fontSize: "14px" }}>
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#181c24",
                  color: "#fff",
                  border: "1px solid #50e3c2",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: "monospace"
                }}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "#50e3c2", fontWeight: "bold", fontSize: "14px" }}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#181c24",
                  color: "#fff",
                  border: "1px solid #50e3c2",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: "monospace"
                }}
                required
              />
            </div>

            {/* Message */}
            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "#50e3c2", fontWeight: "bold", fontSize: "14px" }}>
                Message *
              </label>
              <textarea
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you think, what features you'd like to see, or any issues you've encountered..."
                rows={6}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#181c24",
                  color: "#fff",
                  border: "1px solid #50e3c2",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontFamily: "monospace",
                  resize: "vertical"
                }}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "12px 24px",
                background: isSubmitting ? "#888" : "#50e3c2",
                color: "#181c24",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "bold",
                fontFamily: "monospace",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                width: "fit-content",
                opacity: isSubmitting ? 0.6 : 1
              }}
              onMouseOver={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = "#80ffea";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseOut={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = "#50e3c2";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {isSubmitting ? "Sending..." : "Submit Feedback"}
            </button>

            {/* Status Message */}
            {submitStatus && (
              <div style={{
                padding: "12px 16px",
                background: submitStatus.includes("✓") ? "rgba(80, 227, 194, 0.2)" : "rgba(255, 107, 157, 0.2)",
                border: `1px solid ${submitStatus.includes("✓") ? "#50e3c2" : "#ff6b9d"}`,
                borderRadius: "6px",
                color: submitStatus.includes("✓") ? "#50e3c2" : "#ff6b9d",
                fontFamily: "monospace",
                fontSize: "14px"
              }}>
                {submitStatus}
              </div>
            )}
          </form>
        </div>

      </div>
    </div>
  );
}