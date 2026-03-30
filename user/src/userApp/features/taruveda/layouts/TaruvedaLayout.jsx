import { Outlet } from "react-router-dom";
import TaruVedaNavbar from "../components/TaruVedaNavbar";
import TaruvedaFooter from "../components/TaruvedaFooter";

const TaruvedaLayout = () => {
  return (
    <div className="">
      <TaruVedaNavbar /> <Outlet />
      <TaruvedaFooter />{" "}
    </div>
  );
};

export default TaruvedaLayout;
