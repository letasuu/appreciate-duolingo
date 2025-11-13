console.log("script.js: loaded");

document.addEventListener('DOMContentLoaded', () => {
	const img = document.getElementById('duoImg');
	const lines = Array.from(document.querySelectorAll('.line'));
	const buttons = Array.from(document.querySelectorAll('.button-bar button'));
	const page = document.querySelector('.page');

	// Ensure image is absolutely positioned relative to .page
	img.style.position = 'absolute';

	function moveToLine(index) {
		const line = lines[index];
		if (!line) return;

		// Compute top relative to the .page container
		// use offsetTop so it works even if page is scrolled
		const top = line.offsetTop + Math.max(0, (line.clientHeight - img.clientHeight) / 2);
		img.style.top = top + 'px';
	}

	buttons.forEach(btn => {
		btn.addEventListener('click', () => {
			const idx = Number(btn.dataset.line);
			moveToLine(idx);
		});
	});

	// initial placement
	if (lines.length) moveToLine(0);
});