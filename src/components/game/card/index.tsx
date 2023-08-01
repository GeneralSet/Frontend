import * as React from 'react';
import './index.css';

interface Props {
  selected: boolean;
  hint?: boolean;
  svg: JSX.Element;
}

export default class Card extends React.Component<Props, {}> {
  render() {
    const selected = this.props.selected ? 'selected' : '';
    const hint = this.props.hint ? 'hint' : '';

    return (
      <div className={`card ${selected} ${hint}`}>
        <div className="card-content">
          <div className="card-image">{this.props.svg}</div>
        </div>
      </div>
    );
  }
}
