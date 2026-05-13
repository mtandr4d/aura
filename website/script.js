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

  // APK download — Configurable via window.AURA_APK_URL or a link in localStorage
  // Substitua a constante abaixo pelo link gerado pelo EAS Build quando o APK estiver pronto.
  const APK_URL = window.AURA_APK_URL || ''; // ex: 'https://expo.dev/artifacts/eas/xxx.apk'
  const apkBtn = document.getElementById('apkDownload');
  if (apkBtn) {
    if (APK_URL) {
      apkBtn.href = APK_URL;
      apkBtn.target = '_blank';
      apkBtn.rel = 'noopener';
      apkBtn.removeAttribute('data-disabled');
      const hint = apkBtn.querySelector('.dl-card__hint');
      if (hint) hint.textContent = 'Versão 2.0.0 · Toque para baixar';
    } else {
      apkBtn.addEventListener('click', (e) => {
        e.preventDefault();
        alert(
          '📦 APK em geração!\n\n' +
            'O link de download estará disponível em breve. Para gerar agora:\n' +
            '1. Crie conta grátis em expo.dev\n' +
            '2. Rode: eas build --platform android --profile preview\n' +
            '3. Cole o link no website/script.js (constante APK_URL)'
        );
      });
    }
  }
})();
