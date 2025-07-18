import { Outlet } from "react-router-dom";
import { useState } from "react";

import Navbar from "./Navbar"
import NewSideBar from "./NewSideBar";

const Instructor = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
   <>
      <Navbar setSidebarOpen={setSidebarOpen} />
      <section className="flex w-full h-full">
        <NewSideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="w-full min-h-full mt-20 overflow-hidden">
          <Outlet />
        </div>
      </section>
    </>
  );
};

export default Instructor;
