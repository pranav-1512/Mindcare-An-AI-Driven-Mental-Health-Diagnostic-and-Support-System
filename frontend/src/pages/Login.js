import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext"; // Import useAuth hook

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // Get login function from context
  // const [user,setUser] = useState(null)

  let token;


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("http://localhost:5001/api/auth/login", { email, password });
      login(data.token); // Set login state
      // token = localStorage.getItem("token")
      // fetchUser()
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  // const fetchUser = async () => {
  //   try {
  //     const { data } = await axios.get("http://localhost:5001/api/auth/profile", {
  //       headers: { Authorization: token },
  //     });
  //     console.log('fetch',data)
  //     localStorage.setItem('name',data.name)
  //     console.log('local',localStorage.getItem("name"))
  //     setUser(data.name);
  //   } catch (error) {
  //     console.error("Error fetching user:", error);
  //   }
  // };

  return (
    <div className="container mt-5">
      <div className="col-md-6 mx-auto card p-4 shadow-lg">
        <h2 className="text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary w-100">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
