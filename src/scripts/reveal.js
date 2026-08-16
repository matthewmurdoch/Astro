const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealTargets = document.querySelectorAll('[data-reveal]');

if (reduceMotion || !('IntersectionObserver' in window)) {
	revealTargets.forEach((el) => el.classList.add('is-visible'));
} else {
	const groups = new Map();
	revealTargets.forEach((el) => {
		const group = el.closest('[data-reveal-group]') ?? el.parentElement;
		if (!groups.has(group)) groups.set(group, []);
		groups.get(group).push(el);
	});
	groups.forEach((items) => {
		items.forEach((el, i) => el.style.setProperty('--reveal-index', String(i % 6)));
	});

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					observer.unobserve(entry.target);
				}
			}
		},
		{ threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
	);

	revealTargets.forEach((el) => observer.observe(el));
}

const canHoverPrecise = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (canHoverPrecise && !reduceMotion) {
	document.querySelectorAll('[data-tilt]').forEach((card) => {
		let frame = null;

		card.addEventListener('pointermove', (event) => {
			const rect = card.getBoundingClientRect();
			const px = (event.clientX - rect.left) / rect.width;
			const py = (event.clientY - rect.top) / rect.height;

			if (frame) cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => {
				const rotateY = (px - 0.5) * 10;
				const rotateX = (0.5 - py) * 10;
				card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
				card.style.setProperty('--glow-x', `${px * 100}%`);
				card.style.setProperty('--glow-y', `${py * 100}%`);
			});
		});

		card.addEventListener('pointerleave', () => {
			if (frame) cancelAnimationFrame(frame);
			card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0)';
		});
	});
}

const servicesPin = document.querySelector('[data-services-triggers]');
if (servicesPin && 'IntersectionObserver' in window && window.matchMedia('(min-width: 900px)').matches) {
	const triggers = servicesPin.querySelectorAll('[data-service-trigger]');
	const rows = document.querySelectorAll('[data-service-row]');
	const dots = document.querySelectorAll('[data-rail-dot]');

	const setActive = (index) => {
		rows.forEach((row) => row.classList.toggle('is-active', row.dataset.serviceRow === String(index)));
		dots.forEach((dot) => dot.classList.toggle('is-active', dot.dataset.railDot === String(index)));
	};

	const pinObserver = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					setActive(entry.target.dataset.serviceTrigger);
				}
			}
		},
		{ rootMargin: '-50% 0px -50% 0px', threshold: 0 },
	);

	triggers.forEach((trigger) => pinObserver.observe(trigger));
}

const nav = document.querySelector('[data-nav]');
if (nav) {
	const sentinel = document.querySelector('[data-nav-sentinel]');
	if (sentinel && 'IntersectionObserver' in window) {
		const navObserver = new IntersectionObserver(
			([entry]) => nav.classList.toggle('is-scrolled', !entry.isIntersecting),
			{ threshold: 0 },
		);
		navObserver.observe(sentinel);
	}

	const menuToggle = nav.querySelector('[data-menu-toggle]');
	const menuPanel = nav.querySelector('[data-menu-panel]');
	if (menuToggle && menuPanel) {
		menuToggle.addEventListener('click', () => {
			const isOpen = nav.classList.toggle('is-open');
			menuToggle.setAttribute('aria-expanded', String(isOpen));
			document.body.style.overflow = isOpen ? 'hidden' : '';
		});
		menuPanel.querySelectorAll('a').forEach((link) => {
			link.addEventListener('click', () => {
				nav.classList.remove('is-open');
				menuToggle.setAttribute('aria-expanded', 'false');
				document.body.style.overflow = '';
			});
		});
	}
}
