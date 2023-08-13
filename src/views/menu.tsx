import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { ReduxState } from "reducers";
import { GameEditor } from "./gameEditor/GameEditor";
import Card from "components/game/card";
import { getASet } from "./gameEditor/utils";
import { Button } from "react-bootstrap";
import { actions } from "views/actions";
import PresetDeck from "deckBuilder/PresetDeck";

export const Menu: React.FC = () => {
  const dispatch = useDispatch();

  const deck = useSelector((state: ReduxState) => state.singlePlayer.deck);

  const setSDXL = () => {
    dispatch(actions.updateDeck({deck: new PresetDeck(3,["artist", "fruit", "landscape"], 'stable-diffusion-xl', "png")}));
  }

  const animations = () => {
    dispatch(actions.updateDeck({deck: new PresetDeck(3,["1", "1", "1", "1"], 'animations', "svg")}));
  }
  const filters = () => {
    dispatch(actions.updateDeck({deck: new PresetDeck(3,["1", "1", "1", "1"], 'filters', "svg")}));
  }
  const original = () => {
    dispatch(actions.updateDeck({deck: new PresetDeck(3,["1", "1", "1", "1"], 'original', "svg")}));
  }
  const triangles = () => {
    dispatch(actions.updateDeck({deck: new PresetDeck(3,["1", "1", "1", "1"], 'triangles', "svg")}));
  }

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
        <Button variant="secondary" onClick={setSDXL}>
          sd xl
        </Button>
        <Button variant="secondary" onClick={triangles}>
          triangles
        </Button>
        <Button variant="secondary" onClick={animations}>
          animations
        </Button>
        <Button variant="secondary" onClick={filters}>
          filters
        </Button>
        <Button variant="secondary" onClick={original}>
          original
        </Button>
        <GameEditor />
      </nav>
    </>
  );
};
