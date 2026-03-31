import BasicDataRouter from "./routes/BasicDataRouter";
import { store } from "./store/index.ts";
import { Provider } from "react-redux";
import { SignalRProvider } from "./context/SignalRContext";
import { ThemeProvider } from "./components/shared/ThemeProvider/ThemeProvider";

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SignalRProvider>
          <BasicDataRouter />
        </SignalRProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
