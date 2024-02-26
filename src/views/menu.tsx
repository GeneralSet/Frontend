import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { ReduxState } from "reducers";
import { GameEditor } from "./gameEditor/GameEditor";
import { DEFAULT_CARD, getASet } from "./gameEditor/utils";
import { Button } from "react-bootstrap";
import { actions } from "views/actions";
import PresetDeck from "deckBuilder/PresetDeck";
import { PreviousSelection } from "components/game/previousSelection";
import GeometricDeckGenerator from "deckBuilder/GeometricDeckGenerator";

interface GeneratedDeck {
  options: {[feature: string]: (string | number)[]};
  path?: string;
  ext?: "svg" | "png";
  defaultCardData?: CardData;
  name: string;
}

const StableDiffusion: GeneratedDeck[] = [
  {options: {"Animal": ['Cat', 'Dog', 'Bird'], "Hat": ['Top Hat', 'Beret', 'Hard Hat'], "Color": ['Black', 'Orange', 'White']}, path: 'SD-XL/animal-hat-color', ext: "png", name: "Cute Animals"},
  {options: {"Breed": ['Golden retriever ', 'Corgi', 'Poodle'], "Accessory": ['Sun Glasses', 'Top Hat', 'Bow Tie'], "Location": ['Beach', 'Mountains', 'Forest']}, path: 'SD-XL/breed-accessory-setting', ext: "png", name: "Dogs"},
  {options: {"Train": ['Steam train', 'Trolly', 'Bullet train'], "Season": ['Winter', 'Spring', 'Fall'], "Setting": ['Forest', 'Field', 'City']}, path: 'SD-XL/train-season-setting', ext: "png", name: "Trains"},
  {options: {"Color": ['Green', 'Red', 'White and gold'], "Style": ['Real', 'Pixel', 'Origami'], "Setting": ['Forest', 'Mountains', 'Cave']}, path: 'SD-XL/style-color-location', ext: "png", name: "Dragons"},
]
const Legacy: GeneratedDeck[] = [
  {options: {"Shape": ['oval', 'squiggle', 'Diamond'], "Color": ['red', 'purple', 'green'], "Number": ['one', 'two', 'tree'], "Shading": ['solid', 'stripped', 'outlined']}, path: 'original', ext: "svg", name: "Original"},
  {options: {"Direction": ['Down', 'Right', 'Up'], "Color": ['Light', 'Medium', 'Dark'], "Number": ['one', 'two', 'tree'], "Filter": ['Cringle', 'Ink', 'Blur']}, path: 'filters', ext: "svg", name: "Filters"},
  {options: {"Direction": ['Down', 'Right', 'Up'], "Color": ['red', 'yellow', 'black'], "Number": ['one', 'three', 'five'], "Shading": ['outlined', 'triangle', 'gradient']}, path: 'triangles', ext: "svg", name: "Triangle"},
  {options: {"Animations": ['fade', 'corner', 'center'], "Color": ['red', 'purple', 'green'], "Number": ['one', 'two', 'tree'], "Shading": ['triangle', 'stripped', 'outlined']}, path: 'animations', ext: "svg", name: "Animations"},
]

const Symbols: GeneratedDeck[] = [
  {options: {"shapes": ['Circle - Quarter', 'Circle - Semi', 'Circle - Three Quarter'], "colors": ['Red', 'Olive', 'Blue',], "numbers": [3,6,9]}, name: "Circles"},
  {options: {"shapes": ['Tetris - L Block', 'Tetris - S Block', 'Tetris - T Block'], "colors": ['Blue', 'Green', 'Purple'], "rotations":[0,90,180]},  name: "Tetris"},
  {options: {"colors": ['Blue', 'Green', 'Purple'], "filters":["crinkle", "ink", "blur"], "numbers": [1,3,5]}, defaultCardData: {...DEFAULT_CARD, shapes: "Triangle"}, name: "Filters"},
  {options: {"shapes": ['Tracks - Deer', 'Tracks - Wolf', 'Tracks - Frog'], "colors": ['Brown', 'Green', 'Cyan'], "numbers":[2,5,8]},  name: "Tracks"},

]

export const Menu: React.FC = () => {
  const dispatch = useDispatch();

  const deck = useSelector((state: ReduxState) => state.singlePlayer.deck);

  const setPreSetDeck = (d: GeneratedDeck) => {
    dispatch(actions.updateDeck({deck: new PresetDeck(d.options, d.path as string, d.ext as ("svg" | "png"))}));
  }

  const setGeneratedDeck = (d: GeneratedDeck) => {
    dispatch(actions.updateDeck({deck: new GeometricDeckGenerator(d.options, d.defaultCardData)}));
  }

  return (
    <>
      <PreviousSelection cards={getASet(deck.numOptions, deck.features.length)} message=""/>
      <nav style={{ maxWidth: "350px", margin: "0 auto" }}>
        <Link
          to="/single_player"
          className="btn btn-warning"
          style={{marginTop: "10px"}}
        >
          Play
        </Link>
        <h3>Images</h3>
        {StableDiffusion.map(d => (
          <Button variant="secondary" onClick={() => {setPreSetDeck(d)}} style={{margin: "5px"}} key={d.name}>
            {d.name}
          </Button>
        ))}
        <h3>Set Inspired</h3>
        {Legacy.map(d => (
          <Button variant="secondary" onClick={() => {setPreSetDeck(d)}} style={{margin: "5px"}} key={d.name}>
            {d.name}
          </Button>
        ))}
        <h3>Symbols</h3>
        {Symbols.map(d => (
          <Button variant="secondary" onClick={() => {setGeneratedDeck(d)}} style={{margin: "5px"}} key={d.name}>
            {d.name}
          </Button>
        ))}
        <GameEditor />
      </nav>
    </>
  );
};
