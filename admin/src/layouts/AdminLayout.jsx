import React from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/bars/AdminNavbar";

const AdminLayout = ({}) => {
  return (
    <div>
      {/* Navbar */}
      <AdminNavbar />

      {/* Main content */}
      <main className="flex-1 pt-20 ">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
