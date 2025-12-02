import React, { useState } from 'react';
import { FileText, Download, Sparkles, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, slideUp, scaleIn } from '../utils/animations';
import { useMotion } from '../context/MotionContext';

export function ResumeBuilder({ apiBase = '' }) {
  const base = (apiBase && apiBase.trim()) || '';
  const resumeUrl = `${base}/api/resume`.replace(/([^:]\/)(\/+)/g, '$1/');

  const [form, setForm] = useState({
    name: '', email: '', phone: '', summary: '', skills: [''], experiences: [{ title: '', company: '', from: '', to: '', desc: [''] }], education: [{ degree: '', school: '', year: '' }], projects: [{ name: '', desc: '' }], certifications: ['']
  });
  const [generating, setGenerating] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [userNotes, setUserNotes] = useState('');
  const [template, setTemplate] = useState('combination'); // 'chronological' | 'functional' | 'combination' | 'ats'
  const [pdfUrl, setPdfUrl] = useState(null);

  const { animationsEnabled } = useMotion();

  function updatePath(path, value) {
    const copy = JSON.parse(JSON.stringify(form));
    const keys = path.replace(/\]/g, '').split(/\[|\./).filter(Boolean);
    let cur = copy;
    for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
    cur[keys[keys.length - 1]] = value;
    setForm(copy);
  }

  function addField(key) {
    const copy = JSON.parse(JSON.stringify(form));
    if (key === 'skills') copy.skills.push('');
    if (key === 'certifications') copy.certifications.push('');
    if (key === 'experiences') copy.experiences.push({ title: '', company: '', from: '', to: '', desc: [''] });
    if (key === 'education') copy.education.push({ degree: '', school: '', year: '' });
    if (key === 'projects') copy.projects.push({ name: '', desc: '' });
    setForm(copy);
  }

  async function handleAiGenerate() {
    if (!userNotes.trim()) return;
    setAiLoading(true);
    setPdfUrl(null);
    try {
      const res = await fetch(resumeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userNotes, template })
      });
      const data = await res.json();
      if (data.resume) {
        setForm(prev => ({ ...prev, ...data.resume }));
        if (data.pdfUrl) {
          const url = data.pdfUrl.startsWith('http') ? data.pdfUrl : `${base}${data.pdfUrl}`;
          setPdfUrl(url);
        }
        setShowAiModal(false);
      } else {
        alert('AI could not generate a resume. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to AI service.');
    } finally {
      setAiLoading(false);
    }
  }

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!pdfUrl) return;

    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Resume_${form.name.replace(/\s+/g, '_') || 'Generated'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to opening in new tab if blob fetch fails
      window.open(pdfUrl, '_blank');
    }
  };

  const handleManualSubmit = async () => {
    setGenerating(true);
    setPdfUrl(null);
    try {
      const res = await fetch(resumeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData: form, template })
      });
      const data = await res.json();
      if (data.pdfUrl) {
        const url = data.pdfUrl.startsWith('http') ? data.pdfUrl : `${base}${data.pdfUrl}`;
        setPdfUrl(url);
      } else {
        alert('Could not generate PDF. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.div
      className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-lg flex gap-6 dark:bg-card-bg"
      initial={animationsEnabled ? "hidden" : "visible"}
      animate="visible"
      variants={fadeIn}
    >
      {/* Left: Form */}
      <div className="flex-1 overflow-y-auto max-h-[800px] pr-2">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 dark:text-white">
            <FileText className="text-blue-600" /> Resume Builder v2
          </h2>
          <div className="flex gap-3">
            <select
              value={template}
              onChange={e => setTemplate(e.target.value)}
              className="border rounded-lg px-3 py-2 bg-gray-50 text-sm dark:bg-dark-bg dark:border-gray-700 dark:text-white"
            >
              <option value="combination">Combination (Default)</option>
              <option value="chronological">Chronological</option>
              <option value="functional">Functional</option>
              <option value="ats">ATS-Friendly</option>
            </select>
            <motion.button
              whileHover={animationsEnabled ? { scale: 1.02 } : {}}
              whileTap={animationsEnabled ? { scale: 0.98 } : {}}
              onClick={() => setShowAiModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Sparkles size={18} /> AI Auto-Fill
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={form.name} onChange={e => updatePath('name', e.target.value)} placeholder="Full Name" className="border rounded-lg p-3 w-full dark:bg-dark-bg dark:border-gray-700 dark:text-white" />
            <input value={form.email} onChange={e => updatePath('email', e.target.value)} placeholder="Email Address" className="border rounded-lg p-3 w-full dark:bg-dark-bg dark:border-gray-700 dark:text-white" />
            <input value={form.phone} onChange={e => updatePath('phone', e.target.value)} placeholder="Phone Number" className="border rounded-lg p-3 w-full dark:bg-dark-bg dark:border-gray-700 dark:text-white" />
          </div>

          <textarea value={form.summary} onChange={e => updatePath('summary', e.target.value)} placeholder="Professional Summary" className="border rounded-lg p-3 w-full h-24 dark:bg-dark-bg dark:border-gray-700 dark:text-white" />

          {/* Skills */}
          <div className="bg-gray-50 p-4 rounded-xl dark:bg-dark-bg">
            <div className="font-semibold mb-2 dark:text-white">Skills</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {form.skills.map((s, i) => (
                <input key={i} value={s} onChange={e => updatePath(`skills[${i}]`, e.target.value)} placeholder={`Skill ${i + 1}`} className="border rounded p-2 dark:bg-card-bg dark:border-gray-700 dark:text-white" />
              ))}
            </div>
            <button type="button" onClick={() => addField('skills')} className="mt-3 text-sm text-purple-600 hover:underline">+ Add Skill</button>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleManualSubmit}
            disabled={generating}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? <Loader2 className="animate-spin" size={20} /> : <FileText size={20} />}
            {generating ? 'Generating PDF...' : 'Submit & Generate PDF'}
          </button>
        </div>
      </div>

      {/* Right: Preview */}
      <motion.div
        className="w-[400px] bg-gray-100 rounded-xl p-4 flex flex-col items-center justify-center border border-gray-200 dark:bg-dark-bg dark:border-gray-700"
        initial={animationsEnabled ? { opacity: 0, x: 20 } : {}}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        {pdfUrl ? (
          <motion.div
            className="w-full h-full flex flex-col gap-4"
            initial={animationsEnabled ? "hidden" : "visible"}
            animate="visible"
            variants={scaleIn}
          >
            <iframe src={pdfUrl} className="w-full flex-1 rounded-lg border shadow-sm" title="Resume Preview" />
            <button
              onClick={handleDownload}
              className="w-full py-2 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={18} /> Download PDF
            </button>
          </motion.div>
        ) : (
          <div className="text-center text-gray-500">
            <FileText size={48} className="mx-auto mb-2 opacity-50" />
            <p>Generate a resume to see the preview here.</p>
          </div>
        )}
      </motion.div>

      {/* AI Modal */}
      <AnimatePresence>
        {showAiModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl dark:bg-card-bg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2 dark:text-white">
                  <Sparkles className="text-purple-600" /> AI Resume Assistant
                </h3>
                <button onClick={() => setShowAiModal(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
              </div>
              <p className="text-gray-600 mb-4 text-sm dark:text-gray-300">
                Paste your LinkedIn summary, rough notes, or a job description. The AI will generate a professional resume in the <strong>{template}</strong> format.
              </p>
              <textarea
                value={userNotes}
                onChange={e => setUserNotes(e.target.value)}
                placeholder="E.g. I am a software engineer with 3 years of experience..."
                className="w-full border rounded-xl p-3 h-40 mb-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-dark-bg dark:border-gray-700 dark:text-white"
              />
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowAiModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button
                  onClick={handleAiGenerate}
                  disabled={aiLoading || !userNotes.trim()}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {aiLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  {aiLoading ? 'Magic in progress...' : 'Generate Resume'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div >
  );
}
