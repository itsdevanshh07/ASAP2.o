import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Calendar, Share2, Download } from 'lucide-react';
import QRCode from 'react-qr-code';

const CredentialView = () => {
    const { id } = useParams(); // Verification ID
    const [credential, setCredential] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const apiBase = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const fetchCredential = async () => {
            try {
                const { data } = await axios.get(`${apiBase}/api/gamification/credential/verify/${id}`);
                if (data.success) {
                    setCredential(data.credential);
                } else {
                    setError('Credential not found');
                }
            } catch (err) {
                setError('Failed to verify credential');
            } finally {
                setLoading(false);
            }
        };
        fetchCredential();
    }, [id, apiBase]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Verifying...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
            <div className="max-w-3xl w-full bg-white dark:bg-card-bg shadow-2xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 relative">

                {/* Header Pattern */}
                <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                    <div className="absolute -bottom-12 left-8">
                        <img
                            src={credential.userId?.image || 'https://via.placeholder.com/100'}
                            alt="User"
                            className="w-24 h-24 rounded-full border-4 border-white dark:border-card-bg shadow-lg"
                        />
                    </div>
                </div>

                <div className="pt-16 px-8 pb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{credential.title}</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Issued to <span className="font-semibold text-gray-900 dark:text-white">{credential.userId?.name}</span></p>
                        </div>
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full border border-green-200 dark:border-green-800">
                            <CheckCircle size={16} />
                            <span className="text-sm font-medium">Verified</span>
                        </div>
                    </div>

                    <p className="mt-6 text-gray-600 dark:text-gray-300 leading-relaxed">
                        {credential.description || "This credential certifies that the holder has successfully demonstrated mastery in the specified skills and requirements."}
                    </p>

                    {/* Skills */}
                    {credential.skills && credential.skills.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Skills Verified</h3>
                            <div className="flex flex-wrap gap-2">
                                {credential.skills.map(skill => (
                                    <span key={skill} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 dark:border-gray-700 pt-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <Calendar className="text-gray-400" size={20} />
                                <div>
                                    <p className="text-xs text-gray-500">Issued On</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{new Date(credential.issueDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">ID</div>
                                <div>
                                    <p className="text-xs text-gray-500">Credential ID</p>
                                    <p className="font-mono text-sm text-gray-900 dark:text-white">{credential.verificationId}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200">
                                <QRCode value={window.location.href} size={100} />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex gap-4">
                        <button className="flex-1 bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                            <Share2 size={18} /> Share Credential
                        </button>
                        <button className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2.5 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                            <Download size={18} /> Download PDF
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CredentialView;
