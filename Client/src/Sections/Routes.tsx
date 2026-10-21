import MainSection from "./MainSections";
import ProfilePage from "./Profile";
import Forget from "./Forget";

import { Routes, Route } from "react-router-dom";
import NewPassword from "./NewPassword"




function AppRoute() {
  return (
    <Routes>
      <Route path="/" element={<MainSection />}></Route>
      <Route path="/api/profile" element={<ProfilePage />}></Route>

      <Route path="/reset" element={<Forget />}></Route>
  <Route path="/newPassword" element={<NewPassword />}></Route>

    </Routes>

   

  );
}

export default AppRoute;
