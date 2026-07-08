'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/components/UserContext';
import { useToast } from '@/components/ToastContext';

function validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function validatePhone(p) { return /^09[0-9]{9}$/.test(p); }
function getStrength(pwd) {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (pwd.length >= 12) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return [['', 'خیلی ضعیف', 'ضعیف', 'متوسط', 'قوی', 'خیلی قوی'][s],
          ['transparent', '#EF4444', '#F59E0B', '#F59E0B', '#10B981', '#059669'][s],
          [0, 20, 40, 60, 80, 100][s]];
}

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { setUser } = useUser();
  const { showToast } = useToast();

  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', password: '', passwordConfirm: '', acceptTerms: false });
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [strengthLabel, strengthColor, strengthPct] = getStrength(form.password);

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (form.firstName.trim().length < 2) errs.firstName = 'نام باید حداقل ۲ کاراکتر باشد';
    if (form.lastName.trim().length < 2) errs.lastName = 'نام خانوادگی باید حداقل ۲ کاراکتر باشد';
    if (!validatePhone(form.phone.trim())) errs.phone = 'شماره موبایل معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹)';
    if (!validateEmail(form.email.trim())) errs.email = 'ایمیل معتبر نیست';
    if (form.password.length < 8) errs.password = 'رمز عبور باید حداقل ۸ کاراکتر باشد';
    if (form.password !== form.passwordConfirm) errs.passwordConfirm = 'رمز عبور و تکرار آن یکسان نیستند';
    if (!form.acceptTerms) errs.terms = 'پذیرش قوانین الزامی است';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), phone: form.phone.trim(), email: form.email.trim(), password: form.password })
      });
      const data = await res.json();
      if (!res.ok) { setErrors({ [data.field || 'email']: data.error }); return; }
      setUser(data.user);
      showToast(`خوش آمدید ${data.user.firstName}! ثبت‌نام موفق بود`, 'success');
      router.push(redirect);
    } catch { showToast('خطا در ارتباط با سرور', 'error'); }
    finally { setSubmitting(false); }
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg-alt)' }}>
      <div style={{ background: 'var(--white)', borderRadius: 16, padding: '40px 35px', width: '100%', maxWidth: 500, border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div className="logo-icon" style={{ margin: '0 auto 12px', width: 52, height: 52 }}>MM</div>
          <h1 style={{ fontSize: 22, fontWeight: 'bold', color: 'var(--text)' }}>ایجاد حساب کاربری</h1>
          <p style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 6 }}>در کمتر از یک دقیقه عضو مگامارکت شوید</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>نام <span className="required">*</span></label>
              <input className={`form-input ${errors.firstName ? 'error' : ''}`} placeholder="نام" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
              {errors.firstName && <div className="form-error show">{errors.firstName}</div>}
            </div>
            <div className="form-group">
              <label>نام خانوادگی <span className="required">*</span></label>
              <input className={`form-input ${errors.lastName ? 'error' : ''}`} placeholder="نام خانوادگی" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
              {errors.lastName && <div className="form-error show">{errors.lastName}</div>}
            </div>
          </div>

          <div className="form-group">
            <label>شماره موبایل <span className="required">*</span></label>
            <input className={`form-input ${errors.phone ? 'error' : ''}`} placeholder="09123456789" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            {errors.phone && <div className="form-error show">{errors.phone}</div>}
          </div>

          <div className="form-group">
            <label>ایمیل <span className="required">*</span></label>
            <input type="email" className={`form-input ${errors.email ? 'error' : ''}`} placeholder="email@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            {errors.email && <div className="form-error show">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label>رمز عبور <span className="required">*</span></label>
            <div className="password-wrapper">
              <input type={showPwd ? 'text' : 'password'} className={`form-input ${errors.password ? 'error' : ''}`} placeholder="حداقل ۸ کاراکتر" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              <button type="button" className="password-toggle" onClick={() => setShowPwd(v => !v)}>{showPwd ? '🙈' : '👁'}</button>
            </div>
            {form.password && (
              <>
                <div className="password-strength"><div className="password-strength-bar" style={{ width: `${strengthPct}%`, background: strengthColor }} /></div>
                <div className="password-strength-text" style={{ color: strengthColor }}>{strengthLabel}</div>
              </>
            )}
            {errors.password && <div className="form-error show">{errors.password}</div>}
          </div>

          <div className="form-group">
            <label>تکرار رمز عبور <span className="required">*</span></label>
            <input type="password" className={`form-input ${errors.passwordConfirm ? 'error' : ''}`} placeholder="تکرار رمز عبور" value={form.passwordConfirm} onChange={e => setForm({ ...form, passwordConfirm: e.target.value })} />
            {errors.passwordConfirm && <div className="form-error show">{errors.passwordConfirm}</div>}
          </div>

          <div className="form-options" style={{ justifyContent: 'flex-start', marginBottom: 20 }}>
            <label className="checkbox-group">
              <input type="checkbox" checked={form.acceptTerms} onChange={e => setForm({ ...form, acceptTerms: e.target.checked })} />
              <span>با <a className="forgot-link" style={{ display: 'inline' }}>قوانین و مقررات</a> موافقم</span>
            </label>
          </div>
          {errors.terms && <div className="form-error show" style={{ marginTop: -12, marginBottom: 12 }}>{errors.terms}</div>}

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
          </button>

          <div className="auth-footer" style={{ marginTop: 16 }}>
            قبلاً ثبت‌نام کرده‌اید؟ <Link href={`/login?redirect=${redirect}`} className="forgot-link">وارد شوید</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
