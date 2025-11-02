import Home from "./screens/Home"
import About from "./screens/About"
import VisualizeScreen from "./screens/VisualizeScreen"
import { Route, Routes } from "react-router-dom"
import './index.css'


function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/visualize" element={<VisualizeScreen />} />
        
      </Routes>
    </div>
  )
}

export default App
