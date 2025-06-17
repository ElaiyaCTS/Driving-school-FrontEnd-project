import { Outlet } from "react-router-dom";
import Navbar from "./Navbar"
import NewSideBar from "./NewSideBar";

const Learner = () => {

  return (
    <>
       <Navbar />
      <section className="w-full h-full flex">
        <NewSideBar />
        <div className="w-full min-h-full overflow-hidden mt-20">
          <Outlet />
        </div>
      </section>
    </>
  );
};

export default Learner;
