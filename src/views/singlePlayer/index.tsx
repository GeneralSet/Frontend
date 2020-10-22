import * as React from "react";
import autobind from "autobind-decorator";
import SelectVariant from "components/game/selectVariant";
import { RouteComponentProps } from "react-router-dom";
import FullscreenPage from "components/layout/FullscreenPage";

@autobind
export default class SinglePlayer extends React.Component<
  RouteComponentProps<{}>,
  {}
> {
  private onClick(gameType: gameType) {
    const path = this.props.match.url.endsWith("/") ? gameType : `/${gameType}`;
    this.props.history.push(`${this.props.match.url}${path}`);
  }

  public render() {
    return (
      <FullscreenPage>
        <SelectVariant onSelect={this.onClick} />
      </FullscreenPage>
    );
  }
}
