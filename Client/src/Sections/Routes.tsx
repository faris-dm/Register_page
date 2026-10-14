import MainSection from "./MainSections"
import ProfilePage from "./Profile"
import { Routes,Route } from "react-router-dom";

 function  AppRoute() {
    return (
       <Routes>
<Route path="/" 
element={<MainSection/>}>
</Route>
 <Route  path="/profile"  element={<ProfilePage/>}>


 </Route>
       </Routes>
    )
 }


 export default AppRoute;