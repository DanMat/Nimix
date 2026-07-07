/*
 * Nimix — a beach-themed game of misère Nim.
 *
 * Rules: birds start in four rows of 1, 3, 5, 7. On a turn a player removes
 * any number of birds from a single row. Whoever takes the LAST bird loses.
 *
 * Rebuilt from the original 2011 jQuery version into dependency-free vanilla JS.
 * The AI plays the mathematically optimal misère strategy (nim-sum / XOR).
 */
(function () {
	'use strict';

	var START = [1, 3, 5, 7];

	var els = {
		board: document.getElementById('board'),
		status: document.getElementById('statusText'),
		badge: document.getElementById('turnBadge'),
		endTurn: document.getElementById('endTurnBtn'),
		mascot: document.getElementById('mascot'),
		newBtn: document.getElementById('newBtn'),
		diffBtn: document.getElementById('diffBtn'),
		themeBtn: document.getElementById('themeBtn'),
		howBtn: document.getElementById('howBtn'),
		howto: document.getElementById('howto'),
		howClose: document.getElementById('howCloseBtn'),
		overlay: document.getElementById('overlay'),
		overlayEmoji: document.getElementById('overlayEmoji'),
		overlayTitle: document.getElementById('overlayTitle'),
		overlayText: document.getElementById('overlayText'),
		overlayBtn: document.getElementById('overlayBtn')
	};

	var state = {
		heaps: START.slice(),
		turn: 'player',        // 'player' | 'computer' | 'over'
		activeRow: null,       // row the player is removing from this turn
		removedThisTurn: 0,
		perfect: true,         // AI difficulty
		busy: false            // animation / AI in progress — ignore input
	};

	/* ----------------------------- rendering ----------------------------- */

	function buildBoard() {
		els.board.innerHTML = '';
		state.heaps.forEach(function (count, row) {
			var rowEl = document.createElement('div');
			rowEl.className = 'board__row';
			rowEl.dataset.row = row;
			for (var i = 0; i < count; i++) {
				rowEl.appendChild(makeBird(row));
			}
			els.board.appendChild(rowEl);
		});
	}

	function makeBird(row) {
		var b = document.createElement('button');
		b.type = 'button';
		b.className = 'bird';
		b.dataset.row = row;
		b.setAttribute('aria-label', 'Bird in row ' + (row + 1));
		b.addEventListener('click', function () { onBirdClick(row, b); });
		return b;
	}

	function birdsInRow(row) {
		return els.board.querySelectorAll('.board__row[data-row="' + row + '"] .bird:not(.bird--gone)');
	}

	/* --------------------------- player input ---------------------------- */

	function onBirdClick(row, birdEl) {
		if (state.turn !== 'player' || state.busy || birdEl.classList.contains('bird--gone')) { return; }

		// Enforce "one row per turn".
		if (state.activeRow !== null && state.activeRow !== row) {
			flashStatus('One row per turn — finish this row first!');
			highlightRow(state.activeRow);
			return;
		}

		state.activeRow = row;
		state.removedThisTurn++;
		state.heaps[row]--;
		removeBird(birdEl);
		lockOtherRows(row);
		els.endTurn.disabled = false;
		setStatus('Removed ' + state.removedThisTurn + ' from row ' + (row + 1) + '. Take more, or end your turn.');
	}

	function lockOtherRows(activeRow) {
		els.board.querySelectorAll('.board__row').forEach(function (r) {
			r.classList.toggle('board__row--dim', parseInt(r.dataset.row, 10) !== activeRow);
		});
	}

	function unlockRows() {
		els.board.querySelectorAll('.board__row').forEach(function (r) {
			r.classList.remove('board__row--dim');
		});
	}

	function endTurn() {
		if (state.turn !== 'player' || state.removedThisTurn === 0 || state.busy) { return; }
		state.activeRow = null;
		state.removedThisTurn = 0;
		els.endTurn.disabled = true;
		unlockRows();

		if (totalBirds() === 0) { return finish(false); } // player took the last bird → player loses
		startComputerTurn();
	}

	/* ---------------------------- computer ------------------------------- */

	function startComputerTurn() {
		state.turn = 'computer';
		setBadge('computer');
		setStatus('The surfer is thinking…');
		els.mascot.classList.add('mascot--thinking');
		state.busy = true;

		setTimeout(function () {
			var move = state.perfect ? bestMove(state.heaps) : easyMove(state.heaps);
			playComputerMove(move);
		}, 850);
	}

	function playComputerMove(move) {
		var birds = birdsInRow(move.row);
		// Remove the last `move.count` birds in the row, staggered for effect.
		var toRemove = Array.prototype.slice.call(birds, birds.length - move.count);
		state.heaps[move.row] -= move.count;

		toRemove.forEach(function (b, i) {
			setTimeout(function () { removeBird(b); }, i * 130);
		});

		var settle = toRemove.length * 130 + 360;
		setTimeout(function () {
			els.mascot.classList.remove('mascot--thinking');
			state.busy = false;
			if (totalBirds() === 0) { return finish(true); } // computer took the last bird → player wins
			state.turn = 'player';
			setBadge('player');
			setStatus('Your turn — remove any number of birds from one row.');
		}, settle);
	}

	/* ------------------------- Nim / misère AI --------------------------- */

	// Optimal misère-Nim move. Returns { row, count } for a heap to reduce.
	function bestMove(heaps) {
		var bigHeaps = heaps.filter(function (h) { return h >= 2; }).length;

		// Endgame: every heap is 0 or 1 — the outcome is fixed, just take one.
		if (bigHeaps === 0) {
			return { row: firstIndex(heaps, function (h) { return h === 1; }), count: 1 };
		}

		var onesCount = heaps.filter(function (h) { return h === 1; }).length;

		// Exactly one big heap → switch to the misère rule: leave an ODD
		// number of 1-heaps so the opponent is handed a losing position.
		if (bigHeaps === 1) {
			var row = firstIndex(heaps, function (h) { return h >= 2; });
			// Leave the big heap at 1 (adds a one) or 0, whichever makes ones odd.
			var leave = (onesCount % 2 === 0) ? 1 : 0;
			return { row: row, count: heaps[row] - leave };
		}

		// Two or more big heaps → play normal Nim: move to make the nim-sum 0.
		var xorAll = heaps.reduce(function (a, b) { return a ^ b; }, 0);
		if (xorAll !== 0) {
			for (var i = 0; i < heaps.length; i++) {
				var target = heaps[i] ^ xorAll;
				if (target < heaps[i]) { return { row: i, count: heaps[i] - target }; }
			}
		}
		// Losing position (nim-sum already 0): make a safe delaying move.
		var big = firstIndex(heaps, function (h) { return h >= 2; });
		return { row: big, count: 1 };
	}

	// Easy AI: half the time a random legal move, otherwise optimal.
	function easyMove(heaps) {
		if (Math.random() < 0.55) {
			var nonEmpty = [];
			heaps.forEach(function (h, i) { if (h > 0) { nonEmpty.push(i); } });
			var row = nonEmpty[Math.floor(Math.random() * nonEmpty.length)];
			return { row: row, count: 1 + Math.floor(Math.random() * heaps[row]) };
		}
		return bestMove(heaps);
	}

	function firstIndex(arr, pred) {
		for (var i = 0; i < arr.length; i++) { if (pred(arr[i])) { return i; } }
		return -1;
	}

	/* ---------------------------- helpers -------------------------------- */

	function totalBirds() {
		return state.heaps.reduce(function (a, b) { return a + b; }, 0);
	}

	function removeBird(birdEl) {
		birdEl.disabled = true;
		// Randomise the spin direction so each poof feels a little different.
		birdEl.style.setProperty('--spin', (Math.random() < 0.5 ? -1 : 1) * (300 + Math.random() * 180) + 'deg');
		birdEl.classList.add('bird--gone');
		// Once it has imploded, drop it out of layout in one step (no width animation).
		setTimeout(function () { birdEl.style.display = 'none'; }, 300);
	}

	function highlightRow(row) {
		var rowEl = els.board.querySelector('.board__row[data-row="' + row + '"]');
		if (!rowEl) { return; }
		rowEl.classList.add('board__row--nudge');
		setTimeout(function () { rowEl.classList.remove('board__row--nudge'); }, 400);
	}

	var statusTimer;
	function setStatus(msg) {
		clearTimeout(statusTimer);
		els.status.textContent = msg;
	}
	function flashStatus(msg) {
		setStatus(msg);
		els.status.parentElement.classList.add('status--warn');
		clearTimeout(statusTimer);
		statusTimer = setTimeout(function () {
			els.status.parentElement.classList.remove('status--warn');
		}, 900);
	}

	function setBadge(who) {
		els.badge.textContent = who === 'player' ? 'Your turn' : "Surfer's turn";
		els.badge.classList.toggle('status__badge--comp', who === 'computer');
	}

	function finish(playerWon) {
		state.turn = 'over';
		state.busy = false;
		els.mascot.classList.remove('mascot--thinking');
		els.overlayEmoji.textContent = playerWon ? '🏆' : '🌊';
		els.overlayTitle.textContent = playerWon ? 'You win!' : 'You lose!';
		els.overlayText.textContent = playerWon
			? 'The surfer took the last bird. Nicely played!'
			: 'You were forced to take the last bird. Try again?';
		setBadge(playerWon ? 'player' : 'computer');
		setStatus(playerWon ? 'You win! 🏆' : 'You lose — the last bird was yours. 🌊');
		showOverlay(els.overlay);
	}

	/* ---------------------------- overlays ------------------------------- */

	function showOverlay(node) { node.hidden = false; requestAnimationFrame(function () { node.classList.add('overlay--show'); }); }
	function hideOverlay(node) { node.classList.remove('overlay--show'); setTimeout(function () { node.hidden = true; }, 250); }

	/* ------------------------------ setup -------------------------------- */

	function newGame() {
		hideOverlay(els.overlay);
		state.heaps = START.slice();
		state.turn = 'player';
		state.activeRow = null;
		state.removedThisTurn = 0;
		state.busy = false;
		buildBoard();
		unlockRows();
		els.endTurn.disabled = true;
		setBadge('player');
		setStatus('Remove any number of birds from a single row, then end your turn.');
	}

	function toggleDifficulty() {
		state.perfect = !state.perfect;
		els.diffBtn.textContent = 'AI: ' + (state.perfect ? 'Perfect' : 'Easy');
		els.diffBtn.setAttribute('aria-pressed', String(!state.perfect));
	}

	var THEMES = [
		{ id: 'day', label: '🌤 Day' },
		{ id: 'dusk', label: '🌅 Dusk' },
		{ id: 'night', label: '🌙 Night' }
	];
	var themeIdx = 0;
	function cycleTheme() {
		themeIdx = (themeIdx + 1) % THEMES.length;
		document.documentElement.setAttribute('data-theme', THEMES[themeIdx].id);
		els.themeBtn.textContent = THEMES[themeIdx].label;
	}

	els.endTurn.addEventListener('click', endTurn);
	els.newBtn.addEventListener('click', newGame);
	els.diffBtn.addEventListener('click', toggleDifficulty);
	els.themeBtn.addEventListener('click', cycleTheme);
	els.howBtn.addEventListener('click', function () { showOverlay(els.howto); });
	els.howClose.addEventListener('click', function () { hideOverlay(els.howto); });
	els.overlayBtn.addEventListener('click', newGame);
	els.mascot.addEventListener('click', function () {
		if (state.turn === 'player' && !state.endTurn) { /* mascot is decorative now */ }
	});

	// Keyboard: Enter ends the turn, N starts a new game.
	document.addEventListener('keydown', function (e) {
		if (e.key === 'Enter' && !els.endTurn.disabled) { endTurn(); }
		else if (e.key.toLowerCase() === 'n') { newGame(); }
	});

	newGame();
})();
