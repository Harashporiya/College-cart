import { useContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getToken, removeToken } from './tokenService';
import { signInUserSuccess, logout } from '../Components/SagaRedux/Slice';
import * as api from "../Components/SagaRedux/api";
import { UserDataContext } from '../Components/Header/context';

const PersistentAuth = ({ children }) => {
  const dispatch = useDispatch();
  const { setData } = useContext(UserDataContext);
  const { status, user } = useSelector((state) => state.app);

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

  return children;
};

export default PersistentAuth;
