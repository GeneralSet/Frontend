import React from "react";
import { Link } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = (props) => (
  <div
    className="text-center"
    style={{ backgroundColor: "#4A3665", height: "100%" }}
  >
    <h1 style={{ padding: "1rem 0" }}>
      <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
        GeneralSet.io
      </Link>
    </h1>
    {props.children}
  </div>
);

export default Layout;
