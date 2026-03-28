import styles from "./App.module.css";
import RouteManager from "./routing/RouteManager";

function App() {
  return (
    <div className={styles.app}>
      <RouteManager />
    </div>
  );
}

export default App;