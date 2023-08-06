import * as React from 'react';
import './index.css';

interface Props {
  selected: boolean;
  hint?: boolean;
  svg: JSX.Element;
}

const Card = ({selected, hint, svg}: Props) => {
  return (
    <div className={`card ${selected ? 'selected' : ''} ${hint ? 'hint' : ''}`}>
      <div className="card-content">
        <div className="card-image">{svg}</div>
      </div>
    </div>
  );
  }

export default Card;