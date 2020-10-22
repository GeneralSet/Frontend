import React from "react";
import { Link } from "react-router-dom";

const Layout: React.FC = (props) => (
  <div
    className="text-center"
    style={{ backgroundColor: "#A79ACC", height: "100%" }}
  >
    <h1 style={{ padding: "1rem 0" }}>
      <Link to="/" style={{ color: "#513e96", textDecoration: "none" }}>
        GeneralSet.io
      </Link>
    </h1>
    {props.children}
  </div>
);

export default Layout;
