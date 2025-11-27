// src/App.jsx
import { useContext } from 'react'
import { Route, Routes, Link, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import ApplyJob from './pages/ApplyJob'
import Applications from './pages/Applications'
import RecruiterLogin from './components/RecruiterLogin'
import { AppContext } from './context/AppContext'
import Dashboard from './pages/Dashboard'
import AddJob from './pages/AddJob'
import ManageJobs from './pages/ManageJobs'
import ViewApplications from './pages/ViewApplications'
import 'quill/dist/quill.snow.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// New imports — the components you'll add below
import ChatbotPanel from './components/ChatbotPanel'
import { ResumeBuilder } from './components/ResumeBuilder'
import { MotionProvider } from './context/MotionContext'
import { AnimatePresence } from 'framer-motion'
import PageTransition from './components/PageTransition'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { ThemeProvider } from './context/ThemeContext'

const AppContent = () => {
  const { showRecruiterLogin, companyToken } = useContext(AppContext)
  const location = useLocation();

  return (
    <div>
      {showRecruiterLogin && <RecruiterLogin />}
      <ToastContainer />

      {/* quick nav links to access the new tools */}
      {!location.pathname.startsWith('/dashboard') && <Navbar />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path='/' element={<PageTransition><Home /></PageTransition>} />
          <Route path='/apply-job/:id' element={<PageTransition><ApplyJob /></PageTransition>} />
          <Route path='/applications' element={<PageTransition><Applications /></PageTransition>} />

          {/* Resume builder page */}
          <Route path='/resume-builder' element={
            <PageTransition>
              <div className="p-6">
                <h1 className="text-2xl font-semibold mb-4">Resume Builder</h1>
                <ResumeBuilder apiBase={import.meta.env.VITE_BACKEND_URL || 'https://asap2-o.onrender.com'} />
              </div>
            </PageTransition>
          } />

          <Route path='/dashboard' element={<PageTransition><Dashboard /></PageTransition>}>
            {
              companyToken ? <>
                <Route path='add-job' element={<AddJob />} />
                <Route path='manage-jobs' element={<ManageJobs />} />
                <Route path='view-applications' element={<ViewApplications />} />
              </> : null
            }
          </Route>
        </Routes>
      </AnimatePresence>

      {/* Floating Chatbot Widget */}
      {!location.pathname.startsWith('/dashboard') && <ChatbotPanel apiBase={import.meta.env.VITE_BACKEND_URL || 'https://asap2-o.onrender.com'} />}
      {!location.pathname.startsWith('/dashboard') && <Footer />}
    </div>
  )
}

const App = () => {
  return (
    <ThemeProvider>
      <MotionProvider>
        <AppContent />
      </MotionProvider>
    </ThemeProvider>
  )
}

export default App
