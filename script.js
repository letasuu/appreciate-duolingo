console.log("script.js: loaded");

document.addEventListener('DOMContentLoaded', () => {
	const lines = Array.from(document.querySelectorAll('.line'));
	let buttons = Array.from(document.querySelectorAll('.button-bar button'));
	const buttonBar = document.querySelector('.button-bar');

	// simple helper: FLIP animation when moving element between containers
	function flipMove(el, newParent) {
		const start = el.getBoundingClientRect();
		const startTransform = el.style.transform || '';
		const startTransition = el.style.transition || '';

		// append first so end rect is computed in new layout
		newParent.appendChild(el);
		const end = el.getBoundingClientRect();

		const dx = start.left - end.left;
		const dy = start.top - end.top;

		// invert
		el.style.transform = `translate(${dx}px, ${dy}px)`;
		// force style apply
		requestAnimationFrame(() => {
			el.style.transition = 'transform 320ms cubic-bezier(.2,.9,.2,1)';
			el.style.transform = '';
		});

		el.addEventListener('transitionend', function handler() {
			el.style.transition = startTransition;
			el.style.transform = startTransform;
			el.removeEventListener('transitionend', handler);
		}, {once: true});
	}

	// move a button into a line.slot (append to right) or back to buttonBar
	function handleButtonClick(btn) {
		const isMoved = btn.dataset.moved === 'true';
		if (isMoved) {
			// move back to its original home slot if present
			const home = btn._home || buttonBar;
			flipMove(btn, home);
			btn.dataset.moved = 'false';
			delete btn.dataset.lineMoved;
			return;
		}

		const targetIndex = Number(btn.dataset.line);
		const targetLine = lines[targetIndex];
		if (!targetLine) return;
		const slot = targetLine.querySelector('.slot') || targetLine;

		flipMove(btn, slot);
		btn.dataset.moved = 'true';
		btn.dataset.lineMoved = String(targetIndex);
	}

	// wrap each button in a home-slot so we can return it to the original place
	buttons.forEach(btn => {
		const home = document.createElement('div');
		home.className = 'home-slot';
		// style to reserve space when empty
		home.style.display = 'inline-flex';
		home.style.alignItems = 'center';
		home.style.justifyContent = 'center';

		// set explicit size to avoid layout shift when button is moved
		const rect = btn.getBoundingClientRect();
		const w = rect.width || btn.offsetWidth || 80;
		const h = rect.height || btn.offsetHeight || 36;
		home.style.width = w + 'px';
		home.style.height = h + 'px';

		// replace button in the bar with the home slot, then append the button into it
		buttonBar.insertBefore(home, btn);
		home.appendChild(btn);
		// store reference for returning later
		btn._home = home;

		btn.addEventListener('click', () => handleButtonClick(btn));
	});

	// refresh buttons list to reflect DOM arrangement
	buttons = Array.from(document.querySelectorAll('.button-bar button'));

	// No image to place — buttons only behavior
});