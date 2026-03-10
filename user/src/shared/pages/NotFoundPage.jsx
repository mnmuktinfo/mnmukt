import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { COLORS } from "../../style/theme";
import CustomButton from "../../user/code/button/CustomButton";

const NotFoundPage = () => {
  const Navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
      <Helmet>
        <title>404 – Page Not Found</title>
        <meta
          name="description"
          content="The page you are looking for cannot be found."
        />
      </Helmet>

      {/* Title */}
      <p className="text-sm md:text-xl font-semibold mb-2 text-gray-500">
        We couldn't find the page you were looking for
      </p>

      {/* Not Found Image */}
      <img
        src="https://constant.myntassets.com/pwa/assets/img/NotFound.png"
        alt="Page Not Found"
        className="w-64 md:w-96 mb-6"
      />

      {/* Button */}
      <div>
        <CustomButton text="Go TO HomePage" onClick={Navigate("/")}>
          Go to Homepage
        </CustomButton>
      </div>
    </div>
  );
};

export default NotFoundPage;
