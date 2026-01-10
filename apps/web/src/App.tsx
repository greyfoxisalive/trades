import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { HomePage } from './routes/HomePage'
import { TradeOffersPage } from './routes/TradeOffersPage'
import { CreateTradePage } from './routes/CreateTradePage'
import { ProfilePage } from './routes/ProfilePage'
import { NavBar } from './components/NavBar'

function AppRoutes() {
  const location = useLocation()
  
  return (
    <>
      <Routes location={location}>
        <Route path="/" element={<HomePage key={location.pathname} />} />
        <Route path="/trades" element={<TradeOffersPage key={location.pathname} />} />
        <Route path="/create" element={<CreateTradePage key={location.pathname} />} />
        <Route path="/profile" element={<ProfilePage key={location.pathname} />} />
      </Routes>
      <NavBar />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
