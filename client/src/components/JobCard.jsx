import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMotion } from '../context/MotionContext'
import { variants } from '../lib/motion.jsx'

const JobCard = ({ job }) => {

  const navigate = useNavigate()
  const { animationsEnabled } = useMotion()

  return (
    <motion.div
      className='border border-sky/20 p-6 shadow rounded-lg bg-cream dark:bg-navy dark:border-sky/30 hover:shadow-lg transition-shadow'
      initial={animationsEnabled ? "hidden" : "visible"}
      whileInView="visible"
      viewport={{ once: true }}
      variants={variants.scaleIn}
      whileHover={animationsEnabled ? { scale: 1.01, boxShadow: "0px 10px 20px rgba(124, 58, 237, 0.2)" } : {}}
      transition={{ duration: 0.2 }}
    >
      <div className='flex justify-between items-center'>
        <img className='h-8' src={assets.company_icon} alt="" />
      </div>
      <h4 className='font-medium text-xl mt-2 text-navy dark:text-cream'>{job.title}</h4>
      <div className='flex flex-wrap items-center gap-3 mt-2 text-xs'>
        <span className='bg-sky/20 border border-sky px-4 py-1.5 rounded text-navy dark:bg-sky/10 dark:border-sky/50 dark:text-sky'>{job.location}</span>
        <span className='bg-cream border border-navy px-4 py-1.5 rounded text-navy dark:bg-navy-dark dark:border-sky dark:text-cream'>{job.level}</span>
      </div>
      <p className='text-navy/70 text-sm mt-4 dark:text-cream/70' dangerouslySetInnerHTML={{ __html: job.description.slice(0, 150) }}></p>
      <div className='mt-4 flex flex-wrap gap-4 text-sm'>
        <button onClick={() => { navigate(`/apply-job/${job._id}`); scrollTo(0, 0) }} className='bg-navy text-white px-4 py-2 rounded hover:bg-sky hover:text-navy transition-colors font-medium'>Apply now</button>
        <button onClick={() => { navigate(`/apply-job/${job._id}`); scrollTo(0, 0) }} className='text-navy border border-navy rounded px-4 py-2 dark:text-sky dark:border-sky hover:bg-navy hover:text-white dark:hover:bg-sky dark:hover:text-navy transition-colors'>Learn more</button>
      </div>
    </motion.div>
  )
}

export default JobCard