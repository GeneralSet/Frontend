import * as React from "react";
import Topbar from "./Topbar";
import "./setBox.css";

const SetBox: React.FC = (props) => (
  <div className="set-box-background">
    <div className="set-box-purple-card">
      <Topbar />
      {props.children}
    </div>
  </div>
);

export default SetBox;
