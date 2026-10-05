import React, { useState, useEffect, useContext } from 'react';
import Header from '../Header/Header';
import axios from 'axios';
import { UserDataContext } from '../Header/context';
import { useNavigate } from 'react-router-dom';
import toast, {Toaster}  from 'react-hot-toast';

const Setting = () => {
  const backend_url = import.meta.env.VITE_BACKEND_API_URL;
  const [allRequests, setAllRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data } = useContext(UserDataContext);
  const navigate = useNavigate()

  useEffect(() => {
    const fetchAllRequests = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${backend_url}/allrequest`);
        const filterLoginUser = res.data.allRequest.filter(
          (user) => user.approvedBookForUser.userId === data._id
        );
        setAllRequests(filterLoginUser);
        console.log(filterLoginUser)
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load requests");
        setIsLoading(false);
      }
    };

    fetchAllRequests();
  }, [data._id, backend_url]);

  const getStatusStyles = (status) => {
    switch (status.toLowerCase()) {
      case 'approve':
        return 'text-emerald-300 bg-emerald-400/15 ring-1 ring-emerald-400/30';
      case 'pending':
        return 'text-amber-300 bg-amber-400/15 ring-1 ring-amber-400/30';
      case 'cancel':
        return 'text-rose-300 bg-rose-400/15 ring-1 ring-rose-400/30';
      default:
        return 'text-zinc-300 bg-white/10 ring-1 ring-white/15';
    }
  };

  const deleteRequesthandle=async(requestId)=>{
    try {
      const response = await axios.delete(`${backend_url}/${requestId}/deleteRequest`)
      toast.success("Request delete successful")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Request during error")
    }
  }

  return (
    <>
      <Header Header showSearch={false} showMiddleHeader={true} isProductsPage={false}/>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white to-violet-300 bg-clip-text text-transparent">Your Book Exchange Requests</h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-400"></div>
          </div>
        ) : allRequests.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-dashed border-white/15 rounded-2xl p-10 text-center">
            <p className="text-lg text-zinc-400">You don't have any book exchange requests yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allRequests.map((request) => (
              <div key={request._id} className="bg-white/[0.06] backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-400/40 hover:shadow-[0_12px_48px_rgba(124,92,255,0.28)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-100">
                      {request.bookName}
                    </h3>
                    <p className="text-sm text-zinc-500">
                      Request ID: {request._id.substring(0, 8)}...
                    </p>
                  </div>
                  <div className="font-medium">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles(request.approvedStatus)}`}>
                      {request.approvedStatus}
                    </span>
                  </div>
                </div>

                <div>
                  {
                   request.approvedUserByBook.selectOption === "Hostler" && (
                      <>
                      <p className="text-sm text-zinc-400">User: {request.approvedUserByBook.selectOption}</p>
                    <p className="text-sm text-zinc-400">Room Number: {request.approvedUserByBook.roomNumber}</p>
                    <p className="text-sm text-zinc-400">Hostle Name: {request.approvedUserByBook.hostleName}</p>
                      </>
                    )
                  }
                  {
                    request.approvedUserByBook.selectOption === "Day_Scholar" && (
                <>  <p className="text-sm text-zinc-400">User: {request.approvedUserByBook.selectOption}</p>
                  <p className="text-sm text-zinc-400">Contect Number: {request.approvedUserByBook.dayScholarContectNumber}</p>
                </> )
                  }
                  </div>

                <div className="mt-4 text-sm text-zinc-400 flex items-center justify-between gap-3">
                  <p>Approved Date: {new Date(request.createdAt).toLocaleDateString()}</p>
                  <button onClick={()=>navigate("/all-products-exchange-books")} className='font-bold px-4 py-2 min-w-[100px] rounded-full text-white bg-gradient-to-r from-violet-500 to-cyan-400 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_10px_32px_rgba(124,92,255,0.45)] active:translate-y-px active:scale-95'>Book</button>
                </div>

                {
                  request.approvedStatus === 'Cancel' ? (
                         <div className='flex'>
              <p className='mt-4 text-sm text-zinc-400'>This book again request try before delete this request <span onClick={()=>deleteRequesthandle(request._id)} className='mt-4 text-sm text-rose-400 cursor-pointer underline underline-offset-2 transition-colors hover:text-rose-300'>Delete.</span></p>
            </div>
                   ):(
                    <div className='flex'>
                    <p className='mt-4 text-sm text-zinc-400'>This book delete the after read <span onClick={()=>deleteRequesthandle(request._id)} className='mt-4 text-sm text-rose-400 cursor-pointer underline underline-offset-2 transition-colors hover:text-rose-300'>Delete.</span></p>
                  </div>
                   )
                }
              </div>

            ))}
          </div>

        )}
      </div>
      <Toaster toastOptions={{ className: 'cc-toast' }} />
    </>
  );
};
export default Setting;