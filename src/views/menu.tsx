import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ReduxState } from "reducers";
import { GameEditor } from "./gameEditor/GameEditor";
import Card from "components/game/card";

export const Menu: React.FC = () => {
  const deck = useSelector((state: ReduxState) => state.singlePlayer.deck);
  return (
    <>
      <div className="game-selector">
        <div className="cards">
          <Card selected={false} svg={deck["2_2_2"]} />
          <Card selected={false} svg={deck["1_1_1"]} />
          <Card selected={false} svg={deck["0_0_0"]} />
        </div>
      </div>
      <nav style={{ maxWidth: "350px", margin: "0 auto" }}>
        {/* <Link
          to="/single_player/custom"
          className="btn btn-light btn-lg btn-block"
        >
          Random
        </Link> */}
        <Link
          to="/single_player"
          className="btn btn-warning"
          style={{marginRight: "10px"}}
        >
          Play
        </Link>
        <GameEditor />
      </nav>
    </>
  );
};
