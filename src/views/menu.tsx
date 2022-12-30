import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { ReduxState } from "reducers";
import { Dispatch } from "redux";
import { GameEditor } from "./GameEditor";

export const Menu: React.FC = () => {
  return (
    <nav style={{ maxWidth: "350px", margin: "0 auto" }}>
      <Link
        to="/single_player/custom"
        className="btn btn-light btn-lg btn-block"
      >
        Random
      </Link>
      <Link
        to="/single_player/custom"
        className="btn btn-warning btn-lg btn-block"
      >
        Play
      </Link>
      <GameEditor />
    </nav>
  );
};
