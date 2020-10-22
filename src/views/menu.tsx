import * as React from "react";
import { Link } from "react-router-dom";

export const Menu: React.FC = () => (
  <nav style={{ maxWidth: "350px", margin: "0 auto" }}>
    <Link
      to="/single_player"
      className="btn btn-outline-primary btn-lg btn-block"
    >
      Single Player
    </Link>
    <Link
      to="/multi_player"
      className="btn btn-outline-primary btn-lg btn-block"
    >
      Multi Player
    </Link>
  </nav>
);
