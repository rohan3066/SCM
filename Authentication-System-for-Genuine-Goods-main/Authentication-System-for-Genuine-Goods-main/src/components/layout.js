import React from "react";
import Header from "./header.js";
import Footer from "./footer.js";
// import "../style/footer.css"; // CSS moved to Tailwind in component
import "../style/header.css";

const Layout = (props) => {
  return (
    <>
      <Header />
      {props.children}
      <Footer />
    </>
  );
};

export default Layout;
