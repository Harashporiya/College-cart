export const SITE_URL = 'https://college-cart.netlify.app';
export const SITE_NAME = 'College Cart';
export const TWITTER_HANDLE = '';

export const DEFAULT_TITLE = 'College Cart - Buy, Sell & Exchange on Campus';
export const DEFAULT_DESCRIPTION =
  'College Cart is a campus-only marketplace where verified students buy, sell and exchange textbooks, electronics, clothing and daily essentials.';
export const OG_IMAGE = `${SITE_URL}/og-image.png`;

export const ROUTES = [
  {
    path: '/',
    title: 'College Cart - Buy, Sell & Exchange on Campus',
    description:
      'A campus-only marketplace for verified students. Buy and sell used textbooks, electronics, clothing and daily essentials, or exchange books with classmates.',
    changefreq: 'daily',
    priority: 1.0,
  },
  {
    path: '/all-products',
    title: 'All Products - Student Marketplace | College Cart',
    description:
      'Browse every item listed by students on your campus. Textbooks, laptops, clothing, sports gear and groceries, all from verified classmates at student prices.',
    changefreq: 'daily',
    priority: 0.9,
  },
  {
    path: '/all-book-item',
    title: 'Used Textbooks & Books for Sale | College Cart',
    description:
      'Find second-hand textbooks, reference books and novels sold by students on your campus. Save on course material and sell the books you have finished with.',
    changefreq: 'daily',
    priority: 0.8,
  },
  {
    path: '/all-electronic-item',
    title: 'Student Electronics & Laptops | College Cart',
    description:
      'Shop used laptops, headphones, calculators, chargers and other student electronics listed by verified classmates on your campus at affordable prices.',
    changefreq: 'daily',
    priority: 0.8,
  },
  {
    path: '/all-clothing-item',
    title: 'Clothing & Apparel for Students | College Cart',
    description:
      'Buy and sell pre-loved clothing, footwear and accessories within your college community. Affordable student fashion listed by classmates you can verify.',
    changefreq: 'daily',
    priority: 0.8,
  },
  {
    path: '/all-sport-item',
    title: 'Sports Equipment & Fitness Gear | College Cart',
    description:
      'Find cricket bats, badminton rackets, gym gear, cycles and other sports equipment sold by students on your campus. List your own gear in minutes.',
    changefreq: 'daily',
    priority: 0.8,
  },
  {
    path: '/all-grocery-item',
    title: 'Groceries & Daily Essentials for Hostel Life | College Cart',
    description:
      'Stock up on snacks, stationery, toiletries and hostel essentials listed by students nearby. Quick campus pickup with no delivery charge.',
    changefreq: 'daily',
    priority: 0.8,
  },
  {
    path: '/all-products-exchange-books',
    title: 'Exchange Textbooks with Students | College Cart',
    description:
      'Swap the textbooks you no longer need for the ones you do. Browse books offered for exchange by verified students and send an exchange request.',
    changefreq: 'daily',
    priority: 0.8,
  },
  {
    path: '/aboutus',
    title: 'About College Cart - The Campus Marketplace',
    description:
      'Learn how College Cart gives verified college students a safe place to buy, sell and exchange items within their own campus community.',
    changefreq: 'monthly',
    priority: 0.6,
  },
  {
    path: '/our-team',
    title: 'Our Team | College Cart',
    description:
      'Meet the student team that designs, builds and runs College Cart, the campus-only marketplace for buying, selling and exchanging student essentials.',
    changefreq: 'monthly',
    priority: 0.5,
  },
  {
    path: '/faq',
    title: 'Frequently Asked Questions | College Cart',
    description:
      'Answers about verification, listing an item, payments, book exchange, delivery on campus and keeping your College Cart account secure.',
    changefreq: 'monthly',
    priority: 0.6,
  },
  {
    path: '/contact-us',
    title: 'Contact Us | College Cart',
    description:
      'Get in touch with the College Cart team for support with your account, a listing, an order or a book exchange request.',
    changefreq: 'monthly',
    priority: 0.5,
  },
];

export const PRIVATE_PATHS = [
  '/login',
  '/signup',
  '/forgotpassword',
  '/newPassword',
  '/setting',
  '/messages',
  '/addCartProudct',
  '/dashboard',
];

export const PRIVATE_PATTERNS = [
  '/*/user-profile',
  '/*/add-products-user',
  '/*/exchange-add-product-form',
];

export const getRouteMeta = (pathname) =>
  ROUTES.find((route) => route.path === pathname) ?? null;
