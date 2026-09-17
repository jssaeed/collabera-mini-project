import { Route, Routes } from "react-router";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { CurrentUserProvider } from "./context/CurrentUserContext";
import AboutPage from "./pages/AboutPage";
import AccountPage from "./pages/AccountPage";
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { Layout } from "antd";

function App() {
  return (
    <CurrentUserProvider>
      <Layout className="app-shell">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <Header />
        <Layout.Content id="main-content" className="app-content" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </Layout.Content>
        <Footer />
      </Layout>
    </CurrentUserProvider>
  );
}

export default App;
