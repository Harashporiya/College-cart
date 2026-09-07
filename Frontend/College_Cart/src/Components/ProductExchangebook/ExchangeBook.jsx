import React, { useContext, useEffect, useState } from 'react';
import { UserDataContext } from '../Header/context';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import styles from './exchange.module.css';
import ProductCardSkeleton from '../ui/ProductCardSkeleton';
import { HomeIcon, Hotel, Phone } from 'lucide-react';
import ExchangeModal from './ExchangeModal';
import axios from 'axios';

const ProductSkeleton = () => <ProductCardSkeleton mediaHeight={400} lines={4} />;

const ExchangeBookAllProduct = () => {
  const { exchangeProduct, searchQuery, data } = useContext(UserDataContext);
  const [filterData, setFilterData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const backend_url = import.meta.env.VITE_BACKEND_API_URL;

  useEffect(() => {
    if (exchangeProduct.length > 0) {
      const bookFilter = exchangeProduct.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      const withOutUserDataShow = bookFilter.filter((item) =>
        item.userId._id !== data._id
      )
      setFilterData(withOutUserDataShow)
      setLoading(false)
    }
  }, [searchQuery, exchangeProduct, data])

  const handleExchangeClick = (book) => {
    setSelectedBook(book);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedBook(null);
  };

  const [requestedBooks, setRequestedBooks] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${backend_url}/allrequest`);
        const filterLoginUser = res.data.allRequest.filter(
          (user) => user.bookId && user.approvedStatus !== "Cancel"
        );
        console.log(res.data)
        const requestedBooksMap = {};
        filterLoginUser.forEach(request => {
          if (request.approvedStatus === "Approve" || request.approvedStatus === "Pending") {
            requestedBooksMap[request.bookId] = true;
          }
        });
        setRequestedBooks(requestedBooksMap);
       console.log(requestedBooks)
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchData();
  }, [data._id]);

  return (
    <>
      <div className="bg-gray-100 min-h-screen">
        <div className={styles.stickyHeader}><Header /></div>
        <div className="container mx-auto px-3 py-5 sm:px-4 sm:py-8">
          {/* Was `grid-cols-1` on mobile, which combined with the fixed
              300x400 image below produced one 646px-tall card per row on a
              phone. Two columns from the smallest size up. */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {loading ? (
              Array.from(new Array(8)).map((_, index) => <ProductSkeleton key={index} />)
            ) : filterData.length > 0 ? (
              filterData.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl"
                >
                  {/* The image was a hardcoded `w-[300px] h-[400px]`, which
                      overflowed a phone-width card and made every card 646px
                      tall. It now fills the card and takes its height from the
                      viewport size. */}
                  <div className="relative items-center flex justify-center overflow-hidden transition-transform duration-300 hover:scale-95">
                    <img
                      className="w-full h-36 sm:h-72 object-cover mt-2 sm:mt-4 rounded-lg"
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="p-2 sm:p-4">
                    <h2 className="text-sm sm:text-xl font-semibold mb-1 sm:mb-2 line-clamp-2">{item.name}</h2>
                    <div className="mb-2 sm:mb-4">
                      {item.selectHostel === "Hostler" ? (
                        <div className="text-xs sm:text-sm text-gray-600">
                          <div className='flex'><HomeIcon size={14} className="flex-shrink-0" /> <p className='ml-1.5 truncate'> Room: {item.roomNumber}</p></div>
                          <div className='flex'><Hotel size={14} className="flex-shrink-0" /> <p className='ml-1.5 truncate'>Hostel: {item.hostleName}</p></div>
                        </div>
                      ) : (
                        <div className="text-xs sm:text-sm text-gray-600 flex">
                          <Phone size={14} className="flex-shrink-0" /> <p className='ml-1.5 truncate'>Contact: {item.dayScholarContectNumber}</p>
                        </div>
                      )}
                    </div>

                    {/* Hidden on phones: at ~150px wide the name, location and
                        the exchange button are what the card is for. */}
                    <p className="hidden sm:block text-gray-700 mb-4 line-clamp-3">{item.description}</p>

                    <div className="flex justify-between items-center">
                      {
                        requestedBooks[item._id] ? (
                          <button
                            className="bg-yellow-500 text-white px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-base rounded-full hover:bg-yellow-400 w-full cursor-not-allowed"
                            disabled
                          >
                             Requested
                          </button>
                        ) : (
                          <button
                            className="bg-yellow-500 text-white px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-base rounded-full hover:bg-yellow-400 w-full"
                            onClick={() => handleExchangeClick(item)}
                          >
                            Exchange
                          </button>
                        )
                      }
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className='text-2xl text-black font-bold'>Product Not Found</p>
            )}
          </div>
        </div>
      </div>
      <Footer />

      {modalOpen && selectedBook && (
        <ExchangeModal
          isOpen={modalOpen}
          onClose={closeModal}
          bookData={selectedBook}
          userData={data}
        />
      )}
    </>
  );
};

export default ExchangeBookAllProduct;