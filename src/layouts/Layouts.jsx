import Footer from "./Footer";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import RouteTitleManager from "../components/RouteTitleManager";

export default function Layout() {
  return (
    <>
      <RouteTitleManager />
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}