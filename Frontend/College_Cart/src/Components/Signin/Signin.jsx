import React, { useEffect, useState } from 'react';
import styles from './signin.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { signInUser } from '../SagaRedux/Slice';
import MessageHandler from '../Signup/MessageHandler';
import { useNavigate } from 'react-router-dom';
import { warmBackend } from '../../util/warmBackend';

const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, user, token, error } = useSelector((state) => state.app);

  // Derived from the store rather than mirrored in local state. The old local
  // `isLoading` flag was set on submit but only cleared on failure, so a second
  // attempt after a success left the button stuck on "Signing In...".
  const isLoading = status === 'loading';

  // Start the API container spinning up while the user is still typing, so the
  // cold-start delay does not land on the submit itself.
  useEffect(() => {
    warmBackend();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;
    dispatch(signInUser({ email: email.trim(), password }));
  };

  useEffect(() => {
    if (status === 'success' && user && token) {
      // Previously wrapped in a 2000 ms setTimeout, which added two seconds of
      // dead waiting to every successful login on top of the network round trip.
      navigate('/dashboard', { replace: true });
    }
  }, [status, user, token, navigate]);

  return (
    <div className={styles.bodyContainer}>
      <div className={styles.container}>
        <div className={styles.leftContainer}>
          <div className={styles.formContainer}>
            <div className={styles.box}>
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <p className={styles.signupText}>Sign in</p>
                <p className={styles.textInformation}>Enter your details to access your account</p>

                <div className={styles.emailContainer}>
                  <div className={styles.inputBox}>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <span>Email</span>
                    <i></i>
                  </div>
                </div>

                <div className={styles.passwordContainer}>
                  <div className={styles.inputBox}>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span>Password</span>
                    <i></i>
                  </div>
                  <button
                    type="button"
                    className={styles.forgotpassword}
                    onClick={() => navigate('/forgotpassword')}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* The failure message used to appear only as a toast, so a
                    mistyped password left the form itself looking unchanged. */}
                {status === 'failed' && error && (
                  <p className={styles.formError} role="alert">{error}</p>
                )}

                <div className={styles.btnContainer}>
                  <button type="submit" disabled={isLoading} aria-busy={isLoading}>
                    {isLoading && <span className="cc-spinner" />}
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </button>
                </div>

                <div className={styles.alreadyAccountContainer}>
                  <p className={styles.alreadyAccount}>
                    Don&apos;t have an account?
                    <span className={styles.alreadySignin} onClick={() => navigate('/signup')}> Sign up</span>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className={styles.rightContainer}>
          <p className={styles.panelTagline}>Your campus marketplace</p>
        </div>
      </div>
      <MessageHandler />
    </div>
  );
};

export default Signin;
