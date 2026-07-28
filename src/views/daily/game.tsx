import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Board } from "components/game/board";
import { PreviousSelection } from "components/game/previousSelection";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Set } from "set/pkg/set";
import { createDailyDeck } from "daily/deck";
import { getDateKey, msUntilNextMidnight } from "daily/date";
import {
  computeScore,
  penaltySeconds,
  HINT_PENALTY_SECONDS,
  WRONG_GUESS_PENALTY_SECONDS,
} from "daily/scoring";
import {
  DailyStats,
  computeUpdatedStats,
  loadGameState,
  loadStats,
  newGameState,
  saveGameState,
  saveStats,
} from "daily/storage";
import { copyToClipboard, formatShareText, formatTime } from "daily/share";

const GeneralSet =
  process.env.NODE_ENV !== "test" ? import("set/pkg/set") : ({} as any);

const DailyGame = () => {
  const deck = useMemo(() => createDailyDeck(), []);
  const features = deck.features.length;
  const options = deck.numOptions;
  const boardSize = features * options;

  const [dateKey, setDateKey] = useState<string>(() => getDateKey(new Date()));
  // Today's saved progress, read once on mount. The engine's shuffle can't be
  // restored, so a reload deals a new board — but time and penalties resume,
  // so reloading never improves a score.
  const initial = useMemo(
    () => loadGameState(dateKey) || newGameState(dateKey),
    [dateKey]
  );
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(
    initial.elapsedSeconds
  );
  const [wrongGuesses, setWrongGuesses] = useState<number>(
    initial.wrongGuesses
  );
  const [hintsUsed, setHintsUsed] = useState<number>(initial.hintsUsed);
  const [completed, setCompleted] = useState<boolean>(initial.completed);
  const [finalScoreSeconds, setFinalScoreSeconds] = useState<number | null>(
    initial.finalScoreSeconds
  );

  const [set, setSet] = useState<Set>();
  const [selected, setSelected] = useState<string[]>([]);
  const [hint, setHint] = useState<string[]>([]);
  const [previousSelection, setPreviousSelection] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const [setsFound, setSetsFound] = useState<number>(0);

  const [stats, setStats] = useState<DailyStats>(() => loadStats());
  const [showResults, setShowResults] = useState<boolean>(initial.completed);
  const [newDayAvailable, setNewDayAvailable] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(0);

  useEffect(() => {
    if (completed) {
      return;
    }
    GeneralSet.then(({ Set }: any) => {
      setSet(Set.new(features, options, boardSize));
    });
  }, [features, options, boardSize, completed]);

  useEffect(() => {
    if (completed || newDayAvailable) {
      return;
    }
    const id = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
      if (getDateKey(new Date()) !== dateKey) {
        setNewDayAvailable(true);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [completed, newDayAvailable, dateKey]);

  useEffect(() => {
    saveGameState({
      dateKey,
      elapsedSeconds,
      wrongGuesses,
      hintsUsed,
      completed,
      finalScoreSeconds,
    });
  }, [
    dateKey,
    elapsedSeconds,
    wrongGuesses,
    hintsUsed,
    completed,
    finalScoreSeconds,
  ]);

  useEffect(() => {
    if (!showResults) {
      return;
    }
    const update = () =>
      setCountdownSeconds(Math.floor(msUntilNextMidnight(new Date()) / 1000));
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, [showResults]);

  const finishGame = () => {
    const score = computeScore({ elapsedSeconds, wrongGuesses, hintsUsed });
    setCompleted(true);
    setFinalScoreSeconds(score);
    const updated = computeUpdatedStats(loadStats(), dateKey, score);
    saveStats(updated);
    setStats(updated);
    setShowResults(true);
  };

  const startNewDay = () => {
    const todayKey = getDateKey(new Date());
    saveGameState(newGameState(todayKey));
    setDateKey(todayKey);
    setElapsedSeconds(0);
    setWrongGuesses(0);
    setHintsUsed(0);
    setCompleted(false);
    setFinalScoreSeconds(null);
    setSet(undefined);
    setSelected([]);
    setHint([]);
    setPreviousSelection([]);
    setMessage("");
    setSetsFound(0);
    setShowResults(false);
    setNewDayAvailable(false);
    setCopied(null);
    GeneralSet.then(({ Set }: any) => {
      setSet(Set.new(features, options, boardSize));
    });
  };

  if (!set && !completed) {
    return <div>Loading...</div>;
  }

  const board = set && set.get_board() ? set.get_board().split(",") : [];
  const cardsRemaining = set && set.get_deck() ? set.get_deck().split(",").length : 0;
  const liveScore =
    completed && finalScoreSeconds !== null
      ? finalScoreSeconds
      : computeScore({ elapsedSeconds, wrongGuesses, hintsUsed });

  const selectCard = (id: string) => {
    if (!set || completed || newDayAvailable) {
      return;
    }
    const selectedClone = [...selected];

    if (selectedClone.includes(id)) {
      selectedClone.splice(selectedClone.indexOf(id), 1);
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
    if (!set.is_set(selectedClone.join(","))) {
      setWrongGuesses(wrongGuesses + 1);
      setMessage(`Not a set. +${WRONG_GUESS_PENALTY_SECONDS}s`);
      return;
    }

    const next = set.update_board(selectedClone.join(","));
    setSet(next);
    setSetsFound(setsFound + 1);
    setMessage("Set!");
    if (next.is_end()) {
      finishGame();
    }
  };

  const giveHint = (_event: React.MouseEvent<HTMLButtonElement>) => {
    if (!set || completed || newDayAvailable) {
      return;
    }
    setHint(set.hint(board.join(",")).split(","));
    setHintsUsed(hintsUsed + 1);
    setMessage(`Hint used. +${HINT_PENALTY_SECONDS}s`);
  };

  const shareText = formatShareText({
    dateKey,
    scoreSeconds: liveScore,
    wrongGuesses,
    hintsUsed,
    currentStreak: stats.currentStreak,
  });

  const share = () => {
    copyToClipboard(shareText).then(setCopied);
  };

  return (
    <div>
      <Modal show={showResults} onHide={() => setShowResults(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Daily Puzzle Complete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h2 style={{ textAlign: "center" }}>{formatTime(liveScore)}</h2>
          <p style={{ textAlign: "center" }} className="text-muted">
            {formatTime(elapsedSeconds)} +{" "}
            {formatTime(penaltySeconds({ wrongGuesses, hintsUsed }))} in
            penalties ({wrongGuesses} wrong · {hintsUsed}{" "}
            {hintsUsed === 1 ? "hint" : "hints"})
          </p>
          <table className="table w-auto" style={{ margin: "0 auto" }}>
            <tbody>
              <tr>
                <td style={{ textAlign: "left" }}>Current streak</td>
                <td>{stats.currentStreak}</td>
              </tr>
              <tr>
                <td style={{ textAlign: "left" }}>Max streak</td>
                <td>{stats.maxStreak}</td>
              </tr>
              <tr>
                <td style={{ textAlign: "left" }}>Best score</td>
                <td>
                  {stats.bestScoreSeconds !== null
                    ? formatTime(stats.bestScoreSeconds)
                    : "-"}
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: "left" }}>Puzzles completed</td>
                <td>{stats.completions}</td>
              </tr>
            </tbody>
          </table>
          <p style={{ textAlign: "center" }}>
            Next puzzle in {formatTime(countdownSeconds)}
          </p>
          {copied === false && (
            <textarea
              readOnly
              className="form-control"
              value={shareText}
              rows={3}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={share}>
            {copied ? "Copied!" : "Share"}
          </Button>
          <Button variant="secondary" onClick={() => setShowResults(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      {newDayAvailable && (
        <div className="alert alert-info">
          A new daily puzzle is available.{" "}
          <Button onClick={startNewDay}>Play today's puzzle</Button>
        </div>
      )}
      <button
        onClick={giveHint}
        className="btn btn-secondary"
        style={{ marginRight: "10px" }}
        disabled={completed || newDayAvailable}
      >
        Hint (+{HINT_PENALTY_SECONDS}s)
      </button>
      {completed && (
        <button
          onClick={() => setShowResults(true)}
          className="btn btn-primary"
        >
          Results
        </button>
      )}
      <div className="container mb-2">
        <div className="row">
          <div className="col-sm">
            <table
              className="table table-borderless w-auto"
              style={{ color: "white" }}
            >
              <tbody>
                <tr>
                  <td style={{ textAlign: "left" }}>Daily Puzzle</td>
                  <td>{dateKey}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: "left" }}>Time</td>
                  <td>{formatTime(liveScore)}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: "left" }}>Sets Found</td>
                  <td>{setsFound}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: "left" }}>Cards Remaining</td>
                  <td>{cardsRemaining}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: "left" }}>Wrong Guesses</td>
                  <td>{wrongGuesses}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: "left" }}>Hints Used</td>
                  <td>{hintsUsed}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="col-sm">
            <PreviousSelection
              cards={previousSelection}
              message={message}
              deck={deck}
            />
          </div>
        </div>
      </div>
      {set && (
        <Board
          board={board}
          selected={selected}
          hint={hint}
          onSelect={selectCard}
          deck={deck}
        />
      )}
      {completed && !set && (
        <p style={{ color: "white" }}>
          You finished today's puzzle. Come back tomorrow!
        </p>
      )}
    </div>
  );
};

export default DailyGame;
