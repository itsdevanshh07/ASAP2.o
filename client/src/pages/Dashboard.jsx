import { useContext, useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import asap_logo_light from '../assets/logo_rocket_generated.svg'
import asap_logo_dark from '../assets/logo_rocket_generated.svg'
import { useTheme } from '../context/ThemeContext'
import { Menu, X, Home, PlusSquare, FileText, LogOut, Users, Sun, Moon } from 'lucide-react'

const Dashboard = () => {

    const navigate = useNavigate()
    const location = useLocation()
    const { companyData, setCompanyData, setCompanyToken } = useContext(AppContext)
    const { theme, toggleTheme } = useTheme()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    // Function to logout for company
    const logout = () => {
        setCompanyToken(null)
        localStorage.removeItem('companyToken')
        setCompanyData(null)
        navigate('/')
    }

    useEffect(() => {
        if (companyData && (location.pathname === '/dashboard' || location.pathname === '/dashboard/')) {
            navigate('/dashboard/company-dashboard')
        }
    }, [companyData, location.pathname])

    const navLinks = [
        { path: '/dashboard/company-dashboard', label: 'Dashboard', icon: Home },
        { path: '/dashboard/add-job', label: 'Add Job', icon: PlusSquare },
        { path: '/dashboard/manage-jobs', label: 'Manage Jobs', icon: FileText },
        { path: '/dashboard/view-applications', label: 'View Applications', icon: Users },
    ]

    return (
        <div className='min-h-screen bg-light-bg dark:bg-dark-bg'>

            {/* Navbar for Recruiter Panel */}
            <div className='shadow-sm border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-card-bg sticky top-0 z-50'>
                <div className='px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center'>
                    <div className='flex items-center gap-4'>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className='lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                        >
                            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <img
                            onClick={() => navigate('/')}
                            className='h-8 sm:h-10 cursor-pointer'
                            src={theme === 'dark' ? asap_logo_dark : asap_logo_light}
                            alt="ASAP Logo"
                        />
                    </div>

                    {companyData && (
                        <div className='flex items-center gap-4'>
                            <p className='hidden sm:block font-medium text-gray-700 dark:text-gray-200'>
                                Welcome, {companyData.name}
                            </p>
                            <div className='flex items-center gap-3'>
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    title="Toggle Theme"
                                >
                                    {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
                                </button>
                                <img
                                    className='w-10 h-10 border-2 border-gray-200 dark:border-gray-600 rounded-full object-cover'
                                    src={companyData.image}
                                    alt="Company Logo"
                                />
                                <button
                                    onClick={logout}
                                    className='flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-600 bg-white dark:bg-card-bg'
                                    title="Logout"
                                >
                                    <LogOut size={18} />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className='flex'>

                {/* Sidebar */}
                <div className={`
                    fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-card-bg border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-[calc(100vh-4rem)]
                    ${isSidebarOpen ? 'translate-x-0 mt-16' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <nav className='mt-5 px-2 space-y-1'>
                        {navLinks.map((link) => {
                            const Icon = link.icon
                            return (
                                <NavLink
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={({ isActive }) => `
                                        group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors
                                        ${isActive
                                            ? 'bg-primary/10 text-primary border-r-4 border-primary'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                        }
                                    `}
                                >
                                    <Icon className={`mr-3 h-5 w-5 ${location.pathname === link.path ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}`} />
                                    {link.label}
                                </NavLink>
                            )
                        })}
                    </nav>
                </div>

                {/* Overlay for mobile sidebar */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <div className='flex-1 min-w-0 bg-light-bg dark:bg-dark-bg p-4 sm:p-6 lg:p-8'>
                    <Outlet />
                </div>

            </div>

        </div>
    )
}

export default Dashboard