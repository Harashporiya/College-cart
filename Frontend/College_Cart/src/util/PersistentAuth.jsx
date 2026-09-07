import { useContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getToken, removeToken } from './tokenService';
import { signInUserSuccess, logout } from '../Components/SagaRedux/Slice';
import * as api from "../Components/SagaRedux/api";
import { UserDataContext } from '../Components/Header/context';

/**
 * Restores the signed-in user from the stored token on app start.
 */
const PersistentAuth = ({ children }) => {
  const dispatch = useDispatch();
  const { setData } = useContext(UserDataContext);
  const { status, user } = useSelector((state) => state.app);

  // The effect below depended on `user`, and its own dispatch sets `user` -
  // so any failure that left `user` null (an expired token returning 403, a
  // cold-start timeout) re-ran it on every subsequent render, firing the
  // profile request repeatedly. This guard makes the check happen once per
  // token.
  const checkedToken = useRef(null);

  useEffect(() => {
    const savedToken = getToken();
    if (!savedToken || user) return;
    if (checkedToken.current === savedToken) return;
    checkedToken.current = savedToken;

    let cancelled = false;

    const checkAuth = async () => {
      try {
        const response = await api.getUserProfile();
        if (cancelled) return;

        dispatch(signInUserSuccess({
          token: savedToken,
          user: response.data.data,
        }));
        setData(response.data.data);
      } catch (error) {
        if (cancelled) return;
        // Only a rejected token should sign the user out. A network failure or
        // a cold backend used to fall through silently, leaving the app in a
        // half-authenticated state with a valid token and no user.
        if (error.status === 401 || error.status === 403) {
          removeToken();
          dispatch(logout());
          setData('');
        } else {
          console.error('Auth check failed:', error.message);
        }
      }
    };

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, [dispatch, setData, user]);

  useEffect(() => {
    if (status === 'success' && user) {
      setData(user);
    }
  }, [status, user, setData]);

  // Children render immediately rather than waiting on the profile request:
  // the token in the store is enough for ProtectedRoute, and the header fills
  // in the user's name as soon as the response lands.
  return children;
};

export default PersistentAuth;
