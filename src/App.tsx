import * as React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SinglePlayerGame from "./views/singlePlayer/game";
import { Menu } from "./views/menu";
import { Provider } from "react-redux";
import { store } from "./store";
import "./index.css";
import Layout from "components/Layout";

const App = () => (
  <>
    <Provider store={store}>
      <BrowserRouter>
         <Layout>
          <Routes>
            <Route path="/" element={<Menu/>} />
            <Route path="/single_player" element={<SinglePlayerGame/>} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </Provider>
  </>

);

export default App;
