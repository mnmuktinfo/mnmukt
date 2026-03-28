// layouts/TaruvedaLayout.jsx
import { Outlet } from "react-router-dom";
import TaruVedaNavbar from "../features/taruveda/components/TaruVedaNavbar";
import TaruvedaFooter from "../features/taruveda/components/TaruvedaFooter";

const TaruvedaLayout = () => {
  return (
    <div className="">
      <TaruVedaNavbar /> <Outlet />
      <TaruvedaFooter />{" "}
    </div>
  );
};

export default TaruvedaLayout;
