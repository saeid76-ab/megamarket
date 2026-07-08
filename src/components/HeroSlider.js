'use client';

import { useState, useRef, useEffect } from 'react';

const slides = [
  { href: 'https://example.com/electronics', alt: 'الکترونیک', image: 'https://image.qwenlm.ai/public_source/0ceeb63e-e063-4495-b2d9-98890add1c34/1da626211-0fb6-4ce9-b41b-b420fac83750.png' },
  { href: 'https://example.com/fashion', alt: 'پوشاک', image: 'https://image.qwenlm.ai/public_source/0ceeb63e-e063-4495-b2d9-98890add1c34/188c1cdf4-92c2-4244-b71b-ddafb7d2a319.png' },
  { href: 'https://example.com/home', alt: 'لوازم خانگی', image: 'https://image.qwenlm.ai/public_source/0ceeb63e-e063-4495-b2d9-98890add1c34/1e9698b94-34b7-4068-b325-38704dc30003.png' },
  { href: 'https://example.com/beauty', alt: 'زیبایی', image: 'https://image.qwenlm.ai/public_source/0ceeb63e-e063-4495-b2d9-98890add1c34/11badaed6-ddf9-468f-ac0a-d8d8a8ece7ea.png' },
  { href: 'https://example.com/sports', alt: 'ورزشی', image: 'https://image.qwenlm.ai/public_source/0ceeb63e-e063-4495-b2d9-98890add1c34/165519a6e-3f61-4fa0-8359-a0448c1a79fd.png' },
  { href: 'https://example.com/offers', alt: 'تخفیف ویژه', image: 'https://image.qwenlm.ai/public_source/0ceeb63e-e063-4495-b2d9-98890add1c34/1702ab572-f3f9-4b4d-9713-8747fb52c9f0.png' }
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const wrapperRef = useRef(null);
  const dragState = useRef({ isDragging: false, startX: 0, currentX: 0, clickAllowed: true });

  function changeSlide(dir) {
    setCurrent((c) => (c + dir + slides.length) % slides.length);
  }

  function goToSlide(i) {
    setCurrent(i);
  }

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    function onDown(clientX, target) {
      if (target.closest('.slider-btn') || target.closest('.slider-dot')) return;
      dragState.current = { isDragging: true, startX: clientX, currentX: clientX, clickAllowed: true };
    }
    function onMove(clientX) {
      if (!dragState.current.isDragging) return;
      dragState.current.currentX = clientX;
      if (Math.abs(clientX - dragState.current.startX) > 10) dragState.current.clickAllowed = false;
    }
    function onUp() {
      if (!dragState.current.isDragging) return;
      dragState.current.isDragging = false;
      const d = dragState.current.startX - dragState.current.currentX;
      if (Math.abs(d) > 50) {
        dragState.current.clickAllowed = false;
        changeSlide(d > 0 ? 1 : -1);
      }
    }

    function mouseDown(e) { onDown(e.pageX, e.target); }
    function mouseMove(e) { onMove(e.pageX); }
    function mouseUp() { onUp(); }
    function mouseLeave() { dragState.current.isDragging = false; }
    function touchStart(e) { onDown(e.touches[0].pageX, e.target); }
    function touchMove(e) { onMove(e.touches[0].pageX); }
    function touchEnd() { onUp(); }
    function clickCapture(e) {
      if (!dragState.current.clickAllowed) {
        e.preventDefault();
        e.stopPropagation();
        dragState.current.clickAllowed = true;
      }
    }

    el.addEventListener('mousedown', mouseDown);
    el.addEventListener('mousemove', mouseMove);
    el.addEventListener('mouseup', mouseUp);
    el.addEventListener('mouseleave', mouseLeave);
    el.addEventListener('touchstart', touchStart);
    el.addEventListener('touchmove', touchMove);
    el.addEventListener('touchend', touchEnd);
    el.addEventListener('click', clickCapture, true);

    return () => {
      el.removeEventListener('mousedown', mouseDown);
      el.removeEventListener('mousemove', mouseMove);
      el.removeEventListener('mouseup', mouseUp);
      el.removeEventListener('mouseleave', mouseLeave);
      el.removeEventListener('touchstart', touchStart);
      el.removeEventListener('touchmove', touchMove);
      el.removeEventListener('touchend', touchEnd);
      el.removeEventListener('click', clickCapture, true);
    };
  }, []);

  return (
    <section className="hero-slider">
      <div className="slider-wrapper" ref={wrapperRef}>
        {slides.map((s, i) => (
          <div className={`slide ${i === current ? 'active' : ''}`} key={i}>
            <a href={s.href} className="slide-link" target="_blank" rel="noreferrer">
              <img src={s.image} alt={s.alt} />
            </a>
          </div>
        ))}
        <button className="slider-btn prev" onClick={(e) => { e.stopPropagation(); changeSlide(-1); }}>❯</button>
        <button className="slider-btn next" onClick={(e) => { e.stopPropagation(); changeSlide(1); }}>❮</button>
        <div className="slider-dots">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`slider-dot ${i === current ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); goToSlide(i); }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
