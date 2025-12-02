import { useContext, useEffect, useState } from 'react'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import { MapPin, Users, Calendar, Eye, EyeOff, Plus, Briefcase } from 'lucide-react'

const ManageJobs = () => {

  const navigate = useNavigate()
  const [jobs, setJobs] = useState(false)
  const { backendUrl, companyToken } = useContext(AppContext)

  // Function to fetch company Job Applications data 
  const fetchCompanyJobs = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/company/list-jobs',
        { headers: { token: companyToken } }
      )
      if (data.success) {
        setJobs(data.jobsData.reverse())
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Function to change Job Visibility 
  const changeJobVisiblity = async (id) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/company/change-visiblity',
        { id },
        { headers: { token: companyToken } }
      )
      if (data.success) {
        toast.success(data.message)
        fetchCompanyJobs()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (companyToken) {
      fetchCompanyJobs()
    }
  }, [companyToken])

  if (!jobs) {
    return <Loading />
  }

  return (
    <div className='max-w-7xl mx-auto'>

      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Manage Jobs</h1>
          <p className='text-gray-500 dark:text-gray-400 mt-1'>View, edit and publish your job listings.</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/add-job')}
          className='flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors shadow-md'
        >
          <Plus size={20} />
          <span className='hidden sm:inline'>Add new job</span>
        </button>
      </div>

      {/* Content */}
      <div className='bg-white dark:bg-card-bg rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden'>
        {jobs.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 px-4 text-center'>
            <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4'>
              <Briefcase size={32} className='text-gray-400' />
            </div>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white'>No jobs posted yet</h3>
            <p className='text-gray-500 dark:text-gray-400 mt-1 max-w-sm'>
              Get started by creating your first job listing to attract top talent.
            </p>
            <button
              onClick={() => navigate('/dashboard/add-job')}
              className='mt-6 text-primary hover:text-primary/80 font-medium'
            >
              Create your first job &rarr;
            </button>
          </div>
        ) : (
          <>
            {/* Desktop View: Table */}
            <div className='hidden md:block overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                <thead className='bg-gray-50 dark:bg-gray-800/50'>
                  <tr>
                    <th scope="col" className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Job Title
                    </th>
                    <th scope="col" className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Date
                    </th>
                    <th scope="col" className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Location
                    </th>
                    <th scope="col" className='px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Applicants
                    </th>
                    <th scope="col" className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Visible
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white dark:bg-card-bg divide-y divide-gray-200 dark:divide-gray-700'>
                  {jobs.map((job, index) => (
                    <tr key={index} className='hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div className='flex-shrink-0 h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold'>
                            {job.title.charAt(0)}
                          </div>
                          <div className='ml-4'>
                            <div className='text-sm font-medium text-gray-900 dark:text-white'>{job.title}</div>
                            <div className='text-xs text-gray-500 dark:text-gray-400'>{job.category || 'General'}</div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center text-sm text-gray-500 dark:text-gray-400'>
                          <Calendar size={16} className='mr-2' />
                          {moment(job.date).format('ll')}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center text-sm text-gray-500 dark:text-gray-400'>
                          <MapPin size={16} className='mr-2' />
                          {job.location}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-center'>
                        <div className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'>
                          <Users size={12} className='mr-1' />
                          {job.applicants}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={job.visible}
                            onChange={() => changeJobVisiblity(job._id)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 dark:peer-focus:ring-primary/80 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                          <span className="ml-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            {job.visible ? 'Active' : 'Hidden'}
                          </span>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Cards */}
            <div className='md:hidden flex flex-col divide-y divide-gray-200 dark:divide-gray-700'>
              {jobs.map((job, index) => (
                <div key={index} className='p-4 space-y-3'>
                  <div className='flex items-center gap-3'>
                    <div className='flex-shrink-0 h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold'>
                      {job.title.charAt(0)}
                    </div>
                    <div>
                      <h4 className='font-medium text-gray-900 dark:text-white'>{job.title}</h4>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>{job.category || 'General'}</p>
                    </div>
                  </div>

                  <div className='flex justify-between items-center text-sm'>
                    <div className='flex items-center text-gray-500 dark:text-gray-400'>
                      <Calendar size={14} className='mr-1.5' />
                      {moment(job.date).format('ll')}
                    </div>
                    <div className='flex items-center text-gray-500 dark:text-gray-400'>
                      <MapPin size={14} className='mr-1.5' />
                      {job.location}
                    </div>
                  </div>

                  <div className='flex justify-between items-center pt-2'>
                    <div className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'>
                      <Users size={12} className='mr-1' />
                      {job.applicants} Applicants
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={job.visible}
                        onChange={() => changeJobVisiblity(job._id)}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ManageJobs