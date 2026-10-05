import React, { lazy, Suspense } from 'react'
import './App.css'
import { Provider } from 'react-redux'
import { Routes, BrowserRouter, Route } from "react-router-dom"
import Store from './Components/SagaRedux/Store'
import PersistentAuth from './util/PersistentAuth'
import ProtectedRoute from './util/ProtectedRoute'
import ScrollToTop from './util/ScrollToTop'

import Home from './Components/Home/Home'
import Signin from './Components/Signin/Signin'
import Signup from './Components/Signup/Signup'

const ForgotPassword = lazy(() => import('./Components/ForgetPassword/Form'))
const Reset = lazy(() => import('./Components/ResetPassword/Reset'))
const Profile = lazy(() => import('./Components/Profile/Profile'))
const AddProduct = lazy(() => import('./Components/AddProductForm/AddProduct'))
const Product = lazy(() => import('./Components/Product/Product'))
const Messages = lazy(() => import('./Components/Messages/Messages'))
const ProductDetails = lazy(() => import('./Components/Product/ProductDetails'))
const CartProduct = lazy(() => import('./Components/CartProduct/CartProduct'))
const Electronic = lazy(() => import('./Components/Home/Category/Electronices/ExploreElectronices/Electronic'))
const Book = lazy(() => import('./Components/Home/Category/Books/ExploreBooks/Books'))
const Clothings = lazy(() => import('./Components/Home/Category/Clothings/ExploreClothings/Clothings'))
const Sport = lazy(() => import('./Components/Home/Category/SportsEquipment/ExploreSports/Sport'))
const Grocery = lazy(() => import('./Components/Home/Category/Grocery/ExploreGrocery/Grocery'))
const ExchangeBook = lazy(() => import('./Components/ExchangeBookForm/ExchangeBook'))
const ExchangeBookAllProduct = lazy(() => import('./Components/ProductExchangebook/ExchangeBook'))
const OurTeam = lazy(() => import('./Components/OurTeam/OurTeam'))
const AboutUs = lazy(() => import('./Components/AboutUs/AboutUs'))
const Faq = lazy(() => import('./Components/Faq/Faq'))
const ContactUs = lazy(() => import('./Components/ContactUs/ContactUs'))
const Setting = lazy(() => import('./Components/Setting/Setting'))

const RouteFallback = () => (
  <div className="cc-route-fallback" role="status" aria-live="polite">
    <span className="cc-spinner" />
    <span>Loading...</span>
  </div>
)

const App = () => {
  return (
    <Provider store={Store}>
      <PersistentAuth>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/dashboard' element={<Home />} />
              <Route path='/login' element={<Signin />} />
              <Route path='/signup' element={<Signup />} />
              <Route path='/forgotpassword' element={<ForgotPassword />} />
              <Route path='/newPassword' element={<Reset />} />

              <Route path='/all-products' element={<Product />} />
              <Route path='/:id/product' element={<ProductDetails />} />
              <Route path='/addCartProudct' element={<CartProduct />} />
              <Route path='/messages' element={<Messages />} />

              <Route path='/all-electronic-item' element={<Electronic />} />
              <Route path='/all-book-item' element={<Book />} />
              <Route path='/all-clothing-item' element={<Clothings />} />
              <Route path='/all-sport-item' element={<Sport />} />
              <Route path='/all-grocery-item' element={<Grocery />} />
              <Route path='/all-products-exchange-books' element={<ExchangeBookAllProduct />} />

              <Route path='/aboutus' element={<AboutUs />} />
              <Route path='/our-team' element={<OurTeam />} />
              <Route path='/faq' element={<Faq />} />
              <Route path='/contact-us' element={<ContactUs />} />
              <Route path='/setting' element={<Setting />} />

              <Route
                path='/:id/user-profile'
                element={<ProtectedRoute><Profile /></ProtectedRoute>}
              />
              <Route
                path='/:id/add-products-user'
                element={<ProtectedRoute><AddProduct /></ProtectedRoute>}
              />
              <Route
                path='/:id/exchange-add-product-form'
                element={<ProtectedRoute><ExchangeBook /></ProtectedRoute>}
              />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </PersistentAuth>
    </Provider>
  )
}

export default App
