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

// `fireEvent.change` writes a select's value directly and ignores `disabled`
// on the target <option>, so what a real user can pick has to be read off the
// option itself rather than inferred from a successful change event.
const isShapeOptionDisabled = (baseElement: HTMLElement, cardIndex: number, shape: string) => {
  const cardButtons = baseElement.querySelectorAll(".cardSelector-button");
  fireEvent.click(cardButtons[cardIndex]);
  const shapeSelect = baseElement.querySelectorAll("select")[0] as HTMLSelectElement;
  const option = Array.from(shapeSelect.options).find((o) => o.value === shape);
  expect(option).toBeDefined();
  return (option as HTMLOptionElement).disabled;
};

// Feature controls render in FEATURE_NAMES order, so the Symbol switch/select
// is always first and yolks — when unlocked — always last.
const symbolSwitch = (baseElement: HTMLElement) =>
  baseElement.querySelectorAll('input[type="checkbox"]')[0] as HTMLInputElement;

const toggleYolks = (baseElement: HTMLElement) => {
  const switches = baseElement.querySelectorAll('input[type="checkbox"]');
  fireEvent.click(switches[switches.length - 1]);
};

const readYolkValues = (baseElement: HTMLElement, cardCount: number) => {
  const cardButtons = baseElement.querySelectorAll(".cardSelector-button");
  const values: string[] = [];
  for (let i = 0; i < cardCount; i++) {
    fireEvent.click(cardButtons[i]);
    const selects = baseElement.querySelectorAll("select");
    values.push((selects[selects.length - 1] as HTMLSelectElement).value);
  }
  return values;
};

const addCardButton = (baseElement: HTMLElement) =>
  baseElement.querySelector(".cardSelector-add") as HTMLElement | null;

describe("GameEditor: repeating a symbol that owns an internal feature", () => {
  test("a shape with an internal feature can be picked for a second card", () => {
    const { baseElement } = openEditor();

    setCardShape(baseElement, 0, "Fried Egg");

    expect(isShapeOptionDisabled(baseElement, 1, "Fried Egg")).toBe(false);
  });

  test("a shape with no internal feature still cannot be picked twice", () => {
    const { baseElement } = openEditor();

    setCardShape(baseElement, 0, "Triangle");

    expect(isShapeOptionDisabled(baseElement, 1, "Triangle")).toBe(true);
  });

  test("repeating a symbol hands its job to the shape's own feature", () => {
    const { baseElement } = openEditor();
    const cardCount = baseElement.querySelectorAll(".cardSelector-button").length;

    setCardShape(baseElement, 0, "Fried Egg");
    setCardShape(baseElement, 1, "Fried Egg");

    // The symbol stops varying — every card wears it — and yolks takes over.
    expect(symbolSwitch(baseElement).checked).toBe(false);
    expect(screen.getByText("Yolks")).toBeInTheDocument();
    const shapeSelect = baseElement.querySelectorAll("select")[0] as HTMLSelectElement;
    expect(shapeSelect.value).toBe("Fried Egg");

    const values = readYolkValues(baseElement, cardCount);
    expect(new Set(values).size).toBe(cardCount);
  });

  test("a repeated symbol caps the deck at what its feature can tell apart", () => {
    const { baseElement } = openEditor();
    expect(addCardButton(baseElement)).toBeInTheDocument();

    setCardShape(baseElement, 0, "Fried Egg");
    setCardShape(baseElement, 1, "Fried Egg");

    // Yolks only counts to three, so the three-card deck is full.
    expect(baseElement.querySelectorAll(".cardSelector-button")).toHaveLength(3);
    expect(addCardButton(baseElement)).not.toBeInTheDocument();
  });

  test("a symbol cannot be repeated across more cards than its feature has values", () => {
    const { baseElement } = openEditor();
    fireEvent.click(addCardButton(baseElement) as HTMLElement);
    expect(baseElement.querySelectorAll(".cardSelector-button")).toHaveLength(4);

    setCardShape(baseElement, 0, "Fried Egg");

    expect(isShapeOptionDisabled(baseElement, 1, "Fried Egg")).toBe(true);
  });
});

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

  test("yolks controls stay away when there are more cards than yolk counts", () => {
    const { baseElement } = openEditor();
    fireEvent.click(addCardButton(baseElement) as HTMLElement);

    // Switching the symbol off makes it shared, so one pick turns all four
    // cards into eggs — but three yolk counts cannot tell four cards apart.
    fireEvent.click(symbolSwitch(baseElement));
    setCardShape(baseElement, 0, "Fried Egg");

    expect(baseElement.querySelectorAll(".cardSelector-button")).toHaveLength(4);
    expect(screen.queryByText("Yolks")).not.toBeInTheDocument();
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

    // Repeating the symbol switches yolks on by itself, so toggle it off and
    // back on to exercise the manual enable path.
    toggleYolks(baseElement);
    toggleYolks(baseElement);

    const values = readYolkValues(baseElement, cardCount);
    expect(new Set(values).size).toBe(cardCount);
    values.forEach((value) => expect(["1", "2", "3"]).toContain(value));
  });
});
