// src/components/Router.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Register from "../pages/Register";
import Login from "../pages/Login";
import ProfilePage from "../pages/ProfilePage";
import PrivacyInfo from "../pages/PrivacyInfo";
import TermsAndConditions from "../pages/TermsandConditions";
import ProtectedRoute from "../components/ProtectedRoute";
import QuestionPapers from "./QuestionPapers";
import Books from "./Books";
import StudyMaterials from "./StudyMaterials";
import PublicProtectedRoute from "../components/PublicProtectedRoute";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={
        <PublicProtectedRoute>
          <Register />
        </PublicProtectedRoute>
      } />

      <Route
        path="/dashboard"
        element={
          <PublicProtectedRoute>
            <Dashboard />
          </PublicProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <PublicProtectedRoute>
            <Dashboard />
          </PublicProtectedRoute>
        }
      />

      <Route
        path="/question-papers"
        element={
          <PublicProtectedRoute>
            <QuestionPapers />
          </PublicProtectedRoute>
        }
      />
      

      <Route
        path="/user/:username"
        element={
          <PublicProtectedRoute>
            <ProfilePage />
          </PublicProtectedRoute>
        }
      />

      <Route
        path="/books"
        element={
          <PublicProtectedRoute>
            <Books />
          </PublicProtectedRoute>
        }
      />

      <Route
        path="/study-materials"
        element={
          <PublicProtectedRoute>
            <StudyMaterials />
          </PublicProtectedRoute>
        }
      />

      <Route path="/privacy-policy" element={<PrivacyInfo />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
    </Routes>
  );
};

export default AppRouter;
