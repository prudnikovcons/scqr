// Универсальный flipbook-движок для /book/<slug>/.
// Параметры берутся из window.BOOK = { totalPages, pageW, pageH, pagesPath, hardCovers }
// hardCovers — массив 0-индексированных номеров страниц, которые показывать
// одиночно (обложки). По умолчанию [0, totalPages-1].

(function () {
	'use strict';

	const cfg = window.BOOK || {};
	const TOTAL = cfg.totalPages || 20;
	const PAGE_W = cfg.pageW || 738;
	const PAGE_H = cfg.pageH || 1106;
	const PAGES_PATH = cfg.pagesPath || './pages';
	const HARD = new Set(cfg.hardCovers || [0, TOTAL - 1]);
	const PAGE_START = typeof cfg.pageStart === 'number' ? cfg.pageStart : 0;

	const stage = document.getElementById('stage');
	const loader = document.getElementById('loader');
	const bookWrap = document.getElementById('bookWrap');
	const bookEl = document.getElementById('book');
	const bottombar = document.getElementById('bottombar');
	const prevBtn = document.getElementById('prevBtn');
	const nextBtn = document.getElementById('nextBtn');
	const firstBtn = document.getElementById('firstBtn');
	const lastBtn = document.getElementById('lastBtn');
	const fullscreenBtn = document.getElementById('fullscreenBtn');
	const progressRange = document.getElementById('progressRange');
	const pageLabel = document.getElementById('pageLabel');

	// HTML страниц.
	const pad = (n) => String(n).padStart(2, '0');
	const pages = [];
	for (let i = 0; i < TOTAL; i++) {
		const density = HARD.has(i) ? 'hard' : 'soft';
		const num = pad(i + PAGE_START);
		pages.push(
			`<div class="page" data-density="${density}"><img src="${PAGES_PATH}/${num}.png" alt="Страница ${i + 1}" loading="${i < 4 ? 'eager' : 'lazy'}" /></div>`,
		);
	}
	bookEl.innerHTML = pages.join('');

	// Преподгружаем первые 4 — показываем книгу с готовой обложкой и первым разворотом.
	function preload(n) {
		const promises = [];
		for (let i = 0; i < n; i++) {
			promises.push(
				new Promise((resolve) => {
					const img = new Image();
					img.onload = img.onerror = () => resolve();
					img.src = `${PAGES_PATH}/${pad(i + PAGE_START)}.png`;
				}),
			);
		}
		return Promise.all(promises);
	}

	function computeBookSize() {
		const stageRect = stage.getBoundingClientRect();
		const isPortraitView = stageRect.width < stageRect.height * 1.3;
		const padding = window.innerWidth < 720 ? 8 : 56;
		const availW = stageRect.width - padding * 2;
		const availH = stageRect.height - 24;

		const aspect = isPortraitView ? PAGE_W / PAGE_H : (PAGE_W * 2) / PAGE_H;

		let w = availW;
		let h = w / aspect;
		if (h > availH) {
			h = availH;
			w = h * aspect;
		}

		const finalW = isPortraitView ? w : w / 2;
		const finalH = h;
		return { width: Math.floor(finalW), height: Math.floor(finalH) };
	}

	let pageFlip = null;
	let currentSpread = 0;
	let totalSpreads = 0;

	function init() {
		const size = computeBookSize();

		pageFlip = new St.PageFlip(bookEl, {
			width: size.width,
			height: size.height,
			size: 'stretch',
			minWidth: 280,
			maxWidth: 900,
			minHeight: 400,
			maxHeight: 1400,
			drawShadow: true,
			flippingTime: 700,
			usePortrait: true,
			startZIndex: 0,
			autoSize: true,
			maxShadowOpacity: 0.5,
			showCover: true,
			mobileScrollSupport: true,
			swipeDistance: 30,
			showPageCorners: true,
			disableFlipByClick: false,
		});

		pageFlip.loadFromHTML(document.querySelectorAll('#book .page'));

		totalSpreads = pageFlip.getPageCount();
		progressRange.max = String(Math.max(0, totalSpreads - 1));
		updateLabel(0);

		pageFlip.on('flip', (e) => {
			currentSpread = e.data;
			progressRange.value = String(currentSpread);
			updateLabel(currentSpread);
			updateNavState();
		});

		pageFlip.on('changeOrientation', () => {
			totalSpreads = pageFlip.getPageCount();
			progressRange.max = String(Math.max(0, totalSpreads - 1));
			updateLabel(currentSpread);
		});

		updateNavState();
	}

	function updateLabel(spread) {
		const orient = pageFlip ? pageFlip.getOrientation() : 'landscape';
		if (orient === 'portrait') {
			pageLabel.textContent = `${spread + 1} / ${totalSpreads}`;
		} else {
			const spreadIdx = Math.floor(spread / 2) + 1;
			const totalSpreadsLandscape = Math.ceil(totalSpreads / 2);
			pageLabel.textContent = `Разворот ${spreadIdx} / ${totalSpreadsLandscape}`;
		}
	}

	function updateNavState() {
		const total = totalSpreads;
		prevBtn.disabled = currentSpread <= 0;
		nextBtn.disabled = currentSpread >= total - 1;
	}

	prevBtn.addEventListener('click', () => pageFlip && pageFlip.flipPrev());
	nextBtn.addEventListener('click', () => pageFlip && pageFlip.flipNext());
	firstBtn.addEventListener('click', () => pageFlip && pageFlip.turnToPage(0));
	lastBtn.addEventListener('click', () => pageFlip && pageFlip.turnToPage(totalSpreads - 1));

	progressRange.addEventListener('input', (e) => {
		const target = parseInt(e.target.value, 10);
		if (pageFlip) pageFlip.turnToPage(target);
	});

	fullscreenBtn.addEventListener('click', () => {
		const el = document.documentElement;
		if (document.fullscreenElement) {
			document.exitFullscreen?.();
		} else {
			el.requestFullscreen?.();
		}
	});

	document.addEventListener('keydown', (e) => {
		if (!pageFlip) return;
		switch (e.key) {
			case 'ArrowLeft':
				pageFlip.flipPrev();
				break;
			case 'ArrowRight':
			case ' ':
				pageFlip.flipNext();
				break;
			case 'Home':
				pageFlip.turnToPage(0);
				break;
			case 'End':
				pageFlip.turnToPage(totalSpreads - 1);
				break;
		}
	});

	let resizeTimer = null;
	window.addEventListener('resize', () => {
		if (resizeTimer) clearTimeout(resizeTimer);
		resizeTimer = setTimeout(() => {
			if (!pageFlip) return;
			const s = computeBookSize();
			pageFlip.update({ width: s.width, height: s.height });
		}, 200);
	});

	preload(4).then(() => {
		loader.style.display = 'none';
		bookWrap.hidden = false;
		bottombar.hidden = false;
		requestAnimationFrame(init);
	});
})();
