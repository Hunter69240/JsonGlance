import React,{useState} from "react";
import Header from "../components/Header";

export default function Home() {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");

  const handleVisualize = () => {
    if (!jsonInput.trim()) {
      setError("JSON input cannot be empty");
      return;
    }

    try {
      const parsedJSON = JSON.parse(jsonInput);
      setError("");
      console.log("Valid JSON:", parsedJSON);
      // Handle visualization here
    } catch (e) {
      setError("Invalid JSON format");
    }
  };
  
  return (
    <div>
      <Header/>
      {error && <p className="text-red-500 mb-4 pl-6">{error}</p>}
      <div className="flex justify-between gap-6 p-6">
        
        <div className="flex-1">
          <textarea 
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}  
            placeholder="Paste Your JSON Here" 
            className="text-white bg-[#413E3E] w-full h-100 p-4 rounded placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        
        <div className="flex items-center">
          
          <button className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600" onClick={handleVisualize}>
            Visualize →
          </button>
        </div>
      </div>
    </div>
  );
}
