/* English Circle: comportamento da página aulas-em-turma.html
 * Lê tudo de window.EC_CONFIG (englishCircle.config.js). Não edite aqui para
 * trocar estado, vagas, datas ou links: edite o arquivo de configuração.
 */
(function () {
    'use strict';

    var C = window.EC_CONFIG || {};
    var doc = document;
    var root = doc.documentElement;
    root.classList.add('js');

    /* ---------- Utilidades ---------- */
    function ok(v) {
        if (typeof v === 'string') return v.trim() !== '' && v.indexOf('[DEFINIR]') === -1;
        return v !== null && v !== undefined && v !== false;
    }
    function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
    function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
    function store(kind) {
        try { return window[kind]; } catch (e) { return null; }
    }
    function sget(kind, k) { try { var s = store(kind); return s ? s.getItem(k) : null; } catch (e) { return null; } }
    function sset(kind, k, v) { try { var s = store(kind); if (s) s.setItem(k, v); } catch (e) { /* armazenamento bloqueado */ } }

    var host = location.hostname;
    var DEV = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(host) ||
        /\.(localhost|test)$/.test(host) || /[?&]ecdebug=1/.test(location.search);

    function brl(n, cents) {
        return 'R$ ' + Number(n).toLocaleString('pt-BR', { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });
    }
    // Datas sempre no horário de Brasília (-03:00)
    function brt(d, endOfDay) { return new Date(d + (endOfDay ? 'T23:59:59' : 'T00:00:00') + '-03:00'); }
    function dmy(d) { var p = d.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
    function dm(d) { var p = d.split('-'); return p[2] + '/' + p[1]; }

    /* ---------- Estado efetivo ---------- */
    var spotsTotal = parseInt(C.spotsTotal, 10) || 8;
    var spotsLeft = parseInt(C.spotsLeft, 10);
    if (isNaN(spotsLeft)) spotsLeft = spotsTotal;
    spotsLeft = Math.max(0, Math.min(spotsTotal, spotsLeft));

    var state = ['prelaunch', 'open', 'closed'].indexOf(C.state) > -1 ? C.state : 'prelaunch';
    var closedReason = 'closed';
    if (spotsLeft <= 0) { state = 'closed'; closedReason = 'full'; }
    else if (state === 'open' && ok(C.enrollmentDeadline) && Date.now() > brt(C.enrollmentDeadline, true).getTime()) {
        state = 'closed'; closedReason = 'deadline';
    }
    root.setAttribute('data-ec-state', state);

    /* ---------- UTM: guarda na sessão e anexa às mensagens do WhatsApp ---------- */
    var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
    var utm = {};
    (function () {
        var params = new URLSearchParams(location.search);
        var saved = {};
        try { saved = JSON.parse(sget('sessionStorage', 'ec_utm') || '{}') || {}; } catch (e) { saved = {}; }
        var fresh = false;
        UTM_KEYS.forEach(function (k) { if (params.get(k)) { fresh = true; } });
        UTM_KEYS.forEach(function (k) { var v = fresh ? params.get(k) : saved[k]; if (v) utm[k] = String(v).slice(0, 60); });
        if (fresh) sset('sessionStorage', 'ec_utm', JSON.stringify(utm));
    })();
    function utmSuffix() {
        var parts = UTM_KEYS.map(function (k) { return utm[k]; }).filter(Boolean);
        return parts.length ? '\n\n(ref: ' + parts.join(' / ') + ')' : '';
    }

    /* ---------- Links ---------- */
    var M = C.messages || {};
    var missing = [];
    function waLink(msgKey) {
        if (!ok(C.whatsappNumber)) return null;
        var num = String(C.whatsappNumber).replace(/\D/g, '');
        var msg = (M[msgKey] || M.hero || 'Oi, Samira!') + utmSuffix();
        return 'https://wa.me/' + num + '?text=' + encodeURIComponent(msg);
    }
    var groupLink = ok(C.whatsappGroupLink) ? C.whatsappGroupLink : waLink('group');
    var waitlistLink = ok(C.waitlistLink) ? C.waitlistLink : (waLink('waitlist') || groupLink);
    function enrollLink(plan) {
        var key = plan === 'upfront' ? 'paymentLinkUpfront' : 'paymentLinkInstallments';
        if (ok(C[key])) return C[key];
        return waLink(plan === 'upfront' ? 'enrollUpfront' : 'enrollInstallments');
    }

    function setLink(el, href, label) {
        if (!href) {
            el.removeAttribute('href');
            el.setAttribute('aria-disabled', 'true');
            el.setAttribute('title', 'Link ainda não configurado');
            if (label) missing.push(label);
            return;
        }
        el.setAttribute('href', href);
        el.removeAttribute('aria-disabled');
        el.removeAttribute('title');
        if (href.charAt(0) === '#') {
            el.removeAttribute('target'); el.removeAttribute('rel');
        } else {
            el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener noreferrer');
        }
    }

    /* ---------- Valores calculados (preço por aula etc.) ---------- */
    var total = parseInt(C.totalClasses, 10) || 80;
    var inst = parseInt(C.installments, 10) || 12;
    var pInst = Number(C.priceInstallment) || 300;
    var pUp = Number(C.priceUpfront) || 3000;
    var values = {
        spotsTotal: String(spotsTotal),
        totalClasses: String(total),
        installments: String(inst),
        priceInstallment: brl(pInst),
        totalInstallments: brl(inst * pInst),
        priceUpfront: brl(pUp),
        savings: brl(inst * pInst - pUp),
        perClassInstallments: brl(inst * pInst / total, true),
        perClassUpfront: brl(pUp / total, true),
        badgeLabel: 'Primeira turma'
    };
    $$('[data-ec]').forEach(function (el) {
        var v = values[el.getAttribute('data-ec')];
        if (v !== undefined) el.textContent = v;
    });

    /* ---------- CTA principal (muda conforme o estado) ---------- */
    var CTA = {
        prelaunch: { long: 'Entrar no grupo e ser avisada(o) primeiro', short: 'Entrar no grupo', href: groupLink },
        open: { long: 'Garantir minha vaga', short: 'Quero minha vaga', href: '#investimento' },
        closed: { long: 'Entrar na lista de espera', short: 'Lista de espera', href: waitlistLink }
    };
    // Variações de verbo por posição (sem mudar a ação)
    var CTA_VARIANT = { open: { final: 'Quero minha vaga', enroll_steps: 'Garantir minha vaga' } };

    $$('[data-cta="primary"]').forEach(function (el) {
        var c = CTA[state];
        var src = el.getAttribute('data-src');
        var label = el.getAttribute('data-size') === 'short' ? c.short :
            ((CTA_VARIANT[state] && CTA_VARIANT[state][src]) || c.long);
        el.textContent = label;
        setLink(el, c.href, 'CTA principal (' + state + ')');
    });

    $$('[data-wa]').forEach(function (el) {
        var key = el.getAttribute('data-wa');
        var href = waLink(key);
        if (el.classList.contains('wa-float')) {
            if (href) { el.hidden = false; setLink(el, href); } else { missing.push('botão flutuante (whatsappNumber)'); }
            return;
        }
        setLink(el, href, 'WhatsApp direto (' + key + ')');
    });

    $$('[data-enroll]').forEach(function (el) {
        var plan = el.getAttribute('data-enroll');
        el.hidden = state !== 'open';
        if (state === 'open') setLink(el, enrollLink(plan), 'pagamento ' + plan);
    });

    /* ---------- Bloco de estado na seção de investimento ---------- */
    var priceState = $('[data-price-state]');
    if (priceState) {
        if (state === 'prelaunch') {
            priceState.innerHTML = '<p><strong>As matrículas abrem em ' + dmy(C.openingDate || '2027-01-12') + '.</strong> ' +
                'Até lá, entre no grupo de interesse para ser avisada(o) primeiro e receber o link assim que abrir.</p>' +
                '<a class="btn btn-cream" data-cta="primary" data-src="price_state">Entrar no grupo</a>';
            setLink($('a', priceState), groupLink, 'grupo de interesse');
        } else if (state === 'closed') {
            priceState.innerHTML = '<p><strong>' + (closedReason === 'full' ? 'Turma completa.' : 'Matrículas encerradas.') + '</strong> ' +
                'Entre na lista de espera para saber primeiro da próxima turma.</p>' +
                '<a class="btn btn-cream" data-cta="primary" data-src="price_state">Entrar na lista de espera</a>';
            setLink($('a', priceState), waitlistLink, 'lista de espera');
        }
    }

    /* ---------- Status: vagas, prazo e contagem regressiva (só datas reais) ---------- */
    function countdownHTML(targetMs) {
        return '<ul class="countdown" data-countdown="' + targetMs + '" aria-label="Contagem regressiva">' +
            '<li><b data-u="d">0</b><span>dias</span></li><li><b data-u="h">0</b><span>horas</span></li><li><b data-u="m">0</b><span>min</span></li></ul>';
    }
    function spotsDots() {
        var s = '<span class="spots" aria-hidden="true">';
        for (var i = 0; i < spotsTotal; i++) s += '<i class="' + (i < spotsLeft ? 'on' : '') + '"></i>';
        return s + '</span>';
    }
    var vagasTxt = spotsLeft === 1 ? 'Resta <strong>1 de ' + spotsTotal + ' vagas</strong>' : 'Restam <strong>' + spotsLeft + ' de ' + spotsTotal + ' vagas</strong>';

    function statusHTML(where) {
        var now = Date.now();
        if (state === 'prelaunch') {
            var open = ok(C.openingDate) ? brt(C.openingDate).getTime() : 0;
            if (where === 'bar') return '<strong>Matrículas em ' + (open ? dm(C.openingDate) : 'breve') + '</strong>' + spotsTotal + ' vagas | começa 02/02';
            if (!open) return '';
            if (now >= open) return '<p class="status__line">As matrículas abrem em breve. Entre no grupo para receber o aviso.</p>';
            return '<p class="status__line">As matrículas abrem em <strong>' + dmy(C.openingDate) + '</strong></p>' + countdownHTML(open);
        }
        if (state === 'open') {
            var hasDl = ok(C.enrollmentDeadline);
            var end = hasDl ? brt(C.enrollmentDeadline, true).getTime() : 0;
            if (where === 'bar') return '<strong>' + vagasTxt.replace(/<\/?strong>/g, '') + '</strong>' + (hasDl ? 'Matrículas até ' + dm(C.enrollmentDeadline) : '');
            return '<p class="status__line">' + vagasTxt + spotsDots() + '</p>' +
                (hasDl ? '<p class="status__line">Matrículas até <strong>' + dmy(C.enrollmentDeadline) + '</strong></p>' + countdownHTML(end) : '');
        }
        var title = closedReason === 'full' ? 'Turma completa' : 'Matrículas encerradas';
        if (where === 'bar') return '<strong>' + title + '</strong>Lista de espera aberta';
        return '<p class="status__line"><span class="pill-closed">' + title + '</span></p>' +
            '<p class="status__line">Entre na lista de espera e seja a primeira pessoa avisada sobre a próxima turma.</p>';
    }
    $$('[data-status]').forEach(function (el) { el.innerHTML = statusHTML(el.getAttribute('data-status')); });

    function tick() {
        $$('[data-countdown]').forEach(function (el) {
            var diff = Math.max(0, parseInt(el.getAttribute('data-countdown'), 10) - Date.now());
            var d = Math.floor(diff / 864e5), h = Math.floor(diff % 864e5 / 36e5), m = Math.floor(diff % 36e5 / 6e4);
            $('[data-u="d"]', el).textContent = d;
            $('[data-u="h"]', el).textContent = h;
            $('[data-u="m"]', el).textContent = m;
        });
    }
    tick();
    setInterval(tick, 30000);

    /* ---------- Itens opcionais vindos da configuração ---------- */
    var pdf = $('[data-calendar-pdf]');
    if (pdf && ok(C.calendarPdfUrl)) { pdf.href = C.calendarPdfUrl; pdf.hidden = false; }
    $$('[data-contract-link]').forEach(function (a) { if (ok(C.contractPdfUrl)) { a.href = C.contractPdfUrl; a.hidden = false; } });

    var cert = $('[data-faq-certificate]');
    if (cert && (C.certificate === true || C.certificate === false)) {
        $('[data-certificate-answer]', cert).textContent = C.certificate ?
            'Sim. Quem conclui o curso recebe o certificado do English Circle.' :
            'Não. O foco do English Circle é você sair falando.';
        cert.hidden = false;
    }

    var offer = C.optionalOffer || {};
    if (offer.enabled && ok(offer.title)) {
        var box = $('[data-optional-offer]');
        $('[data-offer-title]', box).textContent = offer.title;
        $('[data-offer-text]', box).textContent = offer.text || '';
        box.hidden = false;
    }

    var testi = $('#depoimentos');
    if (testi && C.showTestimonials && $$('.testimonial', testi).length) testi.hidden = false;

    var biz = C.business || {};
    var bizEl = $('[data-business]');
    if (bizEl && ok(biz.name) && ok(biz.cnpj)) {
        bizEl.textContent = biz.name + ' | CNPJ ' + biz.cnpj + (ok(biz.city) ? ' | ' + biz.city : '');
        bizEl.hidden = false;
    }
    var mail = $('[data-ec-email]');
    if (mail && ok(C.contactEmail)) { mail.href = 'mailto:' + C.contactEmail; mail.textContent = C.contactEmail; }
    var yr = $('[data-year]');
    if (yr) yr.textContent = new Date().getFullYear();

    /* ---------- Mini calendário (gerado a partir das datas da configuração) ---------- */
    (function buildCalendar() {
        var mount = $('#cal-month');
        if (!mount || !ok(C.classStart) || !ok(C.classEnd)) return;
        var off = {};
        (C.noClassDates || []).forEach(function (n) { off[n.date] = n.reason; });
        var party = C.partyDate;
        function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
        function parse(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }

        var classes = {};
        var start = parse(C.classStart), end = parse(C.classEnd);
        for (var d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            var wd = d.getDay();
            if ((wd === 2 || wd === 4) && !off[iso(d)]) classes[iso(d)] = true;
        }
        if (DEV) {
            var n = Object.keys(classes).length;
            if (n !== total) console.warn('[English Circle] O calendário gerou ' + n + ' aulas, mas totalClasses = ' + total + '. Confira noClassDates.');
        }

        var months = [];
        var last = party ? parse(party) : end;
        for (var m = new Date(start.getFullYear(), start.getMonth(), 1); m <= last; m.setMonth(m.getMonth() + 1)) months.push(new Date(m));
        var today = new Date();
        var idx = 0;
        months.forEach(function (mm, i) { if (mm.getFullYear() === today.getFullYear() && mm.getMonth() === today.getMonth()) idx = i; });

        var DOW = [['D', 'domingo'], ['S', 'segunda'], ['T', 'terça'], ['Q', 'quarta'], ['Q', 'quinta'], ['S', 'sexta'], ['S', 'sábado']];

        function render() {
            var first = months[idx];
            var y = first.getFullYear(), mo = first.getMonth();
            var days = new Date(y, mo + 1, 0).getDate();
            var count = 0, notes = [];
            var cells = DOW.map(function (w) { return '<li class="mcal__dow"><abbr title="' + w[1] + '">' + w[0] + '</abbr></li>'; }).join('');
            for (var b = 0; b < first.getDay(); b++) cells += '<li class="mcal__day is-out" aria-hidden="true"></li>';
            for (var dd = 1; dd <= days; dd++) {
                var key = iso(new Date(y, mo, dd));
                var cls = '', lab = '';
                if (classes[key]) { cls = 'is-class'; lab = ', aula'; count++; }
                else if (off[key]) { cls = 'is-off'; lab = ', sem aula: ' + off[key]; notes.push(dd + ': ' + off[key]); }
                else if (key === party) { cls = 'is-party'; lab = ', confraternização de encerramento'; notes.push(dd + ': confraternização de encerramento'); }
                cells += '<li class="mcal__day ' + cls + '"' + (lab ? ' aria-label="' + dd + lab + '"' : '') + '>' + dd + '</li>';
            }
            var name = first.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            mount.innerHTML =
                '<div class="mcal__head"><p class="mcal__title">' + name +
                '<span class="mcal__count">' + (count ? count + (count === 1 ? ' aula' : ' aulas') : 'sem aulas') + '</span></p>' +
                '<div class="mcal__nav"><button type="button" data-m="-1" aria-label="Mês anterior"' + (idx === 0 ? ' disabled' : '') + '><svg class="ico" aria-hidden="true"><use href="#i-left"/></svg></button>' +
                '<button type="button" data-m="1" aria-label="Próximo mês"' + (idx === months.length - 1 ? ' disabled' : '') + '><svg class="ico" aria-hidden="true"><use href="#i-right"/></svg></button></div></div>' +
                '<ul class="mcal__grid">' + cells + '</ul>' +
                '<p class="mcal__note">' + notes.join(' | ') + '</p>';
        }
        mount.addEventListener('click', function (e) {
            var btn = e.target.closest('button[data-m]');
            if (!btn || btn.disabled) return;
            idx = Math.max(0, Math.min(months.length - 1, idx + parseInt(btn.getAttribute('data-m'), 10)));
            render();
            var again = $('button[data-m="' + btn.getAttribute('data-m') + '"]', mount);
            if (again && !again.disabled) again.focus(); else { var other = $('button[data-m]:not([disabled])', mount); if (other) other.focus(); }
        });
        render();
    })();

    /* ---------- Menu do celular ---------- */
    var menuBtn = $('.topbar__menu'), nav = $('#topbar-nav');
    function closeMenu() { if (nav) { nav.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); } }
    if (menuBtn && nav) {
        menuBtn.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
        doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    }

    /* ---------- CTA fixo no celular: aparece depois do hero ---------- */
    var bar = $('#mobile-cta');
    var heroCta = $('.hero .cta-row');
    var finalSec = $('#final');
    if (bar && 'IntersectionObserver' in window && heroCta) {
        var heroVisible = true, finalVisible = false;
        var upd = function () { bar.classList.toggle('is-visible', !heroVisible && !finalVisible); };
        new IntersectionObserver(function (es) { heroVisible = es[0].isIntersecting; upd(); }).observe(heroCta);
        if (finalSec) new IntersectionObserver(function (es) { finalVisible = es[0].isIntersecting; upd(); }, { threshold: .25 }).observe(finalSec);
    } else if (bar) {
        bar.classList.add('is-visible');
    }

    /* ---------- Animação ao rolar (respeita prefers-reduced-motion via CSS) ---------- */
    var reveals = $$('.reveal');
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) {
            es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
        }, { rootMargin: '0px 0px -8% 0px', threshold: .05 });
        reveals.forEach(function (el) { io.observe(el); });
    } else {
        reveals.forEach(function (el) { el.classList.add('is-in'); });
    }

    /* =====================================================================
     * Analytics (GA4 + Meta Pixel), carregados SOMENTE após consentimento.
     * Para ativar: preencha analytics.ga4Id e analytics.metaPixelId na config.
     * Eventos disparados:
     *   view_item              ao carregar (com o estado atual)
     *   click_whatsapp_group   CTA do grupo de interesse / lista de espera
     *   click_whatsapp_direct  botões "Falar com a Samira" e o flutuante
     *   click_enroll           botões de pagamento (plan: installments | upfront)
     *   click_cta              CTA "Garantir minha vaga" que leva aos planos (estado open)
     *   faq_open               abertura de pergunta (question)
     *   scroll_50 / scroll_90  profundidade de rolagem
     *   download_calendar      PDF do calendário
     * No Meta Pixel, view_item vira ViewContent, click_enroll vira InitiateCheckout
     * e os cliques de WhatsApp viram Contact. Os demais vão como trackCustom.
     * ===================================================================== */
    var A = C.analytics || {};
    var hasGA = ok(A.ga4Id), hasPixel = ok(A.metaPixelId);
    var analyticsOn = false;

    function track(name, params) {
        params = params || {};
        params.ec_state = state;
        UTM_KEYS.forEach(function (k) { if (utm[k]) params[k] = utm[k]; });
        if (DEV) console.info('[English Circle] evento:', name, params);
        if (!analyticsOn) return;
        if (window.gtag) window.gtag('event', name, params);
        if (window.fbq) {
            var std = { view_item: 'ViewContent', click_enroll: 'InitiateCheckout', click_whatsapp_group: 'Contact', click_whatsapp_direct: 'Contact' }[name];
            if (std) window.fbq('track', std, { content_name: 'English Circle', ec_state: state });
            window.fbq('trackCustom', name, params);
        }
    }

    function loadScript(src) { var s = doc.createElement('script'); s.async = true; s.src = src; doc.head.appendChild(s); }
    function enableAnalytics() {
        if (analyticsOn) return;
        analyticsOn = true;
        if (hasGA) {
            loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(A.ga4Id));
            window.dataLayer = window.dataLayer || [];
            window.gtag = function () { window.dataLayer.push(arguments); };
            window.gtag('js', new Date());
            window.gtag('config', A.ga4Id);
        }
        if (hasPixel) {
            /* Snippet oficial do Meta Pixel, sem o <noscript> */
            (function (f, b, e, v, n, t, s) {
                if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
                if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
                t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
            })(window, doc, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
            window.fbq('init', A.metaPixelId);
            window.fbq('track', 'PageView');
        }
        track('view_item', { item_name: 'English Circle', currency: 'BRL', value: pUp });
    }

    /* Banner de cookies: só aparece se houver algum ID de analytics configurado */
    var cookie = $('#cookie');
    var consent = sget('localStorage', 'ec_consent');
    function showBanner() { if (cookie) cookie.hidden = false; }
    if (hasGA || hasPixel) {
        if (consent === 'accept') enableAnalytics();
        else if (consent !== 'deny') showBanner();
    }
    if (!analyticsOn) track('view_item', { item_name: 'English Circle' }); // só registra no console em dev
    if (cookie) {
        cookie.addEventListener('click', function (e) {
            var b = e.target.closest('[data-consent]');
            if (!b) return;
            var v = b.getAttribute('data-consent');
            sset('localStorage', 'ec_consent', v);
            cookie.hidden = true;
            if (v === 'accept') enableAnalytics();
        });
    }
    var cookieSettings = $('[data-cookie-settings]');
    if (cookieSettings) {
        if (!(hasGA || hasPixel)) cookieSettings.parentNode.hidden = true;
        cookieSettings.addEventListener('click', showBanner);
    }

    /* Cliques */
    doc.addEventListener('click', function (e) {
        var el = e.target.closest('a, button');
        if (!el) return;
        var src = el.getAttribute('data-src') || '';
        if (el.hasAttribute('data-wa')) return track('click_whatsapp_direct', { source: src });
        if (el.hasAttribute('data-enroll')) return track('click_enroll', { plan: el.getAttribute('data-enroll'), source: src });
        if (el.getAttribute('data-cta') === 'primary') {
            if (state === 'open') return track('click_cta', { source: src });
            return track('click_whatsapp_group', { source: src, list: state === 'closed' ? 'waitlist' : 'interest' });
        }
        var t = el.getAttribute('data-track');
        if (t) track(t, { source: src });
    });

    /* FAQ */
    $$('.faq details').forEach(function (d) {
        d.addEventListener('toggle', function () {
            if (d.open) track('faq_open', { question: $('summary', d).textContent.trim() });
        });
    });

    /* Rolagem */
    var fired = {};
    window.addEventListener('scroll', function () {
        var h = doc.documentElement.scrollHeight - window.innerHeight;
        if (h <= 0) return;
        var p = window.scrollY / h;
        if (p >= .5 && !fired[50]) { fired[50] = 1; track('scroll_50'); }
        if (p >= .9 && !fired[90]) { fired[90] = 1; track('scroll_90'); }
    }, { passive: true });

    /* ---------- Aviso só no modo de desenvolvimento ---------- */
    if (DEV) {
        var pend = [];
        ['whatsappNumber', 'paymentLinkInstallments', 'paymentLinkUpfront', 'enrollmentDeadline', 'calendarPdfUrl', 'contractPdfUrl', 'waitlistLink']
            .forEach(function (k) { if (!ok(C[k])) pend.push(k); });
        if (!hasGA) pend.push('analytics.ga4Id');
        if (!hasPixel) pend.push('analytics.metaPixelId');
        var note = $('#dev-notice');
        if (note && (pend.length || missing.length)) {
            note.innerHTML = '<strong>Modo dev</strong> | estado: ' + state + ' | vagas: ' + spotsLeft + '/' + spotsTotal +
                '<br>[DEFINIR]: ' + pend.join(', ') +
                (missing.length ? '<br>Botões desativados: ' + missing.join(', ') : '') +
                '<br><small>(clique para fechar)</small>';
            note.hidden = false;
            note.addEventListener('click', function () { note.hidden = true; });
        }
    }
})();
