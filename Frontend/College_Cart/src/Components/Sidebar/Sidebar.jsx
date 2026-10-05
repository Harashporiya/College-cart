import React, { useContext, useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import styles from './sidebar.module.css';
import icon from "../../assets/logo.webp";
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { logout } from '../SagaRedux/Slice';
import { useDispatch } from 'react-redux';
import { UserDataContext } from '../Header/context';
import { SquarePlus, LayoutDashboard, User, Settings, Mail, LogOut, KeyRound, Barcode } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { data, setData } = useContext(UserDataContext);
  const dispatch = useDispatch();
  const email = data?.email || "";
  const [localPart, domainPart] = email.includes("@") ? email.split("@") : ["", ""];

  const isAuthenticated = Boolean(data && data._id);

  const handleLogout = () => {
    dispatch(logout());
    setData('');
    toast.success("Logged out successfully");
    onClose?.();
    navigate("/login");
  };

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const go = (path) => () => {
    onClose?.();
    navigate(path);
  };

  const goAccount = (path) => () => {
    onClose?.();
    navigate(isAuthenticated ? path : '/login');
  };

  const items = [
    { label: 'Dashboard', icon: <LayoutDashboard />, onClick: go('/dashboard') },
    { label: 'Profile', icon: <User />, onClick: goAccount(`/${data?._id}/user-profile`) },
    { label: 'Settings', icon: <Settings />, onClick: go('/setting') },
    ...(isAuthenticated ? [{ label: 'Messages', icon: <Mail />, onClick: go('/messages') }] : []),
    { label: 'Products', icon: <Barcode />, onClick: go('/all-products') },
    { label: 'Exchange Books', icon: <Barcode />, onClick: go('/all-products-exchange-books') },
    ...(isAuthenticated
      ? [
          { label: 'Add Products', icon: <SquarePlus />, onClick: goAccount(`/${data?._id}/add-products-user`) },
          { label: 'Exchange Book Add', icon: <SquarePlus />, onClick: goAccount(`/${data?._id}/exchange-add-product-form`) },
        ]
      : []),
    isAuthenticated
      ? { label: 'Logout', icon: <LogOut />, onClick: handleLogout }
      : { label: 'Signup / Signin', icon: <KeyRound />, onClick: go('/login') },
  ];

  return (
    <>
      <div
        className={`${styles.sidebarOverlay} ${isOpen ? styles.overlayVisible : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}
        aria-hidden={!isOpen}
        {...(!isOpen && { inert: '' })}
      >
        <div className={styles.sidebarHeader}>
          <img src={icon} alt="College Cart" className={styles.sidebarLogo} width="56" height="56" />
          <button className={styles.closeButton} onClick={onClose} aria-label="Close menu">
            <IoMdClose size={24} />
          </button>
        </div>

        <nav className={styles.sidebarContent}>
          {items.map((item) => (
            <button type="button" key={item.label} className={styles.menuItem} onClick={item.onClick}>
              <span className={styles.menuIcon}>{item.icon}</span>
              <span className={styles.menuTitle}>{item.label}</span>
            </button>
          ))}
        </nav>

        {isAuthenticated ? (
          <div className={styles.sidebarFooter}>
            <div className={styles.profileContainer}>
              <img
                className={styles.image}
                src={data.profileImage || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                alt=""
                width="44"
                height="44"
                loading="lazy"
              />
              <div className={styles.profileText}>
                <span className={styles.nameUser}>{data.name || 'Student'}</span>
                <span className={styles.emailUser}>{localPart}<br />@{domainPart}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.sidebarFooter}>
            <div className={styles.authButtons}>
              <button type="button" className={styles.loginBtn} onClick={go('/login')}>Login</button>
              <button type="button" className={styles.signupBtn} onClick={go('/signup')}>Signup</button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
