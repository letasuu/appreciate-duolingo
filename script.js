console.log("script.js: loaded");

document.addEventListener('DOMContentLoaded', () => {
	const img = document.getElementById('duoImg');
	const lines = Array.from(document.querySelectorAll('.line'));
	const buttons = Array.from(document.querySelectorAll('.button-bar button'));
	const buttonBar = document.querySelector('.button-bar');

	// Ensure image is absolutely positioned relative to .page
	if (img) img.style.position = 'absolute';

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
			// move back to button bar
			flipMove(btn, buttonBar);
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

	buttons.forEach(btn => {
		btn.addEventListener('click', () => handleButtonClick(btn));
	});

	// initial placement for image
	if (lines.length && img) {
		const top = lines[0].offsetTop + Math.max(0, (lines[0].clientHeight - img.clientHeight) / 2);
		img.style.top = top + 'px';
	}
});