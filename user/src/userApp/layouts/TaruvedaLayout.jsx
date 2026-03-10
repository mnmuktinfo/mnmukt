// layouts/TaruvedaLayout.jsx
import { Outlet } from "react-router-dom";

const TaruvedaLayout = () => {
  return (
    <div className="">
      {/* Optional: Taruveda Header */}
      <Outlet />
      {/* <TaruvedaFooter /> */}
    </div>
  );
};

export default TaruvedaLayout;
