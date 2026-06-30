import { Routes, Route } from "react-router-dom";
import Landing from "@/pages/Landing";
import Upload from "@/pages/Upload";
import TrustReplay from "@/pages/TrustReplay";
import Review from "@/pages/Review";
import Summary from "@/pages/Summary";
import Verification from "@/pages/Verification";
import TrustPassportPage from "@/pages/TrustPassportPage";
import ExportPage from "@/pages/ExportPage";
import NavBar from "@/components/NavBar";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/replay" element={<TrustReplay />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/review" element={<Review />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/passport" element={<TrustPassportPage />} />
          <Route path="/export" element={<ExportPage />} />
        </Routes>
      </main>
    </div>
  );
}
