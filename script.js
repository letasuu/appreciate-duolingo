console.log("script.js: loaded");

document.addEventListener('DOMContentLoaded', () => {
	const lines = Array.from(document.querySelectorAll('.line'));
	let buttons = Array.from(document.querySelectorAll('.button-bar button'));

	// simple helper: FLIP animation when moving element between containers
	function flipMove(el, newParent, cb) {
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
			if (typeof cb === 'function') cb();
		}, {once: true});
	}

	// move a button into a line.slot (append to right) or back to buttonBar
	function handleButtonClick(btn) {

		const isMoved = btn.dataset.moved === 'true';
		if (isMoved) {
			// move back to its original home slot if present
			const home = btn._home || document.querySelector('.button-bar');
			if (!home) return;
			// animate back, then reset moved state
			btn.classList.add('moving');
			flipMove(btn, home, () => {
				btn.classList.remove('moving');
				btn.classList.remove('moved');
				btn.dataset.moved = 'false';
				delete btn.dataset.typeMoved;

				// restore any original inline styles we saved when moving into the line
				try {
					if (btn._origInline) {
						btn.style.boxShadow = btn._origInline.boxShadow || '';
						btn.style.background = btn._origInline.background || '';
						btn.style.color = btn._origInline.color || '';
						btn.style.padding = btn._origInline.padding || '';
						btn.style.fontSize = btn._origInline.fontSize || '';
						btn.style.borderRadius = btn._origInline.borderRadius || '';
						delete btn._origInline;
					}
				} catch (e) {
					// ignore
				}
			});
			return;
		}

		// target is always the single .line .slot (lines are not separated)
		const targetSlot = document.querySelector('.line .slot');
		if (!targetSlot) return;

		// add moving class for visual activation; after move, mark moved
		btn.classList.add('moving');
		flipMove(btn, targetSlot, () => {
			btn.classList.remove('moving');
			btn.classList.add('moved');
			btn.dataset.moved = 'true';
			btn.dataset.typeMoved = btn.dataset.type || 'unknown';

			// Preserve computed visual styles (text, padding, box-shadow etc.)
			// so the button looks the same in the `.line .slot` as it did in the bar.
			try {
				// save any existing inline styles so we can restore on return
				btn._origInline = btn._origInline || {
					boxShadow: btn.style.boxShadow || '',
					background: btn.style.background || '',
					color: btn.style.color || '',
					padding: btn.style.padding || '',
					fontSize: btn.style.fontSize || '',
					borderRadius: btn.style.borderRadius || ''
				};
				const cs = window.getComputedStyle(btn);
				btn.style.boxShadow = cs.boxShadow || '';
				// preserve the visible background color (computed) — gradients will be flattened
				btn.style.background = cs.backgroundColor || cs.background || '';
				btn.style.color = cs.color || '';
				btn.style.padding = cs.padding || '';
				btn.style.fontSize = cs.fontSize || '';
				btn.style.borderRadius = cs.borderRadius || '';
			} catch (e) {
				// fail-safe: do nothing if computed styles are not available
			}
		});
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

		// ensure button content is wrapped so we can animate inner text independently
		if (!btn.querySelector('span')) {
			const s = document.createElement('span');
			s.innerHTML = btn.innerHTML;
			btn.textContent = '';
			btn.appendChild(s);
		}

		// replace button in the bar with the home slot, then append the button into it
		const parentBar = btn.parentElement;
		(parentBar || document.body).insertBefore(home, btn);
		home.appendChild(btn);
		// store reference for returning later
		btn._home = home;

		btn.addEventListener('click', () => handleButtonClick(btn));
	});

	// refresh buttons list to reflect DOM arrangement
	buttons = Array.from(document.querySelectorAll('.button-bar button'));

	// save button: collect buttons currently in the line slot and show preview
	const saveBtn = document.getElementById('saveButton');
	if (saveBtn) {
		saveBtn.addEventListener('click', () => {
			const slotButtons = Array.from(document.querySelectorAll('.line .slot button'));
			const items = slotButtons.map(b => {
				const span = b.querySelector('span');
				return span ? span.innerText.trim() : b.innerText.trim();
			}).filter(Boolean);
			showPreview(items);
		});
	}

	const clearBtn = document.getElementById('clearButton');
	if (clearBtn) {
		clearBtn.addEventListener('click', () => {
			const movedButtons = Array.from(document.querySelectorAll('.line .slot button'));
			movedButtons.forEach(btn => btn.click());
		});
	}

	function showPreview(items){
		let overlay = document.getElementById('previewOverlay');
		if (!overlay){
			overlay = document.createElement('div');
			overlay.id = 'previewOverlay';
			overlay.className = 'preview-overlay';
			const box = document.createElement('div');
			box.className = 'preview-box';
			const content = document.createElement('div');
			content.className = 'preview-content';
			box.appendChild(content);
			const close = document.createElement('button');
			close.className = 'preview-close';
			close.textContent = '閉じる';
			close.addEventListener('click', () => overlay.remove());
			box.appendChild(close);
			overlay.appendChild(box);
			document.body.appendChild(overlay);
			// clicking outside box closes
			overlay.addEventListener('click', (e)=>{ if (e.target === overlay) overlay.remove(); });
		}
		const content = overlay.querySelector('.preview-content');
		content.innerHTML = '';
		if (!items.length) {
			const p = document.createElement('div');
			p.className = 'preview-item';
			p.textContent = '（何もありません）';
			content.appendChild(p);
			return;
		}
		items.forEach(text => {
			const p = document.createElement('div');
			p.className = 'preview-item';
			p.textContent = text;
			content.appendChild(p);
		});
	}

	// No image to place — buttons only behavior
});