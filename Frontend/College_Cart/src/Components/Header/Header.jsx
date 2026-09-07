import React, { useContext, useState, useEffect, useRef } from "react";
import { IoMenu } from "react-icons/io5";
import { IoMdSearch } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import icon from "../../assets/logo.webp";
import { UserDataContext } from "./context";
import style from "./header.module.css";
import { FaCartPlus } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { getToken } from "../../util/tokenService";
import { allCartProduct } from "../SagaRedux/Slice";

const AVATAR_FALLBACK = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const Header = ({ showSearch = true, showMiddleHeader = true, isProductsPage = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data, searchQuery, setSearchQuery } = useContext(UserDataContext);
  const [show, setShow] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { totalQuantity } = useSelector((state) => state.cart);

  const isAuthenticated = Boolean(data && data._id);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 480px)");
    const handleChange = (e) => setIsMobile(e.matches);
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShow(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const token = getToken();
    if (token && isAuthenticated) {
      dispatch(allCartProduct());
    }
  }, [dispatch, isAuthenticated]);

  // Two console.log effects used to run here - one on every cart-count change
  // and one logging cart initialisation - which spammed the console on every
  // page and every add-to-cart.

  return (
    <>
      <header className={style.header}>
        <div className={style.headerLeft}>
          <button className={style.menuButton} onClick={() => setIsOpen(true)} aria-label="Open menu">
            <IoMenu size={34} />
          </button>
          <img
            src={icon}
            alt="College Cart"
            className={style.logo}
            width="64"
            height="64"
            onClick={() => navigate('/')}
          />
        </div>

        {showMiddleHeader && (
          <nav className={`${style.middleHeader} ${isProductsPage && isMobile ? style.hideOnMobile : ''}`}>
            <button type="button" className={style.navLink} onClick={() => navigate("/all-products")}>Products</button>
            <button type="button" className={style.navLink} onClick={() => navigate("/aboutus")}>About Us</button>
            <button type="button" className={style.navLink} onClick={() => navigate("/our-team")}>Our Team</button>
            <button type="button" className={style.navLink} onClick={() => navigate("/contact-us")}>Contact</button>
          </nav>
        )}

        {showSearch && (
          <div className={style.searchContainer}>
            <IoMdSearch className={style.searchIcon} size={22} />
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={style.searchInput}
              aria-label="Search products"
            />
          </div>
        )}

        <button
          type="button"
          className={style.addProductCart}
          onClick={() => navigate('/addCartProudct')}
          aria-label={`Cart, ${totalQuantity} items`}
        >
          <FaCartPlus className={style.cart} size={30} />
          {/* The badge used to render even at zero, showing a red "0" bubble
              on every page before anything was added. */}
          {totalQuantity > 0 && (
            <span className={style.productCountInCart}>{totalQuantity}</span>
          )}
        </button>

        <div className={style.headerRight} ref={profileRef}>
          {isAuthenticated ? (
            <button type="button" className={style.profile} onClick={() => setShow(!show)} aria-expanded={show}>
              {/* framer-motion's whileHover scale is now a CSS transform, which
                  keeps the library out of the initial bundle - the Header ships
                  on every route. */}
              <img
                src={data.profileImage || AVATAR_FALLBACK}
                alt=""
                className={style.avatar}
                width="52"
                height="52"
              />
              <span className={style.username}>{data?.name || "Student"}</span>
            </button>
          ) : (
            <div className={style.person}>
              <button type="button" className={style.login} onClick={() => navigate("/login")}>
                Login
              </button>
              <button type="button" className={style.signup} onClick={() => navigate('/signup')}>
                Signup
              </button>
            </div>
          )}

          {show && (
            <div className={style.profileDropdown} onClick={() => navigate(`/${data._id}/user-profile`)}>
              <div className={style.profileMenu}>
                <div className={style.profileHeader}>
                  <img
                    src={data.profileImage || AVATAR_FALLBACK}
                    alt=""
                    className={style.dropdownAvatar}
                    width="48"
                    height="48"
                  />
                  <div className={style.profileInfo}>
                    <span className={style.profileName}>{data.name || "Student"}</span>
                    <span className={style.profileUsername}>@{data.username || "student"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default Header;
