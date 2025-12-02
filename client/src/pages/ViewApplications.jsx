import { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import { FileText, MapPin, Download, CheckCircle, XCircle, MoreHorizontal, User } from 'lucide-react'

const ViewApplications = () => {

  const { backendUrl, companyToken } = useContext(AppContext)
  const [applicants, setApplicants] = useState(false)

  // Function to fetch company Job Applications data 
  const fetchCompanyJobApplications = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/company/applicants',
        { headers: { token: companyToken } }
      )
      if (data.success) {
        setApplicants(data.applications.reverse())
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Function to Update Job Applications Status 
  const changeJobApplicationStatus = async (id, status) => {
    try {
      const { data } = await axios.post(backendUrl + '/api/company/change-status',
        { id, status },
        { headers: { token: companyToken } }
      )
      if (data.success) {
        fetchCompanyJobApplications()
        toast.success(`Application ${status}`)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (companyToken) {
      fetchCompanyJobApplications()
    }
  }, [companyToken])

  if (!applicants) {
    return <Loading />
  }

  return (
    <div className='max-w-7xl mx-auto'>

      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Applications</h1>
        <p className='text-gray-500 dark:text-gray-400 mt-1'>Manage and review candidate applications.</p>
      </div>

      {/* Content */}
      <div className='bg-white dark:bg-card-bg rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden'>
        {applicants.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 px-4 text-center'>
            <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4'>
              <FileText size={32} className='text-gray-400' />
            </div>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white'>No applications yet</h3>
            <p className='text-gray-500 dark:text-gray-400 mt-1 max-w-sm'>
              Applications for your posted jobs will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop View: Table */}
            <div className='hidden md:block overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                <thead className='bg-gray-50 dark:bg-gray-800/50'>
                  <tr>
                    <th scope="col" className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      #
                    </th>
                    <th scope="col" className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Candidate
                    </th>
                    <th scope="col" className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Job Title
                    </th>
                    <th scope="col" className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Location
                    </th>
                    <th scope="col" className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Resume
                    </th>
                    <th scope="col" className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white dark:bg-card-bg divide-y divide-gray-200 dark:divide-gray-700'>
                  {applicants.filter(item => item.jobId && item.userId).map((applicant, index) => (
                    <tr key={index} className='hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors'>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                        {index + 1}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          {applicant.userId.image ? (
                            <img className='h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-600' src={applicant.userId.image} alt="" />
                          ) : (
                            <div className='h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400'>
                              <User size={20} />
                            </div>
                          )}
                          <div className='ml-4'>
                            <div className='text-sm font-medium text-gray-900 dark:text-white'>{applicant.userId.name}</div>
                            <div className='text-xs text-gray-500 dark:text-gray-400'>Applied recently</div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900 dark:text-white'>{applicant.jobId.title}</div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center text-sm text-gray-500 dark:text-gray-400'>
                          <MapPin size={16} className='mr-2' />
                          {applicant.jobId.location}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <a
                          href={applicant.userId.resume}
                          target='_blank'
                          rel="noreferrer"
                          className='inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
                        >
                          <Download size={14} className='mr-2' />
                          Resume
                        </a>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        {applicant.status === "Pending" ? (
                          <div className='flex items-center gap-2'>
                            <button
                              onClick={() => changeJobApplicationStatus(applicant._id, 'Accepted')}
                              className='flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-all text-xs font-medium dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/30'
                              title="Accept Application"
                            >
                              <CheckCircle size={14} />
                              Accept
                            </button>
                            <button
                              onClick={() => changeJobApplicationStatus(applicant._id, 'Rejected')}
                              className='flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all text-xs font-medium dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30'
                              title="Reject Application"
                            >
                              <XCircle size={14} />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${applicant.status === 'Accepted'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                            {applicant.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Cards */}
            <div className='md:hidden flex flex-col divide-y divide-gray-200 dark:divide-gray-700'>
              {applicants.filter(item => item.jobId && item.userId).map((applicant, index) => (
                <div key={index} className='p-4 space-y-4'>
                  <div className='flex items-center gap-3'>
                    {applicant.userId.image ? (
                      <img className='h-12 w-12 rounded-full object-cover border border-gray-200 dark:border-gray-600' src={applicant.userId.image} alt="" />
                    ) : (
                      <div className='h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400'>
                        <User size={24} />
                      </div>
                    )}
                    <div>
                      <h4 className='font-medium text-gray-900 dark:text-white'>{applicant.userId.name}</h4>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>Applied for <span className='font-medium text-gray-700 dark:text-gray-300'>{applicant.jobId.title}</span></p>
                    </div>
                  </div>

                  <div className='flex justify-between items-center text-sm'>
                    <div className='flex items-center text-gray-500 dark:text-gray-400'>
                      <MapPin size={14} className='mr-1.5' />
                      {applicant.jobId.location}
                    </div>
                    <a
                      href={applicant.userId.resume}
                      target='_blank'
                      rel="noreferrer"
                      className='inline-flex items-center text-primary hover:text-primary/80 text-xs font-medium'
                    >
                      <Download size={14} className='mr-1' />
                      Download Resume
                    </a>
                  </div>

                  <div className='pt-2 border-t border-gray-100 dark:border-gray-700/50'>
                    {applicant.status === "Pending" ? (
                      <div className='flex gap-3'>
                        <button
                          onClick={() => changeJobApplicationStatus(applicant._id, 'Accepted')}
                          className='flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-all text-sm font-medium dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                        >
                          <CheckCircle size={16} />
                          Accept
                        </button>
                        <button
                          onClick={() => changeJobApplicationStatus(applicant._id, 'Rejected')}
                          className='flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-all text-sm font-medium dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className='flex justify-between items-center'>
                        <span className='text-sm text-gray-500 dark:text-gray-400'>Status</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${applicant.status === 'Accepted'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                          {applicant.status}
                        </span>
                      </div>
                    )}
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

export default ViewApplications