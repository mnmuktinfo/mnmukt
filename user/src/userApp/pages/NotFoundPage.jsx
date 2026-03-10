import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white font-sans overflow-hidden">
      <Helmet>
        <title>404 — Mnmukt</title>
        <meta
          name="description"
          content="The page you are looking for cannot be found."
        />
      </Helmet>

      {/* Background Subtle Text Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.03] pointer-events-none">
        <h2 className="text-[25rem] font-black">404</h2>
      </div>

      <div className="relative z-10 text-center px-6">
        {/* Large Modern Header */}
        <h1 className="text-[120px] md:text-[180px] font-bold tracking-tighter text-slate-950 leading-none mb-4">
          4<span className="italic font-serif text-[#ff356c]">0</span>4
        </h1>

        <div className="max-w-md mx-auto space-y-6">
          <h2 className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-900">
            Lost in Transition
          </h2>

          <p className="text-sm text-slate-400 font-medium leading-relaxed uppercase tracking-widest max-w-[280px] mx-auto">
            The coordinates you seek do not exist in our current manifest.
          </p>

          <div className="pt-10">
            <Link
              to="/"
              className="group inline-flex items-center gap-4 px-10 py-5 bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.5em] hover:bg-[#ff356c] transition-all duration-500 shadow-2xl shadow-slate-100">
              <ArrowLeft
                size={14}
                className="group-hover:-translate-x-2 transition-transform"
              />
              Return Home
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Branding */}
      <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center opacity-20">
        <div className="w-[1px] h-10 bg-slate-900 mb-4" />
        <p className="text-[10px] font-black text-slate-950 uppercase tracking-[0.8em]">
          MNMUKT
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
