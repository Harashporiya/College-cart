import React, { useContext } from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import './home.css';
import Electronic from './Category/Electronices/Electronic';
import Book from './Category/Books/Book';
import Clothing from './Category/Clothings/Clothing';
import Sport from './Category/SportsEquipment/Sport';
import Grocery from './Category/Grocery/Grocery';
import { useNavigate } from 'react-router-dom';
import { UserDataContext } from '../Header/context';
import Chatbot from '../Chatbot';
import useScrollReveal from '../../util/useScrollReveal';

const Home = () => {
  const navigate = useNavigate();
  const { data } = useContext(UserDataContext);
  const revealRef = useScrollReveal();

  const isAuthenticated = Boolean(data && data._id);

  const requireAccount = (path) => () => {
    navigate(isAuthenticated ? path : '/login');
  };

  const scrollToCards = () => {
    document.getElementById('cards-head')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const cards = [
    {
      title: 'Buy Products',
      copy: 'Discover great deals on campus',
      cta: 'Shop Now',
      image: 'buy-image',
      onClick: () => navigate('/all-products'),
    },
    {
      title: 'Sell Items',
      copy: 'Turn your items into cash',
      cta: 'Start Selling',
      image: 'sell-image',
      onClick: requireAccount(`/${data?._id}/add-products-user`),
    },
    {
      title: 'Exchange Books',
      copy: 'Trade textbooks with students',
      cta: 'Exchange Now',
      image: 'exchange-image',
      onClick: requireAccount(`/${data?._id}/exchange-add-product-form`),
    },
    {
      title: 'Student Deals',
      copy: 'Special offers for students',
      cta: 'See Deals',
      image: 'deals-image',
      onClick: () => navigate('/all-products'),
    },
  ];

  return (
    <>
      <div className="home-container">
        <div className="stickyHeader">
          <Header showSearch={false} showMiddleHeader={true} isProductsPage={false} />
        </div>

        <section className="hero">
          <div className="hero-media" aria-hidden="true" />
          <div className="hero-content">
            <h1>Buy, Sell &amp; Exchange Items in Your University</h1>
            <p>Find amazing deals, trade items, and connect with students effortlessly!</p>
            <button
              type="button"
              className="cta-button"
              onClick={isAuthenticated ? scrollToCards : () => navigate('/login')}
            >
              Get Started
            </button>
          </div>
          <div className="hero-scroll-hint" aria-hidden="true">
            <span className="hero-scroll-hint__dot" />
          </div>
        </section>

        <div className="cards-section" id="cards-head" ref={revealRef}>
          {cards.map((card) => (
            <article key={card.title} className="card cc-reveal">
              <h2 className="card-title">{card.title}</h2>
              <div className={`card-image ${card.image}`} />
              <div className="card-body">
                <p>{card.copy}</p>
                <button type="button" onClick={card.onClick} className="button">
                  {card.cta}
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="home-categories">
          <Electronic />
          <Book />
          <Clothing />
          <Sport />
          <Grocery />
        </div>
      </div>
      <Footer />
      <Chatbot />
    </>
  );
};

export default Home;
