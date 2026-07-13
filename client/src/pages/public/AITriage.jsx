import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import PageTransition from '../../components/common/PageTransition';

export default function AITriage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      toast.error('Please describe your symptoms first.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await api.post('/ai/triage', { symptoms });
      if (response.data.success) {
        setResult(response.data.data);
      } else {
        toast.error(response.data.message || 'Analysis failed.');
      }
    } catch (error) {
      toast.error('An error occurred during triage analysis.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = () => {
    if (result && result.department) {
      navigate(`/patient/find-doctors?specialization=${encodeURIComponent(result.department)}`);
    } else {
      navigate('/patient/find-doctors');
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              {t('triage.title') || 'AI Triage Assistant'}
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              {t('triage.subtitle') || 'Describe your symptoms and our AI will recommend the right specialist.'}
            </p>
          </div>

          <GlassCard className="p-6 md:p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  What are your symptoms?
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                  placeholder={t('triage.placeholder') || 'e.g., I have a severe headache and fever since yesterday...'}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                />
              </div>

              <Button
                variant="primary"
                fullWidth
                onClick={handleAnalyze}
                loading={loading}
                disabled={!symptoms.trim() || loading}
              >
                {loading ? (t('triage.analyzing') || 'Analyzing...') : (t('triage.analyzeBtn') || 'Analyze Symptoms')}
              </Button>
            </div>
          </GlassCard>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard className="p-6 md:p-8 border-blue-500/30">
                <h3 className="text-xl font-semibold text-white mb-6">Triage Results</h3>
                
                <div className="grid gap-6 md:grid-cols-2 mb-8">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm text-slate-400 mb-1">{t('triage.department') || 'Recommended Department'}</p>
                    <p className="text-lg font-medium text-white">{result.department}</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm text-slate-400 mb-1">{t('triage.urgency') || 'Urgency Level'}</p>
                    <p className={`text-lg font-medium ${
                      result.urgency === 'High' ? 'text-red-400' : 
                      result.urgency === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {result.urgency}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-8">
                  <p className="text-sm text-blue-300 font-medium mb-2">{t('triage.advice') || 'Medical Advice'}</p>
                  <p className="text-blue-100/80 leading-relaxed">{result.recommendation}</p>
                </div>

                <div className="text-center">
                  <Button variant="primary" onClick={handleBook}>
                    {t('triage.bookBtn') || 'Book Appointment Now'}
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          )}

          <div className="text-center">
            <p className="text-xs text-slate-500 mt-8">
              {t('triage.disclaimer') || 'Disclaimer: This AI is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.'}
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
