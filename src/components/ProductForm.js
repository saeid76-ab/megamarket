'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './ToastContext';

const ribbonColors = [
  { value: '', label: 'بدون رنگ خاص' },
  { value: 'primary', label: 'آبی (پیش‌فرض)' },
  { value: 'green', label: 'سبز' },
  { value: 'gold', label: 'طلایی' },
  { value: 'blue', label: 'آبی تیره' },
  { value: 'red', label: 'قرمز' },
  { value: 'purple', label: 'بنفش' },
  { value: 'orange', label: 'نارنجی' },
  { value: 'custom', label: 'رنگ دلخواه (کد HEX)' }
];

function slugify(text) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export default function ProductForm({ initialProduct = null }) {
  const isEdit = !!initialProduct;
  const router = useRouter();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [autoSlug, setAutoSlug] = useState(!isEdit);

  const [form, setForm] = useState(() => ({
    name: initialProduct?.name || '',
    slug: initialProduct?.slug || '',
    description: initialProduct?.description || '',
    price: initialProduct?.price || '',
    discount: initialProduct?.discount ?? 0,
    stock: initialProduct?.stock ?? 100,
    categoryId: initialProduct?.categoryId || '',
    ribbon: initialProduct?.ribbon || '',
    ribbonColor: initialProduct?.ribbonColor || '',
    imageUrl: initialProduct?.images?.[0]?.url || ''
  }));

  const [specs, setSpecs] = useState(() => {
    if (!initialProduct?.specs) return [''];
    try {
      const parsed = JSON.parse(initialProduct.specs);
      return parsed.length ? parsed : [''];
    } catch {
      return [''];
    }
  });

  const [options, setOptions] = useState(() => {
    if (!initialProduct?.options) return [];
    try {
      const parsed = JSON.parse(initialProduct.options);
      return parsed.map((o) => ({ label: o.label, valuesText: o.values.join(', ') }));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    if (autoSlug && form.name) {
      setForm((f) => ({ ...f, slug: slugify(form.name) }));
    }
  }, [form.name, autoSlug]);

  function updateSpec(idx, value) {
    setSpecs((s) => s.map((item, i) => (i === idx ? value : item)));
  }
  function addSpec() {
    setSpecs((s) => [...s, '']);
  }
  function removeSpec(idx) {
    setSpecs((s) => s.filter((_, i) => i !== idx));
  }

  function addOption() {
    setOptions((o) => [...o, { label: '', valuesText: '' }]);
  }
  function updateOption(idx, field, value) {
    setOptions((o) => o.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  }
  function removeOption(idx) {
    setOptions((o) => o.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name.trim() || !form.slug.trim() || !form.categoryId || !form.imageUrl.trim()) {
      showToast('لطفاً فیلدهای ضروری را پر کنید', 'error');
      return;
    }

    const payload = {
      ...form,
      price: Number(form.price),
      discount: Number(form.discount),
      stock: Number(form.stock),
      specs: specs.map((s) => s.trim()).filter(Boolean),
      options: options
        .filter((o) => o.label.trim() && o.valuesText.trim())
        .map((o) => ({
          label: o.label.trim(),
          values: o.valuesText.split(',').map((v) => v.trim()).filter(Boolean)
        }))
    };

    setSubmitting(true);
    try {
      const url = isEdit ? `/api/admin/products/${initialProduct.id}` : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'خطا در ذخیره محصول', 'error');
        return;
      }
      showToast(isEdit ? 'محصول با موفقیت به‌روزرسانی شد' : 'محصول جدید با موفقیت اضافه شد', 'success');
      router.push('/admin/products');
      router.refresh();
    } catch {
      showToast('خطا در برقراری ارتباط با سرور', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="account-card">
        <h3>اطلاعات پایه</h3>
        <div className="admin-form-grid">
          <div className="form-group">
            <label>نام محصول <span className="required">*</span></label>
            <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>شناسه (Slug) <span className="required">*</span></label>
            <input
              className="form-input"
              value={form.slug}
              onChange={(e) => { setAutoSlug(false); setForm({ ...form, slug: slugify(e.target.value) }); }}
              placeholder="مثلاً: samsung-galaxy-s24"
            />
          </div>

          <div className="form-group admin-form-full">
            <label>توضیحات کوتاه <span className="required">*</span></label>
            <textarea className="form-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div className="form-group">
            <label>دسته‌بندی <span className="required">*</span></label>
            <select className="form-input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">انتخاب کنید...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>آدرس تصویر اصلی (URL) <span className="required">*</span></label>
            <input className="form-input" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
          </div>

          <div className="form-group">
            <label>قیمت پایه (تومان) <span className="required">*</span></label>
            <input type="number" className="form-input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div className="form-group">
            <label>درصد تخفیف</label>
            <input type="number" min="0" max="90" className="form-input" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
          </div>
          <div className="form-group">
            <label>موجودی انبار</label>
            <input type="number" min="0" className="form-input" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </div>

          <div className="form-group">
            <label>برچسب (Ribbon)</label>
            <input className="form-input" value={form.ribbon} onChange={(e) => setForm({ ...form, ribbon: e.target.value })} placeholder="مثلاً: جدید، پرفروش" />
          </div>
          <div className="form-group">
            <label>رنگ برچسب</label>
            <select className="form-input" value={form.ribbonColor} onChange={(e) => setForm({ ...form, ribbonColor: e.target.value })}>
              {ribbonColors.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            {form.ribbonColor === 'custom' && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="color" style={{ width: 40, height: 36, border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', padding: 2 }}
                  onChange={e => setForm({ ...form, ribbonColor: e.target.value })} />
                <input className="form-input" style={{ flex: 1 }} placeholder="#FF5733" value={form.ribbonColor === 'custom' ? '' : form.ribbonColor}
                  onChange={e => setForm({ ...form, ribbonColor: e.target.value })} />
              </div>
            )}
            {form.ribbon && form.ribbonColor && (
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-light)' }}>پیش‌نمایش: </span>
                <span style={{ background: form.ribbonColor.startsWith('#') ? form.ribbonColor : `var(--${form.ribbonColor === 'primary' ? 'primary' : form.ribbonColor === 'green' ? 'accent' : form.ribbonColor})`, color: '#fff', padding: '2px 10px', borderRadius: 4, fontSize: 12, fontWeight: 'bold' }}>
                  {form.ribbon}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="account-card">
        <h3>مشخصات فنی</h3>
        {specs.map((s, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input
              className="form-input"
              value={s}
              onChange={(e) => updateSpec(idx, e.target.value)}
              placeholder="مثلاً: رم: ۸ گیگابایت"
            />
            <button type="button" className="admin-btn danger" onClick={() => removeSpec(idx)}>حذف</button>
          </div>
        ))}
        <button type="button" className="admin-btn outline" onClick={addSpec}>+ افزودن مشخصه</button>
      </div>

      <div className="account-card">
        <h3>آپشن‌های محصول (مثل رنگ، سایز)</h3>
        {options.map((o, idx) => (
          <div key={idx} className="form-row" style={{ marginBottom: 10, alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>عنوان آپشن</label>
              <input className="form-input" value={o.label} onChange={(e) => updateOption(idx, 'label', e.target.value)} placeholder="مثلاً: رنگ" />
            </div>
            <div className="form-group" style={{ marginBottom: 0, display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label>مقادیر (با کاما جدا کنید)</label>
                <input className="form-input" value={o.valuesText} onChange={(e) => updateOption(idx, 'valuesText', e.target.value)} placeholder="مشکی, سفید, آبی" />
              </div>
              <button type="button" className="admin-btn danger" style={{ marginBottom: 0, alignSelf: 'flex-end' }} onClick={() => removeOption(idx)}>حذف</button>
            </div>
          </div>
        ))}
        <button type="button" className="admin-btn outline" onClick={addOption}>+ افزودن آپشن</button>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="submit" className="admin-btn primary" style={{ padding: '12px 30px', fontSize: 14 }} disabled={submitting}>
          {submitting ? 'در حال ذخیره...' : isEdit ? 'ذخیره تغییرات' : 'افزودن محصول'}
        </button>
      </div>
    </form>
  );
}
