import * as React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import SinglePlayer from "./views/singlePlayer";
import SinglePlayerGame from "./views/singlePlayer/game";
import MultiPlayerGame from "./views/multiPlayer/game";
import MultiPlayer from "./views/multiPlayer";
import Lobby from "./views/multiPlayer/lobby";
import { Menu } from "./views/menu";
import { Provider } from "react-redux";
import { store } from "./store";
import "./index.css";
import Layout from "components/Layout";

const App = () => (
  <Provider store={store}>
    <BrowserRouter>
      <Switch>
        <Layout>
          <Route exact={true} path="/" component={Menu} />
          <Route exact={true} path="/single_player" component={SinglePlayer} />
          <Route
            exact={true}
            path="/single_player/:gameType"
            component={SinglePlayerGame}
          />
          <Route exact={true} path="/multi_player" component={MultiPlayer} />
          <Route
            exact={true}
            path="/multi_player/:roomName"
            component={Lobby}
          />
          <Route
            exact={true}
            path="/multi_player/:roomName/:gameType"
            component={MultiPlayerGame}
          />
        </Layout>
      </Switch>
    </BrowserRouter>
  </Provider>
);

export default App;
