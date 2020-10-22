import React from "react";
import Topbar from "./Topbar";
import "./fullscreenPage.css";

const FullscreenPage: React.FC = (props) => (
  <div className="fullscreen-page">
    <Topbar />
    {props.children}
  </div>
);

export default FullscreenPage;
