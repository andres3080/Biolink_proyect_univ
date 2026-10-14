import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login/Login.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import PatientForm from './pages/Patients/PatientForm.jsx'
import PatientList from './pages/Patients/PatientList.jsx'
import PatientDetail from './pages/Patients/PatientDetail.jsx'
import OrderForm from './pages/Orders/OrderForm.jsx'
import OrderList from './pages/Orders/OrderList.jsx'
import SampleForm from './pages/Samples/SampleForm.jsx'
import SampleList from './pages/Samples/SampleList.jsx'
import ResultForm from './pages/Results/ResultForm.jsx'
import ResultList from './pages/Results/ResultList.jsx'
import ExamCatalog from './pages/Exams/ExamCatalog.jsx'
import EquipoList from './pages/Equipos/EquipoList.jsx'
import UserForm from './pages/Users/UserForm.jsx'
import Checkout from './pages/Billing/Checkout.jsx'
import PaymentResult from './pages/Billing/PaymentResult.jsx'
import Billing from './pages/Billing/Billing.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Asistente from './components/Asistente.jsx'

export default function App() {
  return (
    <>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pacientes"
        element={
          <ProtectedRoute>
            <PatientList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pacientes/:id"
        element={
          <ProtectedRoute>
            <PatientDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pacientes/nuevo"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'RECEPCIONISTA']}>
            <PatientForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ordenes"
        element={
          <ProtectedRoute>
            <OrderList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ordenes/nueva"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'RECEPCIONISTA']}>
            <OrderForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/muestras"
        element={
          <ProtectedRoute>
            <SampleList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/muestras/nueva"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'BIOANALISTA', 'RECEPCIONISTA']}>
            <SampleForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resultados"
        element={
          <ProtectedRoute>
            <ResultList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resultados/nuevo"
        element={
          <ProtectedRoute allowedRoles={['BIOANALISTA', 'ADMIN']}>
            <ResultForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/examenes"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ExamCatalog />
          </ProtectedRoute>
        }
      />
      <Route
        path="/equipos"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'BIOANALISTA']}>
            <EquipoList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/usuarios/nuevo"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <UserForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/facturacion"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Billing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pagos/resultado"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <PaymentResult />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <Asistente />
    </>
  )
}
