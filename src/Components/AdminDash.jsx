import { Outlet } from "react-router-dom";
import Navbar from "./Navbar"
import NewSideBar from "./NewSideBar";
// import Page404 from "../Components/Page404";
const AdminDash = () => {
  return (
    <>
       <Navbar />
      <section className="w-full h-full flex">
        <NewSideBar />
        <div className="w-full min-h-full overflow-hidden mt-20">
          {/* <Page404 /> */}
          <Outlet />
        </div>
      </section>
    </>
  );
};

export default AdminDash;
