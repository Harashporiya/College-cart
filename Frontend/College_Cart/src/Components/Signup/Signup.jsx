import React, { useState, useEffect } from 'react';
import styles from './signup.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { emailVerify, signUpUser } from '../SagaRedux/Slice';
import MessageHandler from './MessageHandler';
import { useNavigate } from 'react-router-dom';
import { warmBackend } from '../../util/warmBackend';
import { Eye, EyeOff } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [username, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [verificationShowInput, setVerificationShowInput] = useState(false);
  const dispatch = useDispatch();
  const { status, user, token, error } = useSelector((state) => state.app);
  const navigate = useNavigate();

  const isLoading = status === 'loading';

  useEffect(() => {
    warmBackend();
  }, []);

  useEffect(() => {
    if (status === 'success') {
      setVerificationShowInput(true);
      setName('');
      setUserName('');
      setPassword('');
    }
  }, [status]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;
    dispatch(signUpUser({ name, username, email: email.trim(), password }));
  };

  const verifyEmailAccount = (e) => {
    e.preventDefault();
    if (isLoading) return;
    dispatch(emailVerify({ email: email.trim(), code: code.trim() }));
  };

  useEffect(() => {
    if (status === 'success' && user && token) {
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
                <p className={styles.signupText}>Sign up</p>
                <p className={styles.textInformation}>Enter your information to create an account</p>

                <div className={styles.nameContainer}>
                  <div className={styles.inputBox}>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <span>Name</span>
                    <i></i>
                  </div>
                </div>

                <div className={styles.usernameContainer}>
                  <div className={styles.inputBox}>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      value={username}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                    <span>Username</span>
                    <i></i>
                  </div>
                </div>

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
                      className={styles.passwordInput}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span>Password</span>
                    <i></i>
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className={styles.btnContainer}>
                  <button type="submit" disabled={isLoading} aria-busy={isLoading}>
                    {isLoading && <span className="cc-spinner" />}
                    {isLoading ? 'Verifying...' : 'Account Verification'}
                  </button>
                </div>

                {status === 'failed' && error && (
                  <p className={styles.errorMessage} role="alert">{error}</p>
                )}

                <div className={styles.alreadyAccountContainer}>
                  <p className={styles.alreadyAccount}>
                    Already have an account?
                    <span className={styles.alreadySignin} onClick={() => navigate('/login')}> Sign in</span>
                  </p>
                </div>

                {verificationShowInput && (
                  <div className={styles.verificationOverlay}>
                    <div className={styles.verificationDialog} role="dialog" aria-modal="true" aria-label="Email verification">
                      <button
                        type="button"
                        className={styles.closeButton}
                        onClick={() => setVerificationShowInput(false)}
                        aria-label="Close verification dialog"
                      >
                        &times;
                      </button>
                      <h3 className={styles.verificationTitle}>Email Verification</h3>
                      <p className={styles.verificationMessage}>
                        A verification code has been sent to {email}
                      </p>
                      <div className={styles.otpinputBox}>
                        <input
                          id="code"
                          className={styles.verificationInput}
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          required
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                        />
                        <span className={styles.otpspan}>Enter verification code</span>
                        <i className={styles.otpi}></i>
                      </div>

                      <div className={styles.createAccountContainer}>
                        <button
                          type="button"
                          onClick={verifyEmailAccount}
                          className={styles.createAccount}
                          disabled={isLoading}
                          aria-busy={isLoading}
                        >
                          {isLoading && <span className="cc-spinner" />}
                          {isLoading ? 'Creating account...' : 'Create account'}
                        </button>
                      </div>
                      <div className={styles.resendText}>
                        Didn&apos;t receive the code?{' '}
                        <button type="button" className={styles.resendButton} onClick={handleSubmit}>
                          Resend
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
        <div className={styles.rightContainer}>
          <p className={styles.panelTagline}>Join your campus marketplace</p>
        </div>
      </div>
      <MessageHandler />
    </div>
  );
};

export default Signup;
