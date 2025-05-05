// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Navbar from "./components/Navbar";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import Dashboard from "./pages/Dashboard"
// import SelfAssessment from "./pages/SelfAssessment";
// import AssessmentResults from "./pages/AssessmentResults";
// import JournalEntries from "./pages/JournalEntries";
// import MoodJournal from "./pages/MoodJournal";
// import MoodProgressDashboard from "./pages/MoodProgressDashboard";
// import AnalysisComparison from "./pages/AnalysisComparision";
// import ResourcesPage from "./pages/ResourcesPage";
// import NearbyDoctorsPage from "./pages/NearbyDoctorsPage";
// import AssessmentHistory from "./pages/AssessmentHistory";
// import Chatbot from "./pages/Chatbot";

// function App() {
//   return (
//     <Router>
//       <Navbar />
//       <Routes>
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/" element={<Dashboard />} />
//         <Route path="/assessment" element={<SelfAssessment />} />
//         <Route path="/assessment-results" element={<AssessmentResults />} />
//         <Route path="/assessment-history" element={<AssessmentHistory />} />
//         <Route path="/journals" element={<JournalEntries />} />
//         <Route path="/journals/add" element={<MoodJournal/>} />
//         <Route path="/journals/progress" element={<MoodProgressDashboard/>} />
//         <Route path="/analysis" element={<AnalysisComparison/>} />
//         <Route path="/resources" element={<ResourcesPage/>} />
//         <Route path="/resources/nearby-doctors" element={<NearbyDoctorsPage/>} />

//         {/* <Route path="/self-assessment" element={<SelfAssessment />} /> */}
//       </Routes>
//       {localStorage.getItem("token")?
//       <Chatbot/>:
//       <></>
//       }
//     </Router>
//   );
// }

// export default App;


import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard"
import SelfAssessment from "./pages/SelfAssessment";
import AssessmentResults from "./pages/AssessmentResults";
import JournalEntries from "./pages/JournalEntries";
import MoodJournal from "./pages/MoodJournal";
import MoodProgressDashboard from "./pages/MoodProgressDashboard";
import AnalysisComparison from "./pages/AnalysisComparision";
import ResourcesPage from "./pages/ResourcesPage";
import NearbyDoctorsPage from "./pages/NearbyDoctorsPage";
import AssessmentHistory from "./pages/AssessmentHistory";
import Chatbot from "./pages/Chatbot";
import { AuthProvider, useAuth } from "./context/authContext";
import CrisisSupport from "./pages/CrisisSupport";
import Profile from "./pages/Profile";

// Create a wrapper component to use the auth context
const AppContent = () => {
  const { isLoggedIn } = useAuth();
  
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/assessment" element={<SelfAssessment />} />
        <Route path="/assessment-results" element={<AssessmentResults />} />
        <Route path="/assessment-history" element={<AssessmentHistory />} />
        <Route path="/journals" element={<JournalEntries />} />
        <Route path="/journals/add" element={<MoodJournal/>} />
        <Route path="/journals/progress" element={<MoodProgressDashboard/>} />
        <Route path="/crisis-support" element={<CrisisSupport />} />
        <Route path="/analysis" element={<AnalysisComparison/>} />
        <Route path="/resources" element={<ResourcesPage/>} />
        <Route path="/resources/nearby-doctors" element={<NearbyDoctorsPage/>} />
      </Routes>
      {isLoggedIn ? <Chatbot /> : null}
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;