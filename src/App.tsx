import styles from "./App.module.css";
import RouteManager from "./routing/RouteManager";
import ToastProvider from "./components/toast/Toast";

function App() {
  return (
    <ToastProvider>
      <div className={styles.app}>
        <RouteManager />
      </div>
    </ToastProvider>
  );
}

export default App;