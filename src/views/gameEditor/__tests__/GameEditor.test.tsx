import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "store";
import { GameEditor } from "../GameEditor";

// The default deck (views/reducers.ts DECK_DATA) has 3 cards, none of them
// "Fried Egg" — the only shape today that declares yolks support.
const openEditor = () => {
  const result = render(
    <Provider store={store}>
      <GameEditor />
    </Provider>
  );
  fireEvent.click(screen.getByText("Build Your Own"));
  return result;
};

// react-bootstrap's Modal portals into document.body, outside the RTL
// `container`, so DOM lookups here go through `baseElement` (== document.body)
// instead. Shapes is always FEATURE_NAMES[0], so its <select> is always the
// first one; yolks (when rendered) is always last.
const setCardShape = (baseElement: HTMLElement, cardIndex: number, shape: string) => {
  const cardButtons = baseElement.querySelectorAll(".cardSelector-button");
  fireEvent.click(cardButtons[cardIndex]);
  const shapeSelect = baseElement.querySelectorAll("select")[0] as HTMLSelectElement;
  fireEvent.change(shapeSelect, { target: { value: shape } });
};

const setAllCardsToShape = (baseElement: HTMLElement, cardCount: number, shape: string) => {
  for (let i = 0; i < cardCount; i++) {
    setCardShape(baseElement, i, shape);
  }
};

describe("GameEditor: shape-gated custom features (yolks)", () => {
  test("yolks controls are absent when no card uses an egg-shaped symbol", () => {
    const { baseElement } = openEditor();
    expect(baseElement.querySelectorAll(".cardSelector-button").length).toBeGreaterThan(0);

    expect(screen.queryByText("Yolks")).not.toBeInTheDocument();
  });

  test("yolks controls appear once every card is set to Fried Egg", () => {
    const { baseElement } = openEditor();
    const cardCount = baseElement.querySelectorAll(".cardSelector-button").length;

    setAllCardsToShape(baseElement, cardCount, "Fried Egg");

    expect(screen.getByText("Yolks")).toBeInTheDocument();
  });

  test("yolks controls disappear again once a card's shape changes away from Fried Egg", () => {
    const { baseElement } = openEditor();
    const cardCount = baseElement.querySelectorAll(".cardSelector-button").length;

    setAllCardsToShape(baseElement, cardCount, "Fried Egg");
    expect(screen.getByText("Yolks")).toBeInTheDocument();

    setCardShape(baseElement, 0, "Triangle");

    expect(screen.queryByText("Yolks")).not.toBeInTheDocument();
  });

  test("enabling yolks assigns each egg card a distinct yolk count", () => {
    const { baseElement } = openEditor();
    const cardCount = baseElement.querySelectorAll(".cardSelector-button").length;

    setAllCardsToShape(baseElement, cardCount, "Fried Egg");

    const checkboxes = baseElement.querySelectorAll('input[type="checkbox"]');
    fireEvent.click(checkboxes[checkboxes.length - 1]);

    const cardButtons = baseElement.querySelectorAll(".cardSelector-button");
    const values: string[] = [];
    for (let i = 0; i < cardCount; i++) {
      fireEvent.click(cardButtons[i]);
      const selects = baseElement.querySelectorAll("select");
      values.push((selects[selects.length - 1] as HTMLSelectElement).value);
    }

    expect(new Set(values).size).toBe(cardCount);
    values.forEach((value) => expect(["1", "2", "3"]).toContain(value));
  });
});
