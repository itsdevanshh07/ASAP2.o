import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { Link, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import { variants } from '../lib/motion.jsx'
import { useMotion } from '../context/MotionContext'
import { useTheme } from '../context/ThemeContext'
import { Moon, Sun, Menu, X } from 'lucide-react'
import asap_logo_light from '../assets/logo_rocket_generated.svg'
import asap_logo_dark from '../assets/logo_rocket_generated.svg'

const Navbar = () => {

    const { openSignIn } = useClerk()
    const { user } = useUser()
    const { userData } = useContext(AppContext)
    const navigate = useNavigate()
    const { setShowRecruiterLogin } = useContext(AppContext)
    const { animationsEnabled } = useMotion()
    const { theme, toggleTheme } = useTheme()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
    const closeMenu = () => setIsMenuOpen(false)

    return (
        <motion.div
            className='shadow py-4 bg-cream dark:bg-navy-dark dark:border-b dark:border-navy transition-colors duration-300 sticky top-0 z-50'
            initial={animationsEnabled ? "hidden" : "visible"}
            animate="visible"
            variants={variants.slideUp}
        >
            <div className='container px-4 2xl:px-20 mx-auto flex justify-between items-center'>
                <img
                    onClick={() => navigate('/')}
                    className='cursor-pointer h-16 sm:h-20 hover:scale-105 transition-transform duration-300'
                    src={theme === 'dark' ? asap_logo_dark : asap_logo_light}
                    alt="ASAP Logo"
                />

                {/* Desktop Menu */}
                <div className='hidden md:flex items-center gap-4 lg:gap-6'>
                    <Link to={'/'} className='text-navy dark:text-sky hover:text-sky dark:hover:text-cream transition-colors font-medium whitespace-nowrap'>
                        Home
                    </Link>
                    <Link to={'/resume-builder'} className='text-navy dark:text-sky hover:text-sky dark:hover:text-cream transition-colors font-medium whitespace-nowrap'>
                        Resume Builder
                    </Link>
                    <Link to={'/profile/achievements'} className='text-navy dark:text-sky hover:text-sky dark:hover:text-cream transition-colors font-medium whitespace-nowrap'>
                        Achievements
                    </Link>
                    <button
                        onClick={toggleTheme}
                        className='p-2 rounded-full hover:bg-white dark:hover:bg-navy transition-colors text-navy dark:text-sky'
                        aria-label="Toggle Theme"
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    {
                        user
                            ? <div className='flex items-center gap-3'>
                                {userData && (userData.role === 'admin' || userData.email === 'undhyani07@gmail.com') && (
                                    <Link to={'/admin/dashboard'} className='text-navy dark:text-sky hover:text-sky dark:hover:text-cream transition-colors font-bold whitespace-nowrap'>
                                        Admin Panel
                                    </Link>
                                )}
                                <Link to={'/applications'} className='text-navy dark:text-sky hover:text-sky dark:hover:text-cream transition-colors whitespace-nowrap'>Applied Jobs</Link>
                                <p className='text-sky/50 hidden lg:block'>|</p>
                                <p className='text-navy dark:text-cream hidden lg:block whitespace-nowrap'>Hi, {user.firstName}</p>
                                <UserButton />
                            </div>
                            : <div className='flex gap-4'>
                                <button onClick={e => setShowRecruiterLogin(true)} className='text-navy dark:text-sky hover:text-sky dark:hover:text-cream transition-colors whitespace-nowrap'>Recruiter Login</button>
                                <button onClick={e => openSignIn()} className='bg-navy hover:bg-sky text-white px-6 py-2 rounded-full transition-colors shadow-md hover:shadow-lg whitespace-nowrap'>Login</button>
                            </div>
                    }
                </div>

                {/* Mobile Menu Toggle */}
                <div className='md:hidden flex items-center gap-4'>
                    <button
                        onClick={toggleTheme}
                        className='p-2 rounded-full hover:bg-white dark:hover:bg-navy transition-colors text-navy dark:text-sky'
                        aria-label="Toggle Theme"
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    {user && <UserButton />}
                    <button onClick={toggleMenu} className='text-navy dark:text-sky p-2'>
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className='fixed inset-0 z-40 bg-cream dark:bg-navy-dark md:hidden flex flex-col'
                    >
                        <div className='flex justify-between items-center p-4 border-b border-gray-200 dark:border-navy'>
                            <img
                                onClick={() => { navigate('/'); closeMenu(); }}
                                className='h-12'
                                src={theme === 'dark' ? asap_logo_dark : asap_logo_light}
                                alt="ASAP Logo"
                            />
                            <button onClick={closeMenu} className='text-navy dark:text-sky p-2'>
                                <X size={32} />
                            </button>
                        </div>

                        <div className='flex flex-col p-6 gap-6 overflow-y-auto'>
                            <Link to={'/'} onClick={closeMenu} className='text-2xl font-medium text-navy dark:text-sky hover:text-sky dark:hover:text-cream transition-colors'>
                                Home
                            </Link>
                            <Link to={'/resume-builder'} onClick={closeMenu} className='text-2xl font-medium text-navy dark:text-sky hover:text-sky dark:hover:text-cream transition-colors'>
                                Resume Builder
                            </Link>
                            <Link to={'/profile/achievements'} onClick={closeMenu} className='text-2xl font-medium text-navy dark:text-sky hover:text-sky dark:hover:text-cream transition-colors'>
                                Achievements
                            </Link>

                            {user && (
                                <>
                                    {userData && (userData.role === 'admin' || userData.email === 'undhyani07@gmail.com') && (
                                        <Link to={'/admin/dashboard'} onClick={closeMenu} className='text-2xl font-bold text-navy dark:text-sky hover:text-sky dark:hover:text-cream transition-colors'>
                                            Admin Panel
                                        </Link>
                                    )}
                                    <Link to={'/applications'} onClick={closeMenu} className='text-2xl font-medium text-navy dark:text-sky hover:text-sky dark:hover:text-cream transition-colors'>
                                        Applied Jobs
                                    </Link>
                                </>
                            )}

                            {!user && (
                                <div className='flex flex-col gap-4 mt-4'>
                                    <button
                                        onClick={() => { setShowRecruiterLogin(true); closeMenu(); }}
                                        className='text-left text-xl font-medium text-navy dark:text-sky hover:text-sky dark:hover:text-cream transition-colors'
                                    >
                                        Recruiter Login
                                    </button>
                                    <button
                                        onClick={() => { openSignIn(); closeMenu(); }}
                                        className='bg-navy hover:bg-sky text-white text-xl px-8 py-3 rounded-full transition-colors shadow-lg w-full text-center'
                                    >
                                        Login
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default Navbar