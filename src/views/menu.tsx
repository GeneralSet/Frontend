import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ReduxState } from "reducers";
import { GameEditor } from "./gameEditor/GameEditor";
import Card from "components/game/card";
import { getASet } from "./gameEditor/utils";

export const Menu: React.FC = () => {
  const deck = useSelector((state: ReduxState) => state.singlePlayer.deck);

  return (
    <>
      <div className="game-selector">
        <div className="cards">
          {getASet(deck.numOptions, deck.features.length).map((id) => (
            <Card key={id} selected={false} svg={deck.cards[id]} />
          ))}
        </div>
      </div>
      <nav style={{ maxWidth: "350px", margin: "0 auto" }}>
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
