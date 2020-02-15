import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import iNoBounce from "inobounce";

import { Simple } from "./Simple";
import { TimePicker } from "./TimePicker";

const App = () => {
  useEffect(() => {
    iNoBounce.enable();
  }, []);

  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/examples/simple" component={Simple} />
        <Route exact path="/examples/time-picker" component={TimePicker} />
        <Redirect to="/examples/simple" />
      </Switch>
    </BrowserRouter>
  );
};

ReactDOM.render(<App />, document.querySelector("#root"));
