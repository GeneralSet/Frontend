import * as React from "react";
import { useEffect, useState } from 'react';
import { Board } from "components/game/board";
import {PreviousSelection} from "components/game/previousSelection";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useSelector } from "react-redux";
import { ReduxState } from "reducers";

const GeneralSet =
  process.env.NODE_ENV !== "test" ? import("set/pkg/set") : ({} as any);



const Game = () => {
  const [set, setSet] = useState<any>();
  const [points, setPoints] = useState<number>(0);
  const [hint, setHint] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [previousSelection, setPreviousSelection] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const deckData = useSelector(
    (state: ReduxState) => state.singlePlayer.deck
  );
  const features = deckData.features.length;
  const options = deckData.numOptions;
  const boardSize = features * options;

  useEffect(() => {
    GeneralSet.then((s: any) => {
      setSet(s.Set.new(
        features,
        options,
        boardSize
      ));
    });
  },[features, options, boardSize]);

  const restartGame = () => {
    GeneralSet.then((s: any) => {
      setSet(s.Set.new(
        features,
        options,
        boardSize
      ));
    });
    setPreviousSelection([]);
    setPoints(0);
  };

  if (!set) {
    return (
      <div>Loading...</div>
    )
  }

  const deck = set.get_deck() ? set.get_deck().split(",") : [];
  const board = set.get_board() ? set.get_board().split(",") : [];
  const numberOfSets = set.sets;

  const selectCard = (id: string) => {
    const selectedClone = [...selected];

    // update selected cards
    if (selectedClone.includes(id)) {
      selectedClone.forEach((cardId: string, index: number) => {
        if (cardId === id) {
          selectedClone.splice(index, 1);
        }
      });
    } else {
      selectedClone.push(id);
    }
    if (selectedClone.length < options) {
      setSelected(selectedClone);
      return;
    }

    setHint([]);
    setSelected([]);
    setPreviousSelection(selectedClone);
    // check for set
    const isValidSet = set.is_set(selectedClone.join(","));
    if (!isValidSet) {
      setPoints(points - 1);
      setMessage("-1 Not a set.");
      return;
    }

    // Set found
    setSet(set.update_board(selectedClone.join(",")));
    setPoints(points + 1);
    setMessage("+1 Set!");
  }

  const giveHint = (_event: React.MouseEvent<HTMLButtonElement>) => {
    setHint(set.hint(board.join(",")).split(","))
  }

  return (
    <div>
      <Modal show={set && set.is_end()}>
        <Modal.Header>
          <Modal.Title>Game Over</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Score: {points}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={restartGame}>Play Again</Button>
        </Modal.Footer>
      </Modal>
      <button onClick={giveHint} className="btn btn-secondary btn-sm">
        Hint
      </button>
      <div className="container mb-2">
        <div className="row">
          <div className="col-sm">
            <table className="table table-borderless w-auto" style={{color: "white"}}>
              <tbody>
                <tr>
                  <td style={{textAlign: "left"}}>Score</td>
                  <td>{points}</td>
                </tr>
                <tr>
                  <td style={{textAlign: "left"}}>Cards Remaining</td>
                  <td>{deck.length}</td>
                </tr>
                <tr>
                  <td style={{textAlign: "left"}}>Sets on the Board</td>
                  <td>{numberOfSets}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="col-sm">
            <PreviousSelection
              cards={previousSelection}
              message={message}
            />
          </div>
        </div>
      </div>
      <Board
        board={board}
        selected={selected}
        hint={hint}
        onSelect={selectCard}
      />
    </div>
  );
}

export default Game;
