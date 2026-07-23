import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
        }}
      />

      <AppRoutes />
    </>
  );
}

export default App;


//Global toast container.
//Shows success/error/info notifications anywhere in the app.
// Add it only ONCE, usually in App.jsx.