import React from "react";
import { Navigate } from "react-router-dom";
import Loading from "../Sections/Loading";
import useAuth from "../Sections/AuthContext";

type ProtectedRouteProps = {
  children: React.JSX.Element;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, checking } = useAuth();
  if (checking) {
    return (
      <div>
        <p>Loading.....</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

type PublicRouteProps = {
  children: React.JSX.Element;
};

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, checking } = useAuth();

  // While checking the user's authentication state, show a loading indicator
  if (checking) {
    return <div>Loading....</div>;
  }

  // If the user is logged in, redirect to the profile page
  if (user) {
    return <Navigate to="/api/profile" replace />;
  }

  // If the user is not logged in, render the public page
  return children;
};
