import * as React from 'react';
import './index.css';

interface Props {
  selected: boolean;
  hint?: boolean;
  image: JSX.Element;
}

const Card = ({selected, hint, image}: Props) => {
  return (
    <div className={`card ${selected ? 'selected' : ''} ${hint ? 'hint' : ''}`}>
      <div className="card-content">
        {image}
      </div>
    </div>
  );
  }

export default Card;