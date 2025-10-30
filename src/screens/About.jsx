import React from "react";
import Header from "../components/Header";
export default function About() {
  return (
    <div>
      <Header/>

      <div className="text-white gap-4 p-6 flex flex-col">
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
          <a href="https://github.com/Hunter69240" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-500">
           GitHub
          </a>
          .
        </p>


      </div>
    </div>
  );
}