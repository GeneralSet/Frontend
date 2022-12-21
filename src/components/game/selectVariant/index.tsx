import * as React from "react";
import autobind from "autobind-decorator";
import Card from "components/game/card";
import "./index.css";

interface Props {
  onSelect: (gameType: gameType) => void;
  selected?: gameType;
}

@autobind
export default class SelectVariant extends React.Component<Props, {}> {
  private readonly SetVariants: SetVariant[] = [
    {
      gameType: "original",
      name: "Original",
    },
    {
      gameType: "triangles",
      name: "Triangles",
    },
    {
      gameType: "filters",
      name: "Filters",
    },
    {
      gameType: "animations",
      name: "Animations",
    },
    {
      gameType: 'custom',
      name: 'Custom',
    },
  ];

  private gamePreviewButton(
    variant: SetVariant,
    index: number
  ): JSX.Element | null {
    const linkClasses = [
      "btn btn-outline-primary btn-lg btn-block game-selector",
    ];
    if (this.props.selected === variant.gameType) {
      linkClasses.push("active");
    }
    return (
      <button
        className={linkClasses.join(" ")}
        onClick={() => this.props.onSelect(variant.gameType)}
        key={index}
      >
        <h4>{variant.name}</h4>
        <div className="cards">
          <Card
            features="2_2_2_2"
            selected={false}
            gameType={variant.gameType}
          />
          <Card
            features="1_1_1_1"
            selected={false}
            gameType={variant.gameType}
          />
          <Card
            features="0_0_0_0"
            selected={false}
            gameType={variant.gameType}
          />
        </div>
      </button>
    );
  }

  render() {
    return (
      <nav style={{ maxWidth: "350px", margin: "0 auto" }}>
        {this.SetVariants.map(this.gamePreviewButton)}
      </nav>
    );
  }
}
