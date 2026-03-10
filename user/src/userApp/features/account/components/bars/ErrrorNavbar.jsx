import { IMAGES } from "../../../assets/images";

const ErrorNavbar = () => {
  return (
    <nav className="w-full bg-white py-4">
      <div className="flex justify-center items-center space-x-4">
        {/* Logo + Name */}
        <div className="flex items-center space-x-2">
          <img src={IMAGES.appLogo} alt="Logo" className="h-8 w-8" />
          <h1 className="text-white text-2xl font-bold">MyApp</h1>
        </div>
        {/* Login Button */}
        <button className="bg-blue-500 text-black px-4 py-2 rounded hover:bg-blue-400">
          Login
        </button>
      </div>
    </nav>
  );
};

export default ErrorNavbar;
