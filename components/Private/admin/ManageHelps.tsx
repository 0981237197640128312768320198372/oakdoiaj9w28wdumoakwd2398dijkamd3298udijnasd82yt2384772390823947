/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdOutlineLiveHelp,
  MdAdd,
  MdEdit,
  MdDelete,
  MdClose,
  MdSave,
  MdImage,
  MdArticle,
} from 'react-icons/md';

interface HelpStep {
  step: string;
  description: string;
  imageUrl: string;
}

interface HelpItem {
  _id: string;
  title: string;
  description: string;
  categories: string[];
  steps: HelpStep[];
  createdAt: Date;
  updatedAt: Date;
}

const ManageHelps: React.FC = () => {
  const [helps, setHelps] = useState<HelpItem[]>([]);
  const [selectedHelp, setSelectedHelp] = useState<HelpItem | null>(null);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [showAddHelpModal, setShowAddHelpModal] = useState(false);
  const [showEditHelpModal, setShowEditHelpModal] = useState(false);
  const [showStepsPanel, setShowStepsPanel] = useState(false);
  const [showAddStepForm, setShowAddStepForm] = useState(false);
  const [pictureUrl, setPictureUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  useEffect(() => {
    fetchHelps();
  }, []);

  const fetchHelps = async () => {
    try {
      const response = await fetch('/api/v3/helps?fetchall=true');
      if (!response.ok) throw new Error('Failed to fetch helps');
      const data = await response.json();
      setHelps(data.helps);
    } catch (error) {
      console.error(error);
      showFeedback('Failed to fetch helps', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (message: string, type: 'success' | 'error') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAddHelp = async (formData: FormData) => {
    setActionLoading('addingHelp');
    const helpData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      categories:
        (formData.get('categories') as string)
          ?.split(',')
          .map((c) => c.trim())
          .filter(Boolean) || [],
      steps: [],
    };

    try {
      const response = await fetch('/api/v3/helps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', help: helpData }),
      });

      if (!response.ok) throw new Error('Failed to add help');
      const data = await response.json();
      setHelps((prev) => [data.helps[0], ...prev]);
      showFeedback('Help guide created', 'success');
      setShowAddHelpModal(false);
    } catch (error) {
      showFeedback('Failed to create help guide', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateHelp = async (id: string, formData: FormData) => {
    setActionLoading('updatingHelp');
    const updatedHelp = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      categories:
        (formData.get('categories') as string)
          ?.split(',')
          .map((c) => c.trim())
          .filter(Boolean) || [],
    };

    try {
      const response = await fetch('/api/v3/helps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id, updatedHelp }),
      });

      if (!response.ok) throw new Error('Failed to update help');
      const data = await response.json();
      const updated = data.helps[0];

      setHelps((prev) => prev.map((help) => (help._id === id ? updated : help)));
      setSelectedHelp(updated);
      showFeedback('Help guide updated', 'success');
      setShowEditHelpModal(false);
    } catch (error) {
      showFeedback('Failed to update help guide', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteHelp = async (id: string) => {
    if (!confirm('Delete this help guide?')) return;

    setActionLoading(id);
    try {
      const response = await fetch('/api/v3/helps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      });

      if (!response.ok) throw new Error('Failed to delete help');
      setHelps((prev) => prev.filter((help) => help._id !== id));
      showFeedback('Help guide deleted', 'success');
      if (selectedHelp?._id === id) {
        setSelectedHelp(null);
        setShowStepsPanel(false);
      }
    } catch (error) {
      showFeedback('Failed to delete help guide', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddStep = async (helpId: string, formData: FormData) => {
    if (!pictureUrl) {
      showFeedback('Please upload an image', 'error');
      return;
    }

    setActionLoading('addingStep');
    const newStep = {
      step: formData.get('step') as string,
      description: formData.get('description') as string,
      imageUrl: pictureUrl,
    };

    try {
      const response = await fetch('/api/v3/helps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addStep', helpId, newStep }),
      });

      if (!response.ok) throw new Error('Failed to add step');
      const data = await response.json();
      const updatedHelp = data.helps[0];

      setSelectedHelp(updatedHelp);
      setHelps((prev) => prev.map((help) => (help._id === helpId ? updatedHelp : help)));
      showFeedback('Step added', 'success');
      setShowAddStepForm(false);
      setPictureUrl('');
    } catch (error) {
      showFeedback('Failed to add step', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateStep = async (helpId: string, stepIndex: number, formData: FormData) => {
    setActionLoading(`editingStep-${stepIndex}`);
    const updatedStep = {
      step: formData.get('step') as string,
      description: formData.get('description') as string,
      imageUrl: pictureUrl || selectedHelp?.steps[stepIndex]?.imageUrl || '',
    };

    try {
      const response = await fetch('/api/v3/helps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateStep', helpId, stepIndex, updatedStep }),
      });

      if (!response.ok) throw new Error('Failed to update step');
      const data = await response.json();
      const updatedHelp = data.helps[0];

      setHelps((prev) => prev.map((help) => (help._id === helpId ? updatedHelp : help)));
      setSelectedHelp(updatedHelp);
      showFeedback('Step updated', 'success');
      setEditingStepIndex(null);
      setPictureUrl('');
    } catch (error) {
      showFeedback('Failed to update step', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteStep = async (helpId: string, stepIndex: number) => {
    if (!confirm('Delete this step?')) return;

    setActionLoading(`deletingStep-${stepIndex}`);
    try {
      const response = await fetch('/api/v3/helps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteStep', helpId, stepIndex }),
      });

      if (!response.ok) throw new Error('Failed to delete step');
      const data = await response.json();
      const updatedHelp = data.helps[0];

      setSelectedHelp(updatedHelp);
      setHelps((prev) => prev.map((help) => (help._id === helpId ? updatedHelp : help)));
      showFeedback('Step deleted', 'success');
    } catch (error) {
      showFeedback('Failed to delete step', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('images', file);

      const response = await fetch('/api/v3/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload image');
      const data = await response.json();
      setPictureUrl(data.urls[0]);
    } catch (error) {
      showFeedback('Failed to upload image', 'error');
      setPictureUrl('');
    } finally {
      setIsUploading(false);
    }
  };

  const LoadingCard = () => (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3 animate-pulse">
      <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-white/10 rounded w-full mb-3"></div>
      <div className="flex justify-between items-center">
        <div className="h-3 bg-white/10 rounded w-12"></div>
        <div className="flex gap-1">
          <div className="h-6 bg-white/10 rounded w-6"></div>
          <div className="h-6 bg-white/10 rounded w-6"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[75vh] w-full bg-gradient-to-br from-dark-800 via-dark-800 to-dark-800 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <MdOutlineLiveHelp className="text-lg text-primary" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-semibold text-white">Help Center</h1>
              <p className="text-xs text-light-600">Manage help guides</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddHelpModal(true)}
            disabled={!!actionLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-dark-800 text-xs font-medium rounded-lg transition-all disabled:opacity-50 w-full sm:w-auto justify-center">
            <MdAdd className="text-sm" />
            New Guide
          </motion.button>
        </motion.div>

        {/* Help Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <LoadingCard key={i} />)
            : helps.map((help, index) => (
                <motion.div
                  key={help._id}
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 hover:border-primary/30 transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedHelp(help);
                    setShowStepsPanel(true);
                  }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <MdArticle className="text-primary text-sm mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-medium text-white group-hover:text-primary transition-colors line-clamp-2">
                          {help.title}
                        </h3>
                        <p className="text-xs text-light-600 line-clamp-2 mt-1">
                          {help.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {help.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {help.categories.slice(0, 2).map((category, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                          {category}
                        </span>
                      ))}
                      {help.categories.length > 2 && (
                        <span className="px-2 py-0.5 bg-white/10 text-light-600 text-xs rounded-full">
                          +{help.categories.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-light-600 text-xs">
                      <MdImage className="text-primary text-xs" />
                      <span>{help.steps.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedHelp(help);
                          setShowEditHelpModal(true);
                        }}
                        className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-colors">
                        <MdEdit className="text-xs" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHelp(help._id);
                        }}
                        disabled={actionLoading === help._id}
                        className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors disabled:opacity-50">
                        {actionLoading === help._id ? (
                          <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <MdDelete className="text-xs" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
        </div>

        {helps.length === 0 && !loading && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-center py-12">
            <MdOutlineLiveHelp className="text-4xl text-light-600 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-white mb-2">No help guides yet</h3>
            <p className="text-xs text-light-600 mb-4">Create your first guide</p>
            <button
              onClick={() => setShowAddHelpModal(true)}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-dark-800 text-xs font-medium rounded-lg transition-all">
              Create Guide
            </button>
          </motion.div>
        )}
      </div>

      {/* Add Help Modal */}
      <AnimatePresence>
        {showAddHelpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddHelpModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-dark-800 border border-white/10 rounded-lg p-4 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-white">New Help Guide</h2>
                <button
                  onClick={() => setShowAddHelpModal(false)}
                  className="p-1 hover:bg-white/10 rounded transition-colors">
                  <MdClose className="text-light-600 text-sm" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddHelp(new FormData(e.currentTarget));
                }}
                className="space-y-3">
                <div>
                  <label className="block text-xs text-light-300 mb-1">Title</label>
                  <input
                    name="title"
                    type="text"
                    required
                    placeholder="Enter title"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-light-600 text-xs focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-light-300 mb-1">Description</label>
                  <textarea
                    name="description"
                    required
                    rows={3}
                    placeholder="Brief description"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-light-600 text-xs focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-light-300 mb-1">Categories</label>
                  <input
                    name="categories"
                    type="text"
                    placeholder="Comma separated"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-light-600 text-xs focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={actionLoading === 'addingHelp'}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary hover:bg-primary/90 text-dark-800 text-xs font-medium rounded transition-all disabled:opacity-50">
                    {actionLoading === 'addingHelp' ? (
                      <div className="w-3 h-3 border border-dark-800 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <MdSave className="text-xs" />
                        Create
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddHelpModal(false)}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Help Modal */}
      <AnimatePresence>
        {showEditHelpModal && selectedHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowEditHelpModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-dark-800 border border-white/10 rounded-lg p-4 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-white">Edit Guide</h2>
                <button
                  onClick={() => setShowEditHelpModal(false)}
                  className="p-1 hover:bg-white/10 rounded transition-colors">
                  <MdClose className="text-light-600 text-sm" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateHelp(selectedHelp._id, new FormData(e.currentTarget));
                }}
                className="space-y-3">
                <div>
                  <label className="block text-xs text-light-300 mb-1">Title</label>
                  <input
                    name="title"
                    type="text"
                    required
                    defaultValue={selectedHelp.title}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-xs focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-light-300 mb-1">Description</label>
                  <textarea
                    name="description"
                    required
                    rows={3}
                    defaultValue={selectedHelp.description}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-xs focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-light-300 mb-1">Categories</label>
                  <input
                    name="categories"
                    type="text"
                    defaultValue={selectedHelp.categories.join(', ')}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-xs focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={actionLoading === 'updatingHelp'}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary hover:bg-primary/90 text-dark-800 text-xs font-medium rounded transition-all disabled:opacity-50">
                    {actionLoading === 'updatingHelp' ? (
                      <div className="w-3 h-3 border border-dark-800 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <MdSave className="text-xs" />
                        Update
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditHelpModal(false)}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Steps Management Panel */}
      <AnimatePresence>
        {showStepsPanel && selectedHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowStepsPanel(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-dark-800 border border-white/10 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}>
              {/* Panel Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-medium text-white truncate">{selectedHelp.title}</h2>
                  <p className="text-xs text-light-600 mt-1">Manage steps</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddStepForm(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary text-xs rounded transition-colors">
                    <MdAdd className="text-xs" />
                    Add Step
                  </motion.button>
                  <button
                    onClick={() => setShowStepsPanel(false)}
                    className="p-1.5 hover:bg-white/10 rounded transition-colors">
                    <MdClose className="text-light-600 text-sm" />
                  </button>
                </div>
              </div>

              {/* Steps Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {selectedHelp.steps.length === 0 ? (
                  <div className="text-center py-8">
                    <MdImage className="text-3xl text-light-600 mx-auto mb-2" />
                    <h3 className="text-sm font-medium text-white mb-1">No steps added</h3>
                    <p className="text-xs text-light-600 mb-3">Add your first step</p>
                    <button
                      onClick={() => setShowAddStepForm(true)}
                      className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-dark-800 text-xs font-medium rounded transition-colors">
                      Add Step
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedHelp.steps.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white/5 border border-white/10 rounded-lg p-3">
                        {editingStepIndex === index ? (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleUpdateStep(
                                selectedHelp._id,
                                index,
                                new FormData(e.currentTarget)
                              );
                            }}
                            className="space-y-3">
                            <div>
                              <label className="block text-xs text-light-300 mb-1">Title</label>
                              <input
                                name="step"
                                type="text"
                                required
                                defaultValue={step.step}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-xs focus:outline-none focus:border-primary transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-light-300 mb-1">
                                Description
                              </label>
                              <textarea
                                name="description"
                                required
                                rows={2}
                                defaultValue={step.description}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-xs focus:outline-none focus:border-primary transition-colors resize-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-light-300 mb-1">
                                Update Image (Optional)
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(file);
                                }}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-primary file:text-dark-800 file:text-xs hover:file:bg-primary/90 transition-colors"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                disabled={actionLoading === `editingStep-${index}` || isUploading}
                                className="flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-primary/90 text-dark-800 text-xs font-medium rounded transition-all disabled:opacity-50">
                                {actionLoading === `editingStep-${index}` ? (
                                  <div className="w-3 h-3 border border-dark-800 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <>
                                    <MdSave className="text-xs" />
                                    Update
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingStepIndex(null);
                                  setPictureUrl('');
                                }}
                                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded transition-colors">
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-shrink-0">
                              <Image
                                src={step.imageUrl}
                                alt={step.step}
                                width={120}
                                height={90}
                                className="rounded object-cover w-full sm:w-[120px] h-[90px]"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-xs font-medium text-white mb-1">
                                    {index + 1}. {step.step}
                                  </h4>
                                  <p className="text-xs text-light-600 line-clamp-3">
                                    {step.description}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 ml-2">
                                  <button
                                    onClick={() => setEditingStepIndex(index)}
                                    className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-colors">
                                    <MdEdit className="text-xs" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteStep(selectedHelp._id, index)}
                                    disabled={actionLoading === `deletingStep-${index}`}
                                    className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors disabled:opacity-50">
                                    {actionLoading === `deletingStep-${index}` ? (
                                      <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <MdDelete className="text-xs" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Add Step Form */}
                <AnimatePresence>
                  {showAddStepForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 bg-primary/10 border border-primary/20 rounded-lg p-3">
                      <h3 className="text-xs font-medium text-white mb-3">Add New Step</h3>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleAddStep(selectedHelp._id, new FormData(e.currentTarget));
                        }}
                        className="space-y-3">
                        <div>
                          <label className="block text-xs text-light-300 mb-1">Title</label>
                          <input
                            name="step"
                            type="text"
                            required
                            placeholder="Step title"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-light-600 text-xs focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-light-300 mb-1">Description</label>
                          <textarea
                            name="description"
                            required
                            rows={2}
                            placeholder="What should the user do?"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-light-600 text-xs focus:outline-none focus:border-primary transition-colors resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-light-300 mb-1">Image</label>
                          <input
                            type="file"
                            accept="image/*"
                            required
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file);
                            }}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-primary file:text-dark-800 file:text-xs hover:file:bg-primary/90 transition-colors"
                          />
                          {isUploading && (
                            <div className="flex items-center gap-2 mt-1 text-primary">
                              <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                              <span className="text-xs">Uploading...</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={actionLoading === 'addingStep' || isUploading || !pictureUrl}
                            className="flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-primary/90 text-dark-800 text-xs font-medium rounded transition-all disabled:opacity-50">
                            {actionLoading === 'addingStep' ? (
                              <div className="w-3 h-3 border border-dark-800 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <MdAdd className="text-xs" />
                                Add
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddStepForm(false);
                              setPictureUrl('');
                            }}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded transition-colors">
                            Cancel
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div
              className={`px-4 py-2 rounded-lg backdrop-blur-sm border text-xs font-medium ${
                feedback.type === 'success'
                  ? 'bg-green-500/20 border-green-500/30 text-green-400'
                  : 'bg-red-500/20 border-red-500/30 text-red-400'
              }`}>
              {feedback.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageHelps;
