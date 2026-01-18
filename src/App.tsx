import { HashRouter } from "react-router-dom";
import AppRoutes from "./routes/routes";

function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}

export default App;
