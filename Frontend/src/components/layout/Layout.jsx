import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";


function Layout() {
    return (
        <>
            <Navbar />

            <main className="min-h-screen">
                <Outlet /> 
            </main>

            <Footer />
        </>
    );
}

export default Layout;


// Prevents repeating Navbar and Footer on every page.
// Common layout wrapper.
// A React Router component.It renders the child route inside the parent layout. Used to avoid repeating Navbar/Footer on every page.