// ── Navbar scroll ──
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 40);
});

// ── Mobile hamburger ──
const hamburger = document.querySelector('.nav-hamburger');
const mobileMenu = document.querySelector('.nav-mobile');
if (hamburger) {
  hamburger.setAttribute('aria-label', 'Menüyü aç');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-controls', 'navMobile');
}
hamburger?.addEventListener('click', () => {
  const isOpen = hamburger.classList.contains('active');
  mobileMenu?.classList.toggle('open');
  hamburger.classList.toggle('active');
  hamburger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
  hamburger.setAttribute('aria-label', isOpen ? 'Menüyü aç' : 'Menüyü kapat');
  const spans = hamburger.querySelectorAll('span');
  if (!isOpen) {
    spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
});
mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  if (hamburger) {
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Menüyü aç');
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
}));

// ── Scroll animations ──
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in, .slide-left, .slide-right, .slide-up').forEach(el => obs.observe(el));

// ── Counter animation ──
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const start = performance.now();
  const duration = 1600;
  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(ease * target) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const cObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); cObs.unobserve(e.target); } });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(el => cObs.observe(el));

// ── Active nav ──
(function() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu a, .nav-mobile a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
})();

// ── FAQ accordion ──
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.setAttribute('aria-expanded', 'false');
  btn.addEventListener('click', () => {
    const answer = btn.nextElementSibling || btn.closest('.faq-item')?.querySelector('.faq-a');
    const isOpen = btn.classList.contains('open');
    document.querySelectorAll('.faq-q').forEach(b => {
      b.classList.remove('open');
      b.setAttribute('aria-expanded', 'false');
      const a = b.nextElementSibling || b.closest('.faq-item')?.querySelector('.faq-a');
      a?.classList.remove('open');
    });
    if (!isOpen) {
      btn.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      answer?.classList.add('open');
    }
  });
});

// ── Lightbox ──
let _lbPrevFocus = null;
let _lbImages = [];
let _lbIndex = 0;

function openLb(src, caption, images, index) {
  const lb = document.getElementById('lb');
  if (!lb) return;
  _lbPrevFocus = document.activeElement;
  if (images) { _lbImages = images; _lbIndex = index || 0; }
  lb.querySelector('img').src = src;
  lb.querySelector('img').alt = caption || '';
  const cap = lb.querySelector('.lb-caption');
  if (cap) cap.textContent = caption || '';
  const counter = lb.querySelector('.lb-counter');
  if (counter && _lbImages.length) counter.textContent = (_lbIndex + 1) + ' / ' + _lbImages.length;
  lb.classList.add('open');
  lb.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  lb.querySelector('.lb-x')?.focus();
}

function closeLb() {
  const lb = document.getElementById('lb');
  if (!lb) return;
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (_lbPrevFocus) { _lbPrevFocus.focus(); _lbPrevFocus = null; }
}

function lbNav(dir) {
  if (!_lbImages.length) return;
  _lbIndex = (_lbIndex + dir + _lbImages.length) % _lbImages.length;
  const item = _lbImages[_lbIndex];
  openLb(item.src, item.caption, _lbImages, _lbIndex);
}

document.getElementById('lb')?.addEventListener('keydown', function(e) {
  if (e.key === 'Tab') {
    const focusable = this.querySelectorAll('button, [tabindex="0"]');
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
      e.preventDefault();
      (e.shiftKey ? last : first)?.focus();
    }
  }
  if (e.key === 'ArrowLeft') lbNav(-1);
  if (e.key === 'ArrowRight') lbNav(1);
});
document.getElementById('lb')?.addEventListener('click', function(e) {
  if (e.target === this) closeLb();
});
document.querySelector('.lb-x')?.addEventListener('click', closeLb);
document.querySelector('.lb-prev')?.addEventListener('click', () => lbNav(-1));
document.querySelector('.lb-next')?.addEventListener('click', () => lbNav(1));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });

// ── Gallery page setup ──
(function setupGallery() {
  const items = document.querySelectorAll('.gallery-pg-item');
  if (!items.length) return;
  const images = Array.from(items).map(el => ({
    src: el.querySelector('img')?.src,
    caption: el.dataset.caption || ''
  }));
  items.forEach((el, i) => {
    el.addEventListener('click', () => openLb(images[i].src, images[i].caption, images, i));
  });
  // Homepage gallery teaser
  document.querySelectorAll('.gallery-item').forEach((el, i) => {
    el.addEventListener('click', () => {
      const img = el.querySelector('img');
      openLb(img.src, img.alt, [], 0);
    });
  });
})();

// ── Gallery filter ──
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.gallery-pg-item').forEach(item => {
      item.style.display = (filter === 'all' || item.dataset.cat === filter) ? '' : 'none';
    });
  });
});

// ── Contact form ──
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('[type=submit]');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;
    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        contactForm.style.display = 'none';
        document.querySelector('.form-success').style.display = 'block';
      } else {
        document.querySelector('.form-error').style.display = 'block';
        btn.innerHTML = orig;
        btn.disabled = false;
      }
    } catch {
      document.querySelector('.form-error').style.display = 'block';
      btn.innerHTML = orig;
      btn.disabled = false;
    }
  });
}

// ── i18n: TR/EN/DE ──
const i18n = {
  tr: {
    'nav.home':'Ana Sayfa','nav.about':'Hakkımızda','nav.services':'Ürünler','nav.gallery':'Galeri','nav.contact':'İletişim','nav.cta':'İletişime Geçin',
    'hero.badge':'Ferhatpaşa, Ataşehir / İstanbul',
    'hero.h1':'Üreticiden <span class="hl">Tüketiciye</span><br><span class="hl2">Ambalaj Çözümleri</span>',
    'hero.sub':'Streç film, koli bandı, balonlu naylon ve daha fazlası. Her ölçü, her gramaj. Toptan ve perakende teslimat.',
    'hero.btn1':'Ürünlerimiz','hero.btn2':'Bize Ulaşın','hero.scroll':'Keşfet',
    'stat.products':'Ürün Çeşidi','stat.delivery':'Hızlı Teslimat','stat.clients':'Müşteri','stat.years':'Yıl Deneyim',
    'about.tag':'Hakkımızda','about.h2':'Ambalajda <em>Güven</em>,<br>Kalitede Fark',
    'about.desc':'SFS Ambalaj olarak Ferhatpaşa, Ataşehir\'den İstanbul\'un tüm ilçelerine ve Türkiye geneline ambalaj malzemeleri tedarik ediyoruz. "Üreticiden tüketiciye" anlayışıyla stok maliyetleri olmadan rekabetçi fiyatlar sunuyoruz.',
    'about.fact1':'Fabrikadan direkt tedarik — aracısız fiyat','about.fact2':'Hızlı stok ve sevkiyat kapasitesi',
    'about.fact3':'Her ölçü ve gramajda streç film çeşitleri','about.fact4':'Toptan ve perakende teslimat imkânı',
    'about.btn':'Daha Fazla Bilgi',
    'svc.label':'Ürünlerimiz','svc.h2':'Geniş Ambalaj <span>Yelpazesi</span>',
    'svc1.title':'El Streç Filmi','svc1.desc':'10 cm\'den 50 cm\'ye kadar farklı genişliklerde el streç filmleri. Standart ve güçlendirilmiş.',
    'svc2.title':'Renkli Streç','svc2.desc':'Kargo ve depolama operasyonlarında ürün ayrımı için çeşitli renklerde streç film.',
    'svc3.title':'Palet Streç','svc3.desc':'30/300 ve 45/300 gibi endüstriyel ebatlarda makine streç filmi ve palet sarma çözümleri.',
    'svc4.title':'Dilimli Streç','svc4.desc':'Küçük paketleme ve bireysel ürün sarımı için pratik dilimli streç rulolar.',
    'svc5.title':'Koli Bandı','svc5.desc':'Her kalınlık ve boyda şeffaf ve renkli koli bandı. Güçlü yapışma, kolay soyulma.',
    'svc6.title':'Balonlu Naylon','svc6.desc':'Kırılgan ürünlerin korunması için hava kabarcıklı naylon ambalaj malzemeleri.',
    'svc.btn':'Tüm Ürünleri Gör',
    'gal.label':'Ürünlerimizden','gal.h2':'Galeri <span>Kesimleri</span>','gal.btn':'Tüm Galeriyi Gör',
    'gal.item1':'Streç Film','gal.item2':'Renkli Streç','gal.item3':'Koli Bandı','gal.item4':'Palet Streç','gal.item5':'Balonlu Naylon',
    'sec.label':'Hizmet Alanlarımız','sec.h2':'Kimler Kullanıyor? <span>Sektörler</span>',
    'sec.desc':'Geniş ambalaj ürün yelpazemizle e-ticaret firmalarından depolara, kargolardan imalatçılara hizmet veriyoruz.',
    'sec1.title':'E-Ticaret & Kargo','sec1.desc':'Hızlı sevkiyat için güvenilir paketleme çözümleri. Koli bandı ve streç film kombinasyonları.',
    'sec2.title':'Depo & Lojistik','sec2.desc':'Palet sarma ve ürün koruma için endüstriyel streç ve ambalaj sistemleri.',
    'sec3.title':'Gıda Sektörü','sec3.desc':'Gıda uyumlu ambalaj malzemeleri ile hijyenik ve güvenli ürün koruması.',
    'sec4.title':'İmalat & Üretim','sec4.desc':'Seri üretim paketleme hatları için toptan ambalaj malzemeleri tedariki.',
    'sec5.title':'Perakende','sec5.desc':'Mağaza raflarında ürün sunumu ve müşteri paketlemesi için çeşitli ambalaj çözümleri.',
    'sec6.title':'Taşımacılık','sec6.desc':'Kırılgan ürün taşımacılığında balonlu naylon ve köpük ambalaj ile hasar koruması.',
    'faq.label':'SSS','faq.h2':'Sıkça Sorulan <span>Sorular</span>','faq.desc':'Ambalaj ürünleri ve siparişle ilgili en çok merak edilenler.',
    'faq1.q':'Minimum sipariş adedi var mı?','faq1.a':'Hayır, minimum sipariş zorunluluğumuz yoktur. Tek rulo siparişten konteyner yüküne kadar her miktarda ürün temin edebilirsiniz. Toplu alımlarda özel indirimler uygulanmaktadır; detaylar için bize ulaşın.',
    'faq2.q':'Teslimat süresi ne kadar?','faq2.a':'İstanbul içi siparişler genellikle aynı gün veya ertesi iş günü teslim edilmektedir. Türkiye genelinde 1–3 iş günü içinde kargo ile teslimat sağlıyoruz. Büyük hacimli siparişler için özel araçlı teslimat düzenleyebiliriz.',
    'faq3.q':'Hangi genişliklerde streç film temin edebilirsiniz?','faq3.a':'10 cm, 12.5 cm, 17 cm, 25 cm, 30 cm, 45 cm ve 50 cm genişliklerinde el streç filmi bulundurmaktayız. Makine tipi streç için 30/300 ve 45/300 ebatları mevcuttur. Özel ebat taleplerinizi iletişime geçerek belirtebilirsiniz.',
    'faq4.q':'Toptan alım için fiyat teklifi alabilir miyim?','faq4.a':'Evet. WhatsApp veya telefon üzerinden ürün detaylarını (ürün tipi, genişlik, gramaj, adet) ilettiğinizde en kısa sürede fiyat teklifi hazırlıyoruz. Kurumsal hesaplar için özel fiyatlandırma imkânı bulunmaktadır.',
    'faq5.q':'Fatura kesiyor musunuz?','faq5.a':'Evet, tüm satışlarımız için e-fatura veya kağıt fatura düzenleyebiliyoruz. Kurumsal alımlar için firmanızın vergi bilgilerini iletmeniz yeterlidir. Bireysel alımlarda talep üzerine e-arşiv fatura kesilmektedir.',
    'faq6.q':'Ürünleriniz gıda ile temas eden malzemelere uygun mu?','faq6.a':'Gıda ile temas edecek ambalaj malzemeleri için özel ürünlerimiz mevcuttur. Lütfen sipariş sırasında gıda uyumlu malzeme ihtiyacınızı belirtiniz; size uygun ürünleri önereceğiz.',
    'cta.tag':'Hemen Sipariş Verin','cta.h2':'Ambalaj Çözümü mi Arıyorsunuz?',
    'cta.sub':'Ürün çeşidi ve fiyat teklifi için bizi arayın. İstanbul içi aynı gün teslimat.',
    'cta.btn1':'Teklif Al',
    'footer.desc':'Ferhatpaşa, Ataşehir\'den İstanbul geneline ambalaj malzemeleri. Streç film, koli bandı, balonlu naylon.',
    'footer.links':'Hızlı Bağlantılar','footer.products':'Ürünlerimiz','footer.contact':'İletişim',
    'pg.about.h1':'Hakkımızda','pg.about.sub':'Ferhatpaşa, Ataşehir\'de faaliyet gösteren SFS Ambalaj, "üreticiden tüketiciye" anlayışıyla kaliteli ambalaj malzemeleri tedarik etmektedir.',
    'pg.svc.h1':'Ürünlerimiz','pg.svc.sub':'Streç filmden koli bandına, balonlu naylondan palet sarmaya geniş ambalaj ürün yelpazemiz.',
    'pg.gal.h1':'Galeri','pg.gal.sub':'Ürünlerimizden fotoğraflar — Instagram @sfs.ambalaj',
    'pg.con.h1':'İletişim','pg.con.sub':'Fiyat teklifi ve sipariş için bize ulaşın. Hızlı geri dönüş garantisi.',
  },
  en: {
    'nav.home':'Home','nav.about':'About','nav.services':'Products','nav.gallery':'Gallery','nav.contact':'Contact','nav.cta':'Contact Us',
    'hero.badge':'Ferhatpaşa, Ataşehir / Istanbul',
    'hero.h1':'From Producer <span class="hl">to Consumer</span><br><span class="hl2">Packaging Solutions</span>',
    'hero.sub':'Stretch film, packing tape, bubble wrap and more. Every size, every weight. Wholesale and retail delivery.',
    'hero.btn1':'Our Products','hero.btn2':'Contact Us','hero.scroll':'Scroll',
    'stat.products':'Product Types','stat.delivery':'Fast Delivery','stat.clients':'Clients','stat.years':'Years Experience',
    'about.tag':'About Us','about.h2':'<em>Trust</em> in Packaging,<br>Quality that Stands Out',
    'about.desc':'At SFS Ambalaj, we supply packaging materials from Ferhatpaşa, Ataşehir to all districts of Istanbul and across Turkey. With our "producer to consumer" approach, we offer competitive prices without stock costs.',
    'about.fact1':'Direct factory supply — no middleman pricing','about.fact2':'Fast stock and dispatch capacity',
    'about.fact3':'Stretch film in every size and weight','about.fact4':'Wholesale and retail delivery options',
    'about.btn':'Learn More',
    'svc.label':'Our Products','svc.h2':'Wide Packaging <span>Range</span>',
    'svc1.title':'Hand Stretch Film','svc1.desc':'Hand stretch films from 10 cm to 50 cm widths. Standard and reinforced options.',
    'svc2.title':'Colored Stretch','svc2.desc':'Stretch film in various colors for product differentiation in cargo and warehouse operations.',
    'svc3.title':'Pallet Stretch','svc3.desc':'Machine stretch film and pallet wrapping solutions in industrial sizes like 30/300 and 45/300.',
    'svc4.title':'Mini Stretch Rolls','svc4.desc':'Practical mini stretch rolls for small packaging and individual product wrapping.',
    'svc5.title':'Packing Tape','svc5.desc':'Clear and colored packing tape in every thickness and size. Strong adhesion, easy tear.',
    'svc6.title':'Bubble Wrap','svc6.desc':'Air bubble packaging materials for protecting fragile items during shipping and storage.',
    'svc.btn':'View All Products',
    'gal.label':'Our Products','gal.h2':'Gallery <span>Highlights</span>','gal.btn':'View Full Gallery',
    'gal.item1':'Stretch Film','gal.item2':'Colored Stretch','gal.item3':'Packing Tape','gal.item4':'Pallet Stretch','gal.item5':'Bubble Wrap',
    'sec.label':'We Serve','sec.h2':'Who Uses Our Products? <span>Sectors</span>',
    'sec.desc':'From e-commerce companies to warehouses, from cargo operators to manufacturers — our wide range serves every sector.',
    'sec1.title':'E-Commerce & Cargo','sec1.desc':'Reliable packaging solutions for fast shipping. Tape and stretch film combinations.',
    'sec2.title':'Warehouse & Logistics','sec2.desc':'Industrial stretch and packaging systems for pallet wrapping and product protection.',
    'sec3.title':'Food Industry','sec3.desc':'Hygienic and safe product protection with food-grade packaging materials.',
    'sec4.title':'Manufacturing','sec4.desc':'Wholesale packaging material supply for serial production packing lines.',
    'sec5.title':'Retail','sec5.desc':'Various packaging solutions for product presentation and customer packaging in stores.',
    'sec6.title':'Transportation','sec6.desc':'Damage protection with bubble wrap and foam packaging for fragile cargo shipping.',
    'faq.label':'FAQ','faq.h2':'Frequently Asked <span>Questions</span>','faq.desc':'Most common questions about packaging products and orders.',
    'faq1.q':'Is there a minimum order quantity?','faq1.a':'No, there is no minimum order requirement. You can order any quantity from a single roll to a container load. Special discounts apply for bulk orders; contact us for details.',
    'faq2.q':'What is the delivery time?','faq2.a':'Orders within Istanbul are generally delivered same day or next business day. We ship across Turkey within 1–3 business days. Special vehicle delivery can be arranged for large volume orders.',
    'faq3.q':'What widths of stretch film do you offer?','faq3.a':'We carry hand stretch films in 10 cm, 12.5 cm, 17 cm, 25 cm, 30 cm, 45 cm and 50 cm widths. Machine type stretch is available in 30/300 and 45/300 sizes. Contact us for custom size requests.',
    'faq4.q':'Can I get a bulk price quote?','faq4.a':'Yes. Send us the product details (type, width, weight, quantity) via WhatsApp or phone and we will prepare a quote promptly. Special pricing is available for corporate accounts.',
    'faq5.q':'Do you issue invoices?','faq5.a':'Yes, we can issue e-invoice or paper invoice for all sales. For corporate purchases, simply provide your company tax information. E-archive invoice is issued upon request for individual purchases.',
    'faq6.q':'Are your products suitable for food contact?','faq6.a':'We have special products for packaging materials that will come into contact with food. Please specify your food-grade material need when ordering and we will recommend the right products.',
    'cta.tag':'Order Now','cta.h2':'Looking for Packaging Solutions?',
    'cta.sub':'Call us for product range and price quote. Same-day delivery within Istanbul.',
    'cta.btn1':'Get a Quote',
    'footer.desc':'Packaging materials from Ferhatpaşa, Ataşehir across Istanbul. Stretch film, packing tape, bubble wrap.',
    'footer.links':'Quick Links','footer.products':'Products','footer.contact':'Contact',
    'pg.about.h1':'About Us','pg.about.sub':'SFS Ambalaj, operating in Ferhatpaşa, Ataşehir, supplies quality packaging materials with a "producer to consumer" approach.',
    'pg.svc.h1':'Products','pg.svc.sub':'Our wide packaging product range from stretch film to packing tape, from bubble wrap to pallet wrapping.',
    'pg.gal.h1':'Gallery','pg.gal.sub':'Photos from our products — Instagram @sfs.ambalaj',
    'pg.con.h1':'Contact','pg.con.sub':'Contact us for price quotes and orders. Fast response guaranteed.',
  },
  de: {
    'nav.home':'Startseite','nav.about':'Über uns','nav.services':'Produkte','nav.gallery':'Galerie','nav.contact':'Kontakt','nav.cta':'Kontakt aufnehmen',
    'hero.badge':'Ferhatpaşa, Ataşehir / Istanbul',
    'hero.h1':'Vom Hersteller <span class="hl">zum Verbraucher</span><br><span class="hl2">Verpackungslösungen</span>',
    'hero.sub':'Stretchfolie, Klebeband, Luftpolsterfolie und mehr. Jede Größe, jedes Gewicht. Groß- und Einzelhandelslieferung.',
    'hero.btn1':'Unsere Produkte','hero.btn2':'Kontakt','hero.scroll':'Entdecken',
    'stat.products':'Produktarten','stat.delivery':'Schnelle Lieferung','stat.clients':'Kunden','stat.years':'Jahre Erfahrung',
    'about.tag':'Über uns','about.h2':'<em>Vertrauen</em> in der Verpackung,<br>Qualität die überzeugt',
    'about.desc':'Bei SFS Ambalaj liefern wir Verpackungsmaterialien aus Ferhatpaşa, Ataşehir in alle Stadtteile Istanbuls und ganz in die Türkei. Mit unserem "Hersteller-zu-Verbraucher"-Ansatz bieten wir wettbewerbsfähige Preise ohne Lagerkosten.',
    'about.fact1':'Direktversorgung ab Werk — ohne Zwischenhändler','about.fact2':'Schnelle Lager- und Versandkapazität',
    'about.fact3':'Stretchfolie in jeder Größe und jedem Gewicht','about.fact4':'Groß- und Einzelhandelslieferoptionen',
    'about.btn':'Mehr erfahren',
    'svc.label':'Unsere Produkte','svc.h2':'Breites Verpackungs-<span>Sortiment</span>',
    'svc1.title':'Hand-Stretchfolie','svc1.desc':'Hand-Stretchfolien in Breiten von 10 cm bis 50 cm. Standard- und verstärkte Ausführungen.',
    'svc2.title':'Farbige Stretchfolie','svc2.desc':'Stretchfolie in verschiedenen Farben zur Produktunterscheidung bei Versand und Lagerung.',
    'svc3.title':'Palettenstretchfolie','svc3.desc':'Maschinen-Stretchfolie und Palettenwrapping-Lösungen in Industrieformaten wie 30/300 und 45/300.',
    'svc4.title':'Mini-Stretchrollen','svc4.desc':'Praktische Mini-Stretchrollen für kleine Verpackungen und individuelle Produktwickelung.',
    'svc5.title':'Klebeband','svc5.desc':'Transparente und farbige Klebebänder in jeder Stärke und Größe. Starke Haftung, leichtes Abreißen.',
    'svc6.title':'Luftpolsterfolie','svc6.desc':'Luftpolster-Verpackungsmaterialien zum Schutz zerbrechlicher Artikel beim Versand und Lagern.',
    'svc.btn':'Alle Produkte ansehen',
    'gal.label':'Unsere Produkte','gal.h2':'Galerie <span>Highlights</span>','gal.btn':'Vollständige Galerie',
    'gal.item1':'Stretchfolie','gal.item2':'Farbige Stretchfolie','gal.item3':'Klebeband','gal.item4':'Palettenfolie','gal.item5':'Luftpolsterfolie',
    'sec.label':'Wir bedienen','sec.h2':'Wer nutzt unsere Produkte? <span>Branchen</span>',
    'sec.desc':'Von E-Commerce-Unternehmen bis zu Lagerhäusern, von Kurierdiensten bis zu Herstellern — unser breites Sortiment bedient jeden Sektor.',
    'sec1.title':'E-Commerce & Versand','sec1.desc':'Zuverlässige Verpackungslösungen für schnellen Versand. Band- und Stretchfolienkombinationen.',
    'sec2.title':'Lager & Logistik','sec2.desc':'Industriestretch und Verpackungssysteme für Palettenwrapping und Produktschutz.',
    'sec3.title':'Lebensmittelindustrie','sec3.desc':'Hygienischer und sicherer Produktschutz mit lebensmittelechten Verpackungsmaterialien.',
    'sec4.title':'Produktion','sec4.desc':'Großhandelsversorgung mit Verpackungsmaterialien für Serienfertigungslinien.',
    'sec5.title':'Einzelhandel','sec5.desc':'Verschiedene Verpackungslösungen für Produktpräsentation und Kundenverpackung im Geschäft.',
    'sec6.title':'Transport','sec6.desc':'Schadensschutz mit Luftpolsterfolie und Schaumstoffverpackung für den Transport zerbrechlicher Waren.',
    'faq.label':'FAQ','faq.h2':'Häufig gestellte <span>Fragen</span>','faq.desc':'Häufigste Fragen zu Verpackungsprodukten und Bestellungen.',
    'faq1.q':'Gibt es eine Mindestbestellmenge?','faq1.a':'Nein, es gibt keine Mindestbestellanforderung. Sie können jede Menge von einer einzelnen Rolle bis zu einer Containerladung bestellen. Für Großbestellungen gelten Sonderrabatte; kontaktieren Sie uns für Details.',
    'faq2.q':'Wie lang ist die Lieferzeit?','faq2.a':'Bestellungen innerhalb Istanbuls werden in der Regel am selben Tag oder am nächsten Werktag geliefert. Wir versenden innerhalb der Türkei innerhalb von 1–3 Werktagen. Für große Bestellmengen kann eine Sonderlieferung per Fahrzeug arrangiert werden.',
    'faq3.q':'Welche Breiten bieten Sie für Stretchfolie an?','faq3.a':'Wir führen Hand-Stretchfolien in den Breiten 10 cm, 12,5 cm, 17 cm, 25 cm, 30 cm, 45 cm und 50 cm. Maschinenstretch ist in den Größen 30/300 und 45/300 verfügbar.',
    'faq4.q':'Kann ich ein Großhandelsangebot einholen?','faq4.a':'Ja. Senden Sie uns die Produktdetails per WhatsApp oder Telefon und wir erstellen umgehend ein Angebot. Für Firmenkunden stehen Sonderpreise zur Verfügung.',
    'faq5.q':'Stellen Sie Rechnungen aus?','faq5.a':'Ja, wir können für alle Verkäufe E-Rechnungen oder Papierrechnungen ausstellen. Für Firmenkäufe geben Sie einfach Ihre Steuerinformationen an.',
    'faq6.q':'Sind Ihre Produkte für Lebensmittelkontakt geeignet?','faq6.a':'Wir haben spezielle Produkte für Verpackungsmaterialien, die mit Lebensmitteln in Kontakt kommen. Bitte geben Sie Ihren Bedarf an lebensmittelechtem Material bei der Bestellung an.',
    'cta.tag':'Jetzt bestellen','cta.h2':'Suchen Sie Verpackungslösungen?',
    'cta.sub':'Rufen Sie uns für Produktpalette und Preisangebot an. Lieferung am selben Tag in Istanbul.',
    'cta.btn1':'Angebot einholen',
    'footer.desc':'Verpackungsmaterialien aus Ferhatpaşa, Ataşehir für ganz Istanbul. Stretchfolie, Klebeband, Luftpolsterfolie.',
    'footer.links':'Schnelllinks','footer.products':'Produkte','footer.contact':'Kontakt',
    'pg.about.h1':'Über uns','pg.about.sub':'SFS Ambalaj, mit Sitz in Ferhatpaşa, Ataşehir, liefert Qualitätsverpackungsmaterialien nach dem Prinzip "Vom Hersteller zum Verbraucher".',
    'pg.svc.h1':'Produkte','pg.svc.sub':'Unser breites Verpackungssortiment von Stretchfolie bis Klebeband, von Luftpolsterfolie bis Palettenwickelung.',
    'pg.gal.h1':'Galerie','pg.gal.sub':'Fotos unserer Produkte — Instagram @sfs.ambalaj',
    'pg.con.h1':'Kontakt','pg.con.sub':'Kontaktieren Sie uns für Preisangebote und Bestellungen. Schnelle Antwort garantiert.',
  }
};

function setLang(lang) {
  localStorage.setItem('sfs_lang', lang);
  applyLang(lang);
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  document.documentElement.lang = lang;
}

function applyLang(lang) {
  const t = i18n[lang] || i18n.tr;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = t[el.dataset.i18n];
    if (v !== undefined) el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const v = t[el.dataset.i18nHtml];
    if (v !== undefined) el.innerHTML = v;
  });
}

(function initLang() {
  const lang = localStorage.getItem('sfs_lang') || 'tr';
  applyLang(lang);
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  document.documentElement.lang = lang;
})();
