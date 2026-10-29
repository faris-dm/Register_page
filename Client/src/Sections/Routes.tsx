import MainSection from "./MainSections";
import NotFound from "./404";

import { ProtectedRoute, PublicRoute } from "../Middle/Check";
import ProfilePage from "./Profile";
// import Forget from "./Forget";
import EmailVerification from "./Otp";
import EmailPasswordChange from "./EnterEmail";
import { Routes, Route } from "react-router-dom";
import NewPassword from "./NewPassword";
import PassOtp from "./PassOtp";

function AppRoute() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <MainSection />
          </PublicRoute>
        }
      ></Route>
      <Route
        path="/api/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      ></Route>

      <Route path="/passOtp" element={<PassOtp />} />

      {/*  input otp for reset password */}
      {/*  for password */}

      <Route path="/enter_email" element={<EmailPasswordChange />} />
      {/* this used to send email to reset ur password */}

      {/* <Route path="/reset" element={<Forget />}></Route> */}
      {/* send email toreset ur password */}

      <Route path="/newPassword" element={<NewPassword />}></Route>

      {/* enter new password */}

      {/* to  verify ur account email */}

      <Route path="/email" element={<EmailVerification />}></Route>

      <Route path="*" element={<NotFound />}></Route>
    </Routes>
  );
}

export default AppRoute;
