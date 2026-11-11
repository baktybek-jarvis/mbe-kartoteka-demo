import { createContext, useContext, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Registry from './pages/Registry.jsx'
import EmployeeCard from './pages/EmployeeCard.jsx'
import GuestReview from './pages/GuestReview.jsx'
import Structure from './pages/Structure.jsx'
import Forms from './pages/Forms.jsx'
import Characteristics from './pages/Characteristics.jsx'
import Reviews from './pages/Reviews.jsx'
import Access from './pages/Access.jsx'
import FillForm from './pages/FillForm.jsx'

const RoleContext = createContext({ role: 'hr', setRole: () => {} })
export const useRole = () => useContext(RoleContext)

export default function App() {
  const [role, setRole] = useState('hr')
  return (
    <RoleContext.Provider value={{ role, setRole }}>
      <Routes>
        <Route path="/review/:hotel" element={<GuestReview />} />
        <Route path="/form/:id" element={<FillForm />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Registry />} />
          <Route path="/employee/:id" element={<EmployeeCard />} />
          <Route path="/structure" element={<Structure />} />
          <Route path="/forms" element={<Forms />} />
          <Route path="/characteristics" element={<Characteristics />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/access" element={<Access />} />
        </Route>
      </Routes>
    </RoleContext.Provider>
  )
}
