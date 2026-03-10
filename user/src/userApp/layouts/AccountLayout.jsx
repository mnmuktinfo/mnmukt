import React from "react";
import { Outlet } from "react-router-dom";

const AccountLayout = () => {
  return (
    <div className="min-h-screen  font-sans">
      {/* AMAZON/FLIPKART PLAN:
         - Removed Sidebar for a single-column focus.
         - Background #f1f3f6 makes the white content sections look premium.
         - Max-width 4xl (960px) is the sweet spot for account pages.
      */}

      <main className="max-w-4xl mx-auto min-h-screen flex flex-col">
        {/* Main Content Area */}
        <section className="flex-1 bg-white ">
          <Outlet />
        </section>

        {/* Amazon-style Minimalist Footer */}
        <footer className="py-10 px-6 text-center">
          <div className="flex justify-center gap-6 mb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <button className="hover:text-gray-600 transition-colors">
              Conditions of Use
            </button>
            <button className="hover:text-gray-600 transition-colors">
              Privacy Notice
            </button>
            <button className="hover:text-gray-600 transition-colors">
              Help
            </button>
          </div>

          <p className="text-[11px] text-gray-400 font-medium">
            © 2026 Mnmukt Organics. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default AccountLayout;
