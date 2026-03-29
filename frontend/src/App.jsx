import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";

function Dashboard() {
        return <h1>Dashboard Page</h1>;
    }
function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="auth" element={<Auth />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute> 
        }
      />
    </Routes>
    </BrowserRouter>
  );
}

export default App;