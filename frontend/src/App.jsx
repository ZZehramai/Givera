import "./App.css"
import { Routes, Route } from 'react-router-dom';
import { LandingPage } from "./pages/LandingPage";
import Profile from "./pages/Profile";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";

function App() {
  return (
    <>    
      <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
}

export default App;
