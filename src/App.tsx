import BasicDataRouter from "./routes/BasicDataRouter";
import { store } from "./store/index.ts";
import { Provider } from "react-redux";

function App() {
  return (
    <Provider store={store}>
      <BasicDataRouter />
    </Provider>
  );
}

export default App;
