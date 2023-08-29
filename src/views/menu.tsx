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

interface GeneratedDeck {
  options: number;
  features: string[];
  path: string;
  ext: "svg" | "png";
  name: string;
}

const StableDiffusion: GeneratedDeck[] = [
  {options: 3, features: ["Animal", "hat", "color"], path: 'SD-XL/animal-hat-color', ext: "png", name: "Animal-Hat-Color"},
  {options: 3, features: ["artist", "fruit", "landscape"], path: 'SD-XL/style-fruit-landscape', ext: "png", name: "Artist-Fruit-Landscape"},
  {options: 3, features: ["Train", "Season", "Setting"], path: 'SD-XL/train-season-setting', ext: "png", name: "Train-Season-Setting"},
]
const Legacy: GeneratedDeck[] = [
  {options: 3, features: ["1", "1", "1", "1"], path: 'original', ext: "svg", name: "Original"},
  {options: 3, features: ["1", "1", "1", "1"], path: 'filters', ext: "svg", name: "Filters"},
  {options: 3, features: ["1", "1", "1", "1"], path: 'triangles', ext: "svg", name: "Triangle"},
  {options: 3, features: ["1", "1", "1", "1"], path: 'animations', ext: "svg", name: "Animations"},
]

export const Menu: React.FC = () => {
  const dispatch = useDispatch();

  const deck = useSelector((state: ReduxState) => state.singlePlayer.deck);

  const setPreSetDeck = (d: GeneratedDeck) => {
    dispatch(actions.updateDeck({deck: new PresetDeck(d.options, d.features, d.path, d.ext)}));
  }

  return (
    <>
      <div className="game-selector">
        <div className="cards">
          {getASet(deck.numOptions, deck.features.length).map((id) => (
            <Card key={id} selected={false} image={deck.cards[id]} />
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
        <h3>Images</h3>
        {StableDiffusion.map(d => (
          <Button variant="secondary" onClick={() => {setPreSetDeck(d)}} style={{margin: "5px"}}>
            {d.name}
          </Button>
        ))}
        <h3>Symbols</h3>
        {Legacy.map(d => (
          <Button variant="secondary" onClick={() => {setPreSetDeck(d)}} style={{margin: "5px"}}>
            {d.name}
          </Button>
        ))}
        <GameEditor />
      </nav>
    </>
  );
};
