import Home from "./screens/Home"
import About from "./screens/About"
import { Route, Routes } from "react-router-dom"
import './index.css'


function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  )
}

export default App
