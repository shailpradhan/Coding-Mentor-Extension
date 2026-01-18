import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "../components/layout";

const ChatInterface = lazy(() => import("../components/chat-interface"));
const SavedChats = lazy(() => import("../components/saved-chats"));

export default function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<ChatInterface />} />
          <Route path="/saved" element={<SavedChats />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
