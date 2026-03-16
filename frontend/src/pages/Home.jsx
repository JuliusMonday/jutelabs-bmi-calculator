import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartPulse, 
  Weight, 
  Ruler, 
  ArrowRight, 
  Sparkles,
  Shield,
  Zap,
  RefreshCw,
  ArrowRightLeft,
  Calculator
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LoadingSpinner from '@/components/medical/LoadingSpinner';
import BMIResultCard from '@/components/medical/BMIResultCard';
import AIAdviceCard from '@/components/medical/AIAdviceCard';
import ErrorToast from '@/components/medical/ErrorToast';

export default function Home() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Height converter state
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [convertedHeight, setConvertedHeight] = useState(null);
  const [converting, setConverting] = useState(false);

  const handleConvertHeight = async () => {
    if (!feet && !inches) {
      setError('Please enter feet and/or inches to convert');
      return;
    }
    
    setConverting(true);
    
    try {
      const response = await axios.post('http://localhost:5001/api/convert-height', {
        feet: feet || 0,
        inches: inches || 0
      });

      if (response.data.success) {
        setConvertedHeight(response.data.meters);
      }
    } catch (err) {
      console.error('Conversion Error:', err);
      setError('Failed to convert height. Please try again.');
    } finally {
      setConverting(false);
    }
  };

  const applyConvertedHeight = () => {
    if (convertedHeight) {
      setHeight(convertedHeight.toString());
      setConvertedHeight(null);
      setFeet('');
      setInches('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!weight || !height) {
      setError('Please enter both weight and height');
      return;
    }

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (isNaN(weightNum) || isNaN(heightNum) || weightNum <= 0 || heightNum <= 0) {
      setError('Please enter valid positive numbers');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5001/api/calculate', {
        weight: weightNum,
        height: heightNum
      });

      if (response.data.success) {
        setResult(response.data.report);
      } else {
        setError('Failed to generate report. Please try again.');
      }
    } catch (err) {
      console.error('API Error:', err);
      if (err.code === 'ERR_NETWORK') {
        setError('Unable to connect to the server. Please ensure the backend is running on localhost:5001');
      } else {
        setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setWeight('');
    setHeight('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/30 to-emerald-50/40">
      {/* Error Toast */}
      {error && <ErrorToast message={error} onClose={() => setError(null)} />}

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-300 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <HeartPulse className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                JuTeLabs
              </h1>
            </div>
            <p className="text-xl text-teal-100 font-medium mb-2">Medical AI</p>
            <p className="text-teal-200/80 max-w-xl mx-auto">
              Advanced BMI analysis powered by artificial intelligence. 
              Get personalized nutrition recommendations in seconds.
            </p>
          </motion.div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path
              d="M0 60V20C240 50 480 60 720 50C960 40 1200 20 1440 30V60H0Z"
              className="fill-gray-50"
            />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12 -mt-4">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column - Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Calculate Your BMI</h2>
                <p className="text-gray-500">Enter your measurements to receive your personalized health report</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Weight Input */}
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                    <Weight className="w-4 h-4 text-teal-600" />
                    <span>Weight</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      min="1"
                      max="500"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="e.g., 70.5"
                      disabled={loading}
                      className="h-14 pl-5 pr-16 text-lg rounded-xl border-gray-200 focus:border-teal-500 focus:ring-teal-500/20 transition-all"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">kg</span>
                  </div>
                </div>

                {/* Height Input */}
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                    <Ruler className="w-4 h-4 text-teal-600" />
                    <span>Height</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="height"
                      type="number"
                      step="0.01"
                      min="0.5"
                      max="3"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="e.g., 1.75"
                      disabled={loading}
                      className="h-14 pl-5 pr-16 text-lg rounded-xl border-gray-200 focus:border-teal-500 focus:ring-teal-500/20 transition-all"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">m</span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading || !weight || !height}
                  className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-teal-500/25"
                >
                  {loading ? (
                    <span className="flex items-center space-x-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Analyzing...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5" />
                      <span>Generate AI Report</span>
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </form>

              {/* Feature badges */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-teal-50 rounded-full">
                    <Zap className="w-3.5 h-3.5 text-teal-600" />
                    <span className="text-xs font-medium text-teal-700">AI Powered</span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 rounded-full">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-medium text-emerald-700">Private & Secure</span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 rounded-full">
                    <HeartPulse className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700">Medical Grade</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Height Converter Card */}
            <Card className="mt-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-0 shadow-lg rounded-3xl">
              <div className="flex items-center space-x-3 mb-5">
                <div className="p-2.5 bg-amber-100 rounded-xl">
                  <ArrowRightLeft className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Height Converter</h3>
                  <p className="text-xs text-gray-500">Don't know your height in meters? Convert it here!</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Feet Input */}
                  <div className="space-y-2">
                    <Label htmlFor="feet" className="text-sm font-medium text-gray-600">
                      Feet
                    </Label>
                    <div className="relative">
                      <Input
                        id="feet"
                        type="number"
                        min="0"
                        max="8"
                        value={feet}
                        onChange={(e) => setFeet(e.target.value)}
                        placeholder="e.g., 5"
                        disabled={converting}
                        className="h-12 pl-4 pr-12 rounded-xl border-amber-200 focus:border-amber-500 focus:ring-amber-500/20 bg-white"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">ft</span>
                    </div>
                  </div>

                  {/* Inches Input */}
                  <div className="space-y-2">
                    <Label htmlFor="inches" className="text-sm font-medium text-gray-600">
                      Inches
                    </Label>
                    <div className="relative">
                      <Input
                        id="inches"
                        type="number"
                        min="0"
                        max="11"
                        step="0.5"
                        value={inches}
                        onChange={(e) => setInches(e.target.value)}
                        placeholder="e.g., 9"
                        disabled={converting}
                        className="h-12 pl-4 pr-12 rounded-xl border-amber-200 focus:border-amber-500 focus:ring-amber-500/20 bg-white"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">in</span>
                    </div>
                  </div>
                </div>

                {/* Convert Button */}
                <Button
                  type="button"
                  onClick={handleConvertHeight}
                  disabled={converting || (!feet && !inches)}
                  className="w-full h-11 font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 transition-all shadow-md"
                >
                  {converting ? (
                    <span className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Converting...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <Calculator className="w-4 h-4" />
                      <span>Convert to Meters</span>
                    </span>
                  )}
                </Button>

                {/* Converted Result */}
                {convertedHeight && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-white rounded-xl border border-amber-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Converted Height</p>
                        <p className="text-2xl font-bold text-amber-600">
                          {convertedHeight} <span className="text-base font-normal text-gray-500">meters</span>
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={applyConvertedHeight}
                        size="sm"
                        className="bg-teal-600 hover:bg-teal-700 rounded-lg"
                      >
                        <ArrowRight className="w-4 h-4 mr-1" />
                        Use This
                      </Button>
                    </div>
                  </motion.div>
                )}

                <p className="text-xs text-center text-gray-400">
                  Enter your height in feet and inches, then click convert
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Right Column - Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                    <LoadingSpinner />
                  </Card>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <BMIResultCard bmiScore={result.bmi} />
                  <AIAdviceCard advice={result.advice} />
                  
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="w-full h-12 rounded-xl border-2 border-teal-200 text-teal-700 hover:bg-teal-50 transition-all"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Calculate Again
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="p-12 bg-white/60 backdrop-blur-sm border-2 border-dashed border-gray-200 rounded-3xl">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center">
                        <HeartPulse className="w-10 h-10 text-teal-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        Your Results Will Appear Here
                      </h3>
                      <p className="text-gray-500 max-w-sm mx-auto">
                        Enter your weight and height to receive your personalized BMI score and AI-powered nutrition advice.
                      </p>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-gray-100 bg-white/50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-500">
            © 2025 JuTeLabs Medical AI. For educational purposes only.
          </p>
          <p className="text-xs text-teal-600 font-semibold mt-2">
            Powered by JuTeLabs Technology
          </p>
        </div>
      </footer>
    </div>
  );
}
