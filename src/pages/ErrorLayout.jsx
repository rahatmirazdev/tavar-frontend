import { useRouteError, Link } from "react-router-dom";
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";
import RouteTitleManager from "../components/RouteTitleManager";

export default function ErrorLayout() {
  const error = useRouteError();

  return (
    <>
      <RouteTitleManager />
      <Navbar />
      <div style={{ minHeight: "calc(100vh - 400px)" }} className="flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            {error?.statusText || error?.message || "Sorry, the page you're looking for doesn't exist."}
          </p>
          <Link
            to="/"
            className="inline-block bg-gray-700 text-white px-8 py-3 rounded-none font-semibold hover:bg-gray-800 transition duration-300"
          >
            Back to Home
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
