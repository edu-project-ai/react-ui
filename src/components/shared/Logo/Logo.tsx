
import logo from "@/assets/Roadly-logo.png";
import { Link } from "react-router-dom";

export const Logo = () => {
  return (
    <Link to="/" className="text-xl font-semibold flex items-center gap-2">
      <div className={"w-8 h-8 rounded-lg flex items-center justify-center"}>
        <img src={logo} alt="Logo" className="w-6 h-6" />
      </div>
      Roadly
    </Link>
  );
}

