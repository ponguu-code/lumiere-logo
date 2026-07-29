'use strict';

document.addEventListener('DOMContentLoaded', function () {

  /* =====================================
     1. ヘッダー：スクロールで背景を濃くする
     ===================================== */
  const header = document.getElementById('header');

  const onScroll = function () {
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* =====================================
     2. ハンバーガーメニュー
     ===================================== */
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('globalNav');
  const overlay = document.getElementById('navOverlay');

  const openMenu = function () {
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'メニューを閉じる');
    nav.classList.add('is-open');
    document.body.classList.add('is-locked');
    overlay.hidden = false;
    requestAnimationFrame(function () {
      overlay.classList.add('is-visible');
    });
  };

  const closeMenu = function () {
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'メニューを開く');
    nav.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    overlay.classList.remove('is-visible');
    window.setTimeout(function () {
      if (!nav.classList.contains('is-open')) overlay.hidden = true;
    }, 400);
  };

  const isMenuOpen = function () {
    return nav.classList.contains('is-open');
  };

  hamburger.addEventListener('click', function () {
    if (isMenuOpen()) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  overlay.addEventListener('click', closeMenu);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isMenuOpen()) {
      closeMenu();
      hamburger.focus();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 1023 && isMenuOpen()) closeMenu();
  });

  /* =====================================
     3. ページ内リンクのスムーススクロール
     ===================================== */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const hash = link.getAttribute('href');
      if (!hash || hash === '#') return;

      const target = document.querySelector(hash);
      if (!target) return;

      e.preventDefault();
      if (isMenuOpen()) closeMenu();

      const headerH = header.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 12;

      window.scrollTo({
        top: top < 0 ? 0 : top,
        behavior: prefersReduced ? 'auto' : 'smooth'
      });
    });
  });

  /* =====================================
     4. スクロールでふわっと表示
     ===================================== */
  const revealItems = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !prefersReduced) {
    const observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add('is-visible');
    });
  }

  /* =====================================
     5. FAQアコーディオン（複数同時に開ける）
     ===================================== */
  const faqButtons = document.querySelectorAll('.faq__q');

  faqButtons.forEach(function (btn) {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    const item = btn.closest('.faq__item');

    btn.addEventListener('click', function () {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      if (isOpen) {
        panel.style.height = panel.scrollHeight + 'px';
        requestAnimationFrame(function () {
          panel.style.height = '0px';
        });
        btn.setAttribute('aria-expanded', 'false');
        item.classList.remove('is-open');
      } else {
        panel.style.height = panel.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
        item.classList.add('is-open');
      }
    });

    panel.addEventListener('transitionend', function (e) {
      if (e.propertyName !== 'height') return;
      if (btn.getAttribute('aria-expanded') === 'true') {
        panel.style.height = 'auto';
      }
    });
  });

  window.addEventListener('resize', function () {
    faqButtons.forEach(function (btn) {
      if (btn.getAttribute('aria-expanded') !== 'true') return;
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (panel) panel.style.height = 'auto';
    });
  });

  /* =====================================
     6. お問い合わせフォームの入力チェック
     ===================================== */
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');

  if (form) {
    const rules = [
      { id: 'name', error: 'err-name', empty: 'お名前を入力してください' },
      { id: 'email', error: 'err-email', empty: 'メールアドレスを入力してください', invalid: 'メールアドレスの形式をご確認ください' },
      { id: 'message', error: 'err-message', empty: 'ご相談内容を入力してください' }
    ];
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const showError = function (field, errorBox, message) {
      field.classList.add('is-error');
      field.setAttribute('aria-invalid', 'true');
      errorBox.textContent = message;
      errorBox.classList.add('is-visible');
    };

    const clearError = function (field, errorBox) {
      field.classList.remove('is-error');
      field.removeAttribute('aria-invalid');
      errorBox.textContent = '';
      errorBox.classList.remove('is-visible');
    };

    const validateField = function (rule) {
      const field = document.getElementById(rule.id);
      const errorBox = document.getElementById(rule.error);
      const value = field.value.trim();

      if (value === '') {
        showError(field, errorBox, rule.empty);
        return false;
      }
      if (rule.id === 'email' && !emailPattern.test(value)) {
        showError(field, errorBox, rule.invalid);
        return false;
      }
      clearError(field, errorBox);
      return true;
    };

    rules.forEach(function (rule) {
      const field = document.getElementById(rule.id);
      field.addEventListener('blur', function () {
        validateField(rule);
      });
      field.addEventListener('input', function () {
        if (field.classList.contains('is-error')) validateField(rule);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      success.hidden = true;

      let firstInvalid = null;
      rules.forEach(function (rule) {
        const ok = validateField(rule);
        if (!ok && !firstInvalid) firstInvalid = document.getElementById(rule.id);
      });

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      form.reset();
      success.hidden = false;
      success.scrollIntoView({ block: 'nearest', behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  }

});
