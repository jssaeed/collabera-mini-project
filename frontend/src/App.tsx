import { Route, Routes } from 'react-router'
import Footer from './components/Footer'
import Header from './components/Header'
import { CurrentUserProvider } from './context/CurrentUserContext'
import AboutPage from './pages/AboutPage'
import AccountPage from './pages/AccountPage'
import ContactPage from './pages/ContactPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'

function App() {
  return (
    <CurrentUserProvider>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
      <Footer />
    </CurrentUserProvider>
  )
}

export default App
