import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import styles from "./profile.module.css";
import axios from 'axios';
import toast, { Toaster } from "react-hot-toast";

const RequestModal = ({ isOpen, onClose, orderData }) => {
    const backend_url = import.meta.env.VITE_BACKEND_API_URL;
    const [confirmationModal, setConfirmationModal] = useState(false);
    const [actionType, setActionType] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [allRequests, setAllRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    useEffect(()=>{
        const fetchAllRequests = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${backend_url}/allrequest`);
                setAllRequests(res.data.allRequest);
                console.log(res.data.allRequest)
                setLoading(false);
            } catch (error) {
                setLoading(false);
                console.error("Failed to load requests");
            }
        };
        fetchAllRequests();
    },[])

    const openConfirmationModal = (request, type) => {
        setSelectedRequest(request);
        setActionType(type);
        setConfirmationModal(true);
    };

    const closeConfirmationModal = () => {
        setConfirmationModal(false);
        setSelectedRequest(null);
        setActionType('');
    };

    const handleRequestApproved = async() => {
        try {
            const payload = {
                approvedBookForUser: {
                    userId: selectedRequest.buyUser.userId,
                    userName: selectedRequest.buyUser.userName
                },
                approvedStatus: "Approve",
                approvedUserByBook: {
                    userId: selectedRequest.sealUser.userId,
                    userName: selectedRequest.sealUser.userName,
                    dayScholarContectNumber:selectedRequest.sealUser.dayScholarContectNumber || "",
                    hostleName:selectedRequest.sealUser.hostleName || "",
                    roomNumber:selectedRequest.sealUser.roomNumber || "",
                    selectOption:selectedRequest.sealUser.selectOption
                }
            };
            const response = await axios.post(`${backend_url}/${selectedRequest._id}/request-handle`, payload);

            toast.success("Request is approved");
            closeConfirmationModal();
        } catch (error) {
            console.error("Error approving request:", error);
            toast.error("Failed to approve request");
        }
    };

    const handleRequestCancel = async() => {
        try {
            const payload = {
                approvedBookForUser: {
                    userId: selectedRequest.buyUser.userId,
                    userName: selectedRequest.buyUser.userName
                },
                approvedStatus: "Cancel",
                approvedUserByBook: {
                    userId: selectedRequest.sealUser.userId,
                    userName: selectedRequest.sealUser.userName,
                    dayScholarContectNumber:selectedRequest.sealUser.dayScholarContectNumber || "",
                    hostleName:selectedRequest.sealUser.hostleName || "",
                    roomNumber:selectedRequest.sealUser.roomNumber || "",
                    selectOption:selectedRequest.sealUser.selectOption
                }
            };
            const response = await axios.post(`${backend_url}/${selectedRequest._id}/request-handle`, payload);
            toast.success("Request is cancelled");
        await handleCancelRequestBookDelete(selectedRequest._id);
            closeConfirmationModal();
        } catch (error) {
            console.error("Error cancelling request:", error);
            toast.error("Failed to cancel request");
        }
    };

    const handleConfirmAction = () => {
        if (actionType === 'approve') {
            handleRequestApproved();
        } else if (actionType === 'cancel') {
            handleRequestCancel();
        }
    };

    const handleCancelRequestBookDelete=async(requestId)=>{
        console.log(requestId)
        try {
           const res = await axios.delete(`${backend_url}/${requestId}/deleteOrder`);
        } catch (error) {
           console.error("Error:", error)
        }
       }

    const getRequestStatus = (requestId,buyUserId) => {
        const foundRequest = allRequests.find(req => req.bookId === requestId && req.approvedBookForUser.userId === buyUserId);
       console.log("found",foundRequest)
        return foundRequest?.approvedStatus || "Pending";
    };

    const renderStatusBadge = (requestId,buyUserId) => {
        const status = getRequestStatus(requestId,buyUserId);
        switch (status) {
            case "Approve":
                return (
                    <div className="flex items-center bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30 px-3 py-1 rounded-full text-sm font-semibold">
                        <CheckCircle size={16} className="mr-1" />
                        Approved
                    </div>
                );
            case "Cancel":
                return (
                    <div className="flex items-center bg-rose-400/15 text-rose-300 ring-1 ring-rose-400/30 px-3 py-1 rounded-full text-sm font-semibold">
                        <XCircle size={16} className="mr-1" />
                        Cancelled
                    </div>
                );
            default:
                return (
                    <div className="flex items-center bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30 px-3 py-1 rounded-full text-sm font-semibold">
                        <Clock size={16} className="mr-1" />
                        Pending
                    </div>
                );
        }
    };

    return (
        <>
            <AnimatePresence>
                {confirmationModal && (
                    <motion.div
                        className={styles.imageModalContainer}
                        onClick={closeConfirmationModal}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            zIndex: 1100,
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(4, 4, 10, 0.68)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)'
                        }}
                    >
                        <motion.div
                            className="bg-zinc-900/85 backdrop-blur-2xl border border-white/15 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                            initial={{ scale: 0.8, y: -20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: -20 }}
                            transition={{ duration: 0.2 }}
                            style={{ position: 'relative' }}
                        >
                            <div className="flex items-center justify-center mb-4 text-center">
                                <AlertCircle className="text-amber-400 mr-2" size={24} />
                                <h3 className="text-xl font-bold text-zinc-100">
                                    {actionType === 'approve' ? 'Approve Request' : 'Cancel Request'}
                                </h3>
                            </div>

                            <p className="mb-6 text-center text-zinc-400">
                                Are you sure you want to {actionType === 'approve' ? 'approve' : 'cancel'} this request?
                            </p>

                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={closeConfirmationModal}
                                    className="bg-white/[0.07] border border-white/15 text-zinc-200 font-semibold px-5 py-2.5 rounded-full transition-all duration-200 hover:bg-white/[0.12] hover:border-violet-400/40 hover:-translate-y-0.5 active:translate-y-px active:scale-95"
                                >
                                    No, Go Back
                                </button>
                                <button
                                    onClick={handleConfirmAction}
                                    className={`${actionType === 'approve' ? 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:shadow-[0_10px_32px_rgba(52,211,153,0.4)]' : 'bg-gradient-to-r from-rose-400 to-rose-600 hover:shadow-[0_10px_32px_rgba(244,63,94,0.4)]'} text-white font-bold px-5 py-2.5 rounded-full transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-px active:scale-95`}
                                >
                                    Yes, {actionType === 'approve' ? 'Approve' : 'Cancel'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={styles.imageModalContainer}
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ zIndex: 1000 }}
                    >
                        <motion.div
                            className="bg-zinc-900/85 backdrop-blur-2xl border border-white/15 rounded-2xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white to-violet-300 bg-clip-text text-transparent">Exchange Book Requests</h2>
                                <button
                                    className="p-2 w-10 h-10 grid place-items-center text-zinc-400 border border-white/10 rounded-full transition-all duration-300 hover:bg-rose-500/15 hover:text-rose-300 hover:rotate-90"
                                    onClick={onClose}
                                >
                                    <X />
                                </button>
                            </div>
                            {loading ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-400"></div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {
                                        orderData.length === 0 && (
                                            <p className='font-bold text-2xl text-center text-zinc-500'>Order Not Found</p>
                                        )
                                    }
                                    {orderData.map((request) => (
                                        <div key={request._id} className="border border-white/10 rounded-xl p-4 bg-white/[0.04] text-zinc-300 transition-colors duration-200 hover:bg-white/[0.07] hover:border-violet-400/30">
                                            <div className="flex justify-between mb-2">
                                                <h3 className="font-semibold text-zinc-100">
                                                    Request from: {request.buyUser.userName}
                                                </h3>
                                                {renderStatusBadge(request.bookId, request.buyUser.userId)}
                                            </div>

                                            <div className="mb-2">
                                                <p><span className="font-medium">Book Title:</span> {request.bookName}</p>
                                                <p><span className="font-medium">Request Date:</span> {new Date(request.createdAt).toLocaleDateString()}</p>
                                                {request.dayScholarContectNumber && (
                                                    <p><span className="font-medium">Contact:</span> {request.dayScholarContectNumber}</p>
                                                )}
                                                <p><span className="font-medium">Exchange Type:</span> {request.selectOption.replace('_', ' ')}</p>
                                                {request.hostleName && (
                                                    <p><span className="font-medium">Hostle Name:</span> {request.hostleName}</p>
                                                )}
                                                {request.roomNumber && (
                                                    <p><span className="font-medium">Room Number:</span> {request.roomNumber}</p>
                                                )}
                                            </div>

                                            {getRequestStatus(request.bookId, request.buyUser.userId) !== "Approve" && getRequestStatus(request.bookId, request.buyUser.userId) !== "Cancel" && (
                                                <div className="flex space-x-2 mt-3">
                                                    <button
                                                        onClick={() => openConfirmationModal(request, 'approve')}
                                                        className='bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold px-4 py-2 rounded-full transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[0_8px_26px_rgba(52,211,153,0.4)] active:translate-y-px active:scale-95'
                                                    >
                                                        Approve Request
                                                    </button>

                                                    <button
                                                        onClick={() =>openConfirmationModal(request, 'cancel')}
                                                        className='bg-gradient-to-r from-rose-400 to-rose-600 text-white font-bold px-4 py-2 rounded-full transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[0_8px_26px_rgba(244,63,94,0.4)] active:translate-y-px active:scale-95'
                                                    >
                                                        Cancel Request
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <Toaster toastOptions={{ className: 'cc-toast' }} />
        </>
    );
};

export default RequestModal;