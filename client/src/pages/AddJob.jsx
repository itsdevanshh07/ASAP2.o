import { useContext, useEffect, useRef, useState } from 'react'
import Quill from 'quill'
import { JobCategories, JobLocations } from '../assets/assets';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, Layers, FileText, IndianRupee } from 'lucide-react';

const AddJob = () => {

    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('Bangalore');
    const [category, setCategory] = useState('Programming');
    const [level, setLevel] = useState('Beginner level');
    const [salary, setSalary] = useState(0);
    const [currency, setCurrency] = useState('USD'); // 'USD' or 'INR'

    const editorRef = useRef(null)
    const quillRef = useRef(null)
    const navigate = useNavigate()

    const { backendUrl, companyToken } = useContext(AppContext)

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        try {

            const description = quillRef.current.root.innerHTML

            const { data } = await axios.post(backendUrl + '/api/company/post-job',
                { title, description, location, salary, category, level, currency },
                { headers: { token: companyToken } }
            )

            if (data.success) {
                toast.success(data.message)
                setTitle('')
                setSalary(0)
                quillRef.current.root.innerHTML = ""
                navigate('/dashboard/manage-jobs')
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        // Initiate Quill only once
        if (!quillRef.current && editorRef.current) {
            quillRef.current = new Quill(editorRef.current, {
                theme: 'snow',
            })
        }
    }, [])

    return (
        <div className='max-w-4xl mx-auto'>

            <div className='mb-6'>
                <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Post a Job</h1>
                <p className='text-gray-500 dark:text-gray-400 mt-1'>Create a new job listing to find the perfect candidate.</p>
            </div>

            <form onSubmit={onSubmitHandler} className='bg-white dark:bg-card-bg rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8'>

                <div className='space-y-6'>

                    {/* Job Title */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Job Title</label>
                        <div className='relative'>
                            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                <Briefcase size={18} className='text-gray-400' />
                            </div>
                            <input
                                type="text"
                                placeholder='e.g. Senior Frontend Developer'
                                onChange={e => setTitle(e.target.value)}
                                value={title}
                                required
                                className='block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-800 dark:text-white transition-colors'
                            />
                        </div>
                    </div>

                    {/* Job Description */}
                    <div>
                        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Job Description</label>
                        <div className='border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800'>
                            <div ref={editorRef} className='h-64 dark:text-white'></div>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>

                        {/* Job Category */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Job Category</label>
                            <div className='relative'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <Layers size={18} className='text-gray-400' />
                                </div>
                                <select
                                    className='block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-800 dark:text-white transition-colors appearance-none'
                                    onChange={e => setCategory(e.target.value)}
                                >
                                    {JobCategories.map((category, index) => (
                                        <option key={index} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Job Location */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Job Location</label>
                            <div className='relative'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <MapPin size={18} className='text-gray-400' />
                                </div>
                                <select
                                    className='block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-800 dark:text-white transition-colors appearance-none'
                                    onChange={e => setLocation(e.target.value)}
                                >
                                    {JobLocations.map((location, index) => (
                                        <option key={index} value={location}>{location}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Job Level */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Job Level</label>
                            <div className='relative'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <FileText size={18} className='text-gray-400' />
                                </div>
                                <select
                                    className='block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-800 dark:text-white transition-colors appearance-none'
                                    onChange={e => setLevel(e.target.value)}
                                >
                                    <option value="Beginner level">Beginner level</option>
                                    <option value="Intermediate level">Intermediate level</option>
                                    <option value="Senior level">Senior level</option>
                                </select>
                            </div>
                        </div>

                        {/* Job Salary */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>Job Salary</label>
                            <div className='flex gap-2'>
                                <div className='relative w-32'>
                                    <select
                                        className='block w-full pl-3 pr-8 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-800 dark:text-white transition-colors appearance-none'
                                        onChange={e => setCurrency(e.target.value)}
                                        value={currency}
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="INR">INR (₹)</option>
                                    </select>
                                    <div className='absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none'>
                                        <span className="text-gray-500 text-xs">▼</span>
                                    </div>
                                </div>
                                <div className='relative flex-1'>
                                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                        {currency === 'USD' ? (
                                            <DollarSign size={18} className='text-gray-400' />
                                        ) : (
                                            <IndianRupee size={18} className='text-gray-400' />
                                        )}
                                    </div>
                                    <input
                                        min={0}
                                        className='block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-800 dark:text-white transition-colors'
                                        onChange={e => setSalary(e.target.value)}
                                        type="number"
                                        placeholder='e.g. 50000'
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className='pt-4'>
                        <button className='w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg shadow-md transition-colors focus:ring-4 focus:ring-primary/30'>
                            Post Job
                        </button>
                    </div>

                </div>
            </form>
        </div>
    )
}

export default AddJob