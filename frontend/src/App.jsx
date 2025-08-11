
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import PasswordReset from './pages/passwordReset'
import { useContext } from 'react'
import UserProvider from './Context/usercontext'
import Customize from './pages/Customize'
import { Home } from 'lucide-react'

function App() {
  const { users, setUsers } = useContext(UserProvider);

  return (
    <Routes>
      <Route path="/" element={(users?.assistantImage && users.assistantName) ? <Home /> : <Customize />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={!users ? <Login /> : <Home />} />
      <Route path="/passwordreset" element={<PasswordReset />} />
      <Route path="/customize" element={<Customize />} />
    </Routes>
  )
}

export default App
