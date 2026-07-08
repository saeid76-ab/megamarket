'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from './UserContext';
import { useToast } from './ToastContext';

const initialLogin = { identifier: '', password: '' };
const initialRegister = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  password: '',
  passwordConfirm: '',
  acceptTerms: false
};

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePhone(phone) {
  return /^09[0-9]{9}$/.test(phone);
}

function getPasswordStrength(pwd) {
  let strength = 0;
  if (pwd.length >= 8) strength++;
  if (pwd.length >= 12) strength++;
  if (/[A-Z]/.test(pwd)) strength++;
  if (/[0-9]/.test(pwd)) strength++;
  if (/[^A-Za-z0-9]/.test(pwd)) strength++;
  const levels = [
    { width: '0%', color: 'transparent', text: '' },
    { width: '20%', color: '#EF4444', text: 'خیلی ضعیف' },
    { width: '40%', color: '#F59E0B', text: 'ضعیف' },
    { width: '60%', color: '#F59E0B', text: 'متوسط' },
    { width: '80%', color: '#10B981', text: 'قوی' },
    { width: '100%', color: '#059669', text: 'خیلی قوی' }
  ];
  return levels[strength];
}

export default function AuthModal({ open, initialTab = 'login', onClose, onSuccess = (_user) => {} }) {
  const [tab, setTab] = useState(initialTab);
  const [loginData, setLoginData] = useState(initialLogin);
  const [registerData, setRegisterData] = useState(initialRegister);
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { setUser } = useUser();
  const { showToast } = useToast();
  const router = useRouter();

  if (!open) return null;

  function switchTab(t) {
    setTab(t);
    setErrors({});
  }

  function handleClose() {
    setLoginData(initialLogin);
    setRegisterData(initialRegister);
    setErrors({});
    onClose();
  }

  async function handleLogin(e) {
    e.preventDefault();
    const newErrors = {};
    if (!loginData.identifier.trim()) newErrors.identifier = 'لطفاً شماره موبایل یا ایمیل را وارد کنید';
    if (!loginData.password) newErrors.password = 'لطفاً رمز عبور را وارد کنید';
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ password: data.error || 'شماره موبایل/ایمیل یا رمز عبور اشتباه است' });
        showToast('اطلاعات ورود نادرست است', 'error');
        return;
      }
      setUser(data.user);
      showToast(`خوش آمدید ${data.user.firstName}!`, 'success');
      handleClose();
      if (onSuccess) onSuccess(data.user);
      router.refresh();
    } catch {
      showToast('خطا در برقراری ارتباط با سرور', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    const d = registerData;
    const newErrors = {};
    if (d.firstName.trim().length < 2) newErrors.firstName = 'نام باید حداقل ۲ کاراکتر باشد';
    if (d.lastName.trim().length < 2) newErrors.lastName = 'نام خانوادگی باید حداقل ۲ کاراکتر باشد';
    if (!validatePhone(d.phone.trim())) newErrors.phone = 'شماره موبایل معتبر نیست';
    if (!validateEmail(d.email.trim())) newErrors.email = 'ایمیل معتبر نیست';
    if (d.password.length < 8) newErrors.password = 'رمز عبور باید حداقل ۸ کاراکتر باشد';
    if (d.password !== d.passwordConfirm) newErrors.passwordConfirm = 'رمز عبور و تکرار آن یکسان نیستند';
    if (!d.acceptTerms) {
      showToast('لطفاً قوانین و مقررات را بپذیرید', 'error');
      newErrors.acceptTerms = true;
    }
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: d.firstName.trim(),
          lastName: d.lastName.trim(),
          phone: d.phone.trim(),
          email: d.email.trim(),
          password: d.password
        })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.field) setErrors({ [data.field]: data.error });
        else showToast(data.error || 'خطا در ثبت‌نام', 'error');
        return;
      }
      setUser(data.user);
      showToast(`ثبت‌نام با موفقیت انجام شد. خوش آمدید ${data.user.firstName}!`, 'success');
      handleClose();
      if (onSuccess) onSuccess(data.user);
      router.refresh();
    } catch {
      showToast('خطا در برقراری ارتباط با سرور', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const pwdStrength = getPasswordStrength(registerData.password);

  return (
    <div className="modal-overlay active" onClick={(e) => e.target.classList.contains('modal-overlay') && handleClose()}>
      <div className="modal auth-modal">
        <div className="modal-header">
          <h3>{tab === 'login' ? 'ورود به حساب کاربری' : 'ایجاد حساب کاربری'}</h3>
          <button className="close-btn" onClick={handleClose}>✕</button>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => switchTab('login')}>ورود</button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => switchTab('register')}>ثبت‌نام</button>
        </div>

        {tab === 'login' && (
          <form className="auth-form active" onSubmit={handleLogin}>
            <h4 className="auth-form-title">خوش آمدید!</h4>
            <p className="auth-form-subtitle">برای ورود به حساب کاربری، اطلاعات خود را وارد کنید</p>

            <div className="form-group">
              <label>شماره موبایل یا ایمیل <span className="required">*</span></label>
              <input
                type="text"
                className={`form-input ${errors.identifier ? 'error' : ''}`}
                placeholder="09123456789 یا email@example.com"
                value={loginData.identifier}
                onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
              />
              {errors.identifier && <div className="form-error show">{errors.identifier}</div>}
            </div>

            <div className="form-group">
              <label>رمز عبور <span className="required">*</span></label>
              <div className="password-wrapper">
                <input
                  type={showPwd.login ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="رمز عبور خود را وارد کنید"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                />
                <button type="button" className="password-toggle" onClick={() => setShowPwd((s) => ({ ...s, login: !s.login }))}>
                  {showPwd.login ? '🙈' : '👁'}
                </button>
              </div>
              {errors.password && <div className="form-error show">{errors.password}</div>}
            </div>

            <div className="form-options">
              <label className="checkbox-group">
                <input type="checkbox" />
                <span>مرا به خاطر بسپار</span>
              </label>
              <button
                type="button"
                className="forgot-link"
                onClick={() => showToast('لینک بازیابی به ایمیل شما ارسال شد', 'success')}
              >
                فراموشی رمز عبور؟
              </button>
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'در حال ورود...' : 'ورود به حساب'}
            </button>

            <div className="auth-divider">یا ورود با</div>
            <div className="social-login">
              <button type="button" className="social-btn" onClick={() => showToast('ورود با گوگل')}>🔴 گوگل</button>
              <button type="button" className="social-btn" onClick={() => showToast('ورود با اینستاگرام')}>📷 اینستاگرام</button>
            </div>

            <div className="auth-footer">
              حساب کاربری ندارید؟ <a onClick={() => switchTab('register')}>ثبت‌نام کنید</a>
            </div>
          </form>
        )}

        {tab === 'register' && (
          <form className="auth-form active" onSubmit={handleRegister}>
            <h4 className="auth-form-title">ایجاد حساب کاربری</h4>
            <p className="auth-form-subtitle">در کمتر از یک دقیقه عضو مگامارکت شوید</p>

            <div className="form-row">
              <div className="form-group">
                <label>نام <span className="required">*</span></label>
                <input
                  type="text"
                  className={`form-input ${errors.firstName ? 'error' : ''}`}
                  placeholder="نام"
                  value={registerData.firstName}
                  onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                />
                {errors.firstName && <div className="form-error show">{errors.firstName}</div>}
              </div>
              <div className="form-group">
                <label>نام خانوادگی <span className="required">*</span></label>
                <input
                  type="text"
                  className={`form-input ${errors.lastName ? 'error' : ''}`}
                  placeholder="نام خانوادگی"
                  value={registerData.lastName}
                  onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                />
                {errors.lastName && <div className="form-error show">{errors.lastName}</div>}
              </div>
            </div>

            <div className="form-group">
              <label>شماره موبایل <span className="required">*</span></label>
              <input
                type="tel"
                className={`form-input ${errors.phone ? 'error' : ''}`}
                placeholder="09123456789"
                value={registerData.phone}
                onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
              />
              {errors.phone && <div className="form-error show">{errors.phone}</div>}
            </div>

            <div className="form-group">
              <label>ایمیل <span className="required">*</span></label>
              <input
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="email@example.com"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              />
              {errors.email && <div className="form-error show">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label>رمز عبور <span className="required">*</span></label>
              <div className="password-wrapper">
                <input
                  type={showPwd.reg ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="حداقل ۸ کاراکتر"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                />
                <button type="button" className="password-toggle" onClick={() => setShowPwd((s) => ({ ...s, reg: !s.reg }))}>
                  {showPwd.reg ? '🙈' : '👁'}
                </button>
              </div>
              <div className="password-strength">
                <div className="password-strength-bar" style={{ width: pwdStrength.width, background: pwdStrength.color }} />
              </div>
              <div className="password-strength-text" style={{ color: pwdStrength.color }}>{pwdStrength.text}</div>
              {errors.password && <div className="form-error show">{errors.password}</div>}
            </div>

            <div className="form-group">
              <label>تکرار رمز عبور <span className="required">*</span></label>
              <div className="password-wrapper">
                <input
                  type={showPwd.regConfirm ? 'text' : 'password'}
                  className={`form-input ${errors.passwordConfirm ? 'error' : ''}`}
                  placeholder="تکرار رمز عبور"
                  value={registerData.passwordConfirm}
                  onChange={(e) => setRegisterData({ ...registerData, passwordConfirm: e.target.value })}
                />
                <button type="button" className="password-toggle" onClick={() => setShowPwd((s) => ({ ...s, regConfirm: !s.regConfirm }))}>
                  {showPwd.regConfirm ? '🙈' : '👁'}
                </button>
              </div>
              {errors.passwordConfirm && <div className="form-error show">{errors.passwordConfirm}</div>}
            </div>

            <div className="form-options" style={{ justifyContent: 'flex-start' }}>
              <label className="checkbox-group">
                <input
                  type="checkbox"
                  checked={registerData.acceptTerms}
                  onChange={(e) => setRegisterData({ ...registerData, acceptTerms: e.target.checked })}
                />
                <span>با <a className="forgot-link" style={{ display: 'inline' }}>قوانین و مقررات</a> موافقم</span>
              </label>
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
            </button>

            <div className="auth-footer">
              قبلاً ثبت‌نام کرده‌اید؟ <a onClick={() => switchTab('login')}>وارد شوید</a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
