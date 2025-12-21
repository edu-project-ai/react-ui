import BasicDataRouter from "./routes/BasicDataRouter";
import { store } from "./store/index.ts";
import { Provider } from "react-redux";
import { SignalRProvider } from "./context/SignalRContext";

function App() {
  return (
    <Provider store={store}>
      <SignalRProvider>
        <BasicDataRouter />
      </SignalRProvider>
    </Provider>
  );
}

export default App;
