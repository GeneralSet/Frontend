import * as React from "react";
import { Link } from "react-router-dom";
import "./topbar.css";

const Topbar: React.FC = (props) => (
  <div className="topbar-title">
    <Link to="/" className="logo">
      GeneralSet.io
    </Link>
  </div>
);

export default Topbar;
