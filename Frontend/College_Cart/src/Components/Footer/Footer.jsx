import React, { useContext } from 'react';
import { FaLinkedin, FaGithub, FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import './footer.css';
import { useNavigate } from 'react-router-dom';
import { UserDataContext } from '../Header/context';

const Footer = () => {
  const navigate = useNavigate();
  const { data } = useContext(UserDataContext);

  const isAuthenticated = Boolean(data && data._id);

  // "Sell Items" interpolated `data._id` unconditionally. The footer renders on
  // every page including the signed-out home page, so this link pointed at
  // /undefined/add-products-user for any visitor without an account.
  const goSell = () => {
    navigate(isAuthenticated ? `/${data._id}/add-products-user` : '/login');
  };

  const columns = [
    {
      heading: 'About College Cart',
      links: [
        { label: 'About Us', onClick: () => navigate('/aboutus') },
        { label: 'Our Team', onClick: () => navigate('/our-team') },
        { label: 'FAQs', onClick: () => navigate('/faq') },
        { label: 'Contact Us', onClick: () => navigate('/contact-us') },
      ],
    },
    {
      heading: 'Sell & Buy',
      links: [
        { label: 'Sell Items', onClick: goSell },
        { label: 'Buy Items', onClick: () => navigate('/all-products') },
        { label: 'Exchange Items', onClick: () => navigate('/all-products-exchange-books') },
      ],
    },
    {
      heading: 'Support',
      links: [
        { label: 'FAQs', onClick: () => navigate('/faq') },
        { label: 'Contact Support', onClick: () => navigate('/contact-us') },
        { label: 'Settings', onClick: () => navigate('/setting') },
      ],
    },
  ];

  const socials = [
    { label: 'Instagram', icon: <FaInstagram />, href: 'https://instagram.com' },
    { label: 'Facebook', icon: <FaFacebook />, href: 'https://facebook.com' },
    { label: 'Twitter', icon: <FaTwitter />, href: 'https://twitter.com' },
    { label: 'LinkedIn', icon: <FaLinkedin />, href: 'https://linkedin.com' },
    { label: 'GitHub', icon: <FaGithub />, href: 'https://github.com/Harashporiya/IP_PROJECT' },
  ];

  return (
    <footer className="footer">
      <div className="footer-content">
        {columns.map((column) => (
          <div className="footer-section" key={column.heading}>
            <h4>{column.heading}</h4>
            <ul>
              {column.links.map((link) => (
                <li key={link.label}>
                  {/* Was a <p> styled to look like a link, so it was not
                      focusable or operable by keyboard - and footer.css only
                      ever styled `li a`, meaning the hover transition never
                      applied to these at all. */}
                  <button type="button" className="footerLinks" onClick={link.onClick}>
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="footer-section">
          <h4>Connect with Us</h4>
          <div className="social-links">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                target="_blank"
                rel="noreferrer noopener"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; {new Date().getFullYear()} College Cart. All rights reserved.</p>
          <p>Made with ❤️ by the College Cart Team</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
