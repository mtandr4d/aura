// Aura — landing page interactions
(function () {
  // Nav scroll effect
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 20) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Burger menu
  const burger = document.getElementById('navBurger');
  const links = document.querySelector('.nav__links');
  if (burger) {
    burger.addEventListener('click', () => links.classList.toggle('open'));
    document.querySelectorAll('.nav__links a').forEach((a) =>
      a.addEventListener('click', () => links.classList.remove('open'))
    );
  }

  // Reveal on scroll
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.animation = 'slideUp .8s ease-out';
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  document.querySelectorAll('.card, .feat, .testi__card, .sec__item, .meaning__item, .stat').forEach((el) => io.observe(el));

  // ============================================================
  // 📦 APK DOWNLOAD — Configuração
  // ------------------------------------------------------------
  // Link público do build do EAS (versão 2.0.0)
  // Para atualizar quando gerar um novo build, basta substituir
  // a string abaixo pelo novo link do expo.dev.
  // ============================================================
  const APK_URL = window.AURA_APK_URL || 'https://expo.dev/accounts/mtandrad/projects/aura-cuidamais/builds/6c819fe9-c11d-4bfc-81b1-9ba7d367727d';

  const apkBtn = document.getElementById('apkDownload');
  if (apkBtn) {
    const hint = apkBtn.querySelector('.dl-card__hint');

    if (APK_URL) {
      // ✅ Link configurado — download direto
      apkBtn.href = APK_URL;
      apkBtn.target = '_blank';
      apkBtn.rel = 'noopener';
      apkBtn.removeAttribute('data-disabled');
      if (hint) hint.textContent = 'Versão 2.0.0 · Toque para baixar';
    } else {
      // ⏳ Sem link ainda — modo "Em breve" com modal informativo
      if (hint) hint.textContent = 'Em breve — APK em finalização';

      apkBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openWaitlistModal();
      });
    }
  }

  // ============================================================
  // 💌 Modal "Em breve / Lista de espera"
  // ============================================================
  function openWaitlistModal() {
    if (document.getElementById('auraModal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'auraModal';
    overlay.innerHTML = `
      <div class="aura-modal__backdrop"></div>
      <div class="aura-modal__card" role="dialog" aria-labelledby="auraModalTitle">
        <button class="aura-modal__close" aria-label="Fechar">×</button>
        <div class="aura-modal__icon">
          <span>⏳</span>
        </div>
        <h3 id="auraModalTitle" class="aura-modal__title">
          O APK está chegando!
        </h3>
        <p class="aura-modal__text">
          Nosso aplicativo Android está em fase final de preparação.
          Deixe seu e-mail e te avisamos no instante em que estiver disponível.
        </p>
        <form class="aura-modal__form" id="auraWaitlistForm" novalidate>
          <input type="email" name="email" placeholder="seuemail@exemplo.com" required class="aura-modal__input" />
          <button type="submit" class="aura-modal__btn">Quero ser avisado</button>
        </form>
        <p class="aura-modal__hint">
          📩 Sem spam. Apenas um aviso quando o app entrar no ar.
        </p>
      </div>
    `;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const close = () => {
      overlay.classList.add('aura-modal--closing');
      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = '';
      }, 200);
    };

    overlay.querySelector('.aura-modal__backdrop').addEventListener('click', close);
    overlay.querySelector('.aura-modal__close').addEventListener('click', close);
    document.addEventListener('keydown', function onKey(ev) {
      if (ev.key === 'Escape') {
        close();
        document.removeEventListener('keydown', onKey);
      }
    });

    const form = overlay.querySelector('#auraWaitlistForm');
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const email = form.email.value.trim();
      if (!email || !email.includes('@')) {
        form.email.style.borderColor = '#EF4444';
        form.email.focus();
        return;
      }
      // Salva localmente (você pode trocar isso por POST para um endpoint real depois)
      try {
        const list = JSON.parse(localStorage.getItem('aura_waitlist') || '[]');
        if (!list.includes(email)) list.push(email);
        localStorage.setItem('aura_waitlist', JSON.stringify(list));
      } catch {}

      form.outerHTML = `
        <div class="aura-modal__success">
          <div class="aura-modal__check">✓</div>
          <h4>Pronto, ${email.split('@')[0]}!</h4>
          <p>Te avisamos assim que o APK estiver disponível 💜</p>
        </div>
      `;
      setTimeout(close, 2600);
    });
  }
})();
