import { Routes, Route } from "react-router-dom";
import Layout from "../components/layout";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/*" element={<Layout />} />
    </Routes>
  );
}
