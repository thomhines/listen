$(document).ready(function() {
	// Global variables
	let currentAudioPlayer = null;
	let currentMusicPlayer = null;
	let isDragging = false;

	// Initialize the app
	init();

	function init() {
		loadFileLists();
		setupEventListeners();
		setupAudioPlayers();
	}

	function loadFileLists() {
		// Use file lists passed from PHP
		populateFileList('audio-files-list', window.audioFiles || [], 'audio');
		populateFileList('music-files-list', window.musicFiles || [], 'music');
	}

	function setupEventListeners() {
		// Main player area - tap to pause/resume
		$('#main-player-area').on('click', function(e) {
			// Don't trigger if clicking on controls
			if ($(e.target).closest('#controls').length) {
				return;
			}
			togglePlayback();
		});

		// Control buttons
		$('#audio-files-btn').on('click', function() {
			$('#audio-files-modal').addClass('active');
		});

		$('#music-files-btn').on('click', function() {
			$('#music-files-modal').addClass('active');
		});

		// Audio control buttons
		$('#back-15-btn').on('click', function() {
			skipAudio(-15);
		});

		$('#play-pause-btn').on('click', function() {
			togglePlayback();
		});

		$('#forward-15-btn').on('click', function() {
			skipAudio(15);
		});

		// Music control button
		$('#music-control-btn').on('click', function() {
			toggleMusicPlayback();
		});

		// Modal close buttons
		$('.close-btn').on('click', function() {
			$('.modal').removeClass('active');
		});

		// Close modal when clicking outside
		$('.modal').on('click', function(e) {
			if (e.target === this) {
				$(this).removeClass('active');
			}
		});

		// Scrubber interactions
		$('#scrubber-bar').on('mousedown touchstart', function(e) {
			isDragging = true;
			updateScrubberPosition(e);
		});

		$(document).on('mousemove touchmove', function(e) {
			if (isDragging) {
				updateScrubberPosition(e);
			}
		});

		$(document).on('mouseup touchend', function() {
			if (isDragging) {
				isDragging = false;
			}
		});
	}

	function setupAudioPlayers() {
		const audioPlayer = $('#audio-player')[0];
		const musicPlayer = $('#music-player')[0];

		// Audio player events
		audioPlayer.addEventListener('loadedmetadata', function() {
			updateTimeDisplay();
		});

		audioPlayer.addEventListener('timeupdate', function() {
			updateTimeDisplay();
			updateScrubber();
		});

		audioPlayer.addEventListener('ended', function() {
			updatePlayState(false);
		});

		// Music player events
		musicPlayer.addEventListener('loadedmetadata', function() {
			// Music player doesn't update main display
		});

		musicPlayer.addEventListener('play', function() {
			updateMusicControlButton(true);
		});

		musicPlayer.addEventListener('pause', function() {
			updateMusicControlButton(false);
		});

		musicPlayer.addEventListener('ended', function() {
			// Loop music
			musicPlayer.currentTime = 0;
			musicPlayer.play();
		});
	}

	function populateFileList(containerId, files, type) {
		const container = $('#' + containerId);
		container.empty();

		if (files.length === 0) {
			container.append('<p class="no-files">No files found</p>');
			return;
		}

		files.forEach(function(file) {
			const fileItem = $('<div class="file-item"></div>');
			const fileName = file.replace(/\.[^/.]+$/, ""); // Remove extension
			
			fileItem.html(`
				<span class="file-name">${fileName}</span>
				<button class="play-btn" data-file="${file}" data-type="${type}">Play</button>
			`);

			fileItem.find('.play-btn').on('click', function() {
				const fileName = $(this).data('file');
				const fileType = $(this).data('type');
				playFile(fileName, fileType);
				$('.modal').removeClass('active');
			});

			container.append(fileItem);
		});
	}

	function playFile(fileName, type) {
		const filePath = type + '/' + fileName;
		
		if (type === 'audio') {
			// Stop music if playing
			if (currentMusicPlayer) {
				currentMusicPlayer.pause();
				currentMusicPlayer = null;
			}

			// Play audio file
			const audioPlayer = $('#audio-player')[0];
			audioPlayer.src = filePath;
			audioPlayer.play();
			currentAudioPlayer = audioPlayer;
			currentMusicPlayer = null;

			// Update UI
			const displayName = fileName.replace(/\.[^/.]+$/, "");
			$('#track-title').text(displayName);
			updatePlayState(true);
			updateAudioControlButtons(true);
		} else if (type === 'music') {
			// Play music in background
			const musicPlayer = $('#music-player')[0];
			musicPlayer.src = filePath;
			musicPlayer.play();
			currentMusicPlayer = musicPlayer;
		}
	}

	function togglePlayback() {
		if (currentAudioPlayer) {
			if (currentAudioPlayer.paused) {
				currentAudioPlayer.play();
				updatePlayState(true);
			} else {
				currentAudioPlayer.pause();
				updatePlayState(false);
			}
			updatePlayPauseButton();
		}
	}

	function skipAudio(seconds) {
		if (currentAudioPlayer) {
			const newTime = Math.max(0, currentAudioPlayer.currentTime + seconds);
			currentAudioPlayer.currentTime = newTime;
		}
	}

	function toggleMusicPlayback() {
		if (currentMusicPlayer) {
			if (currentMusicPlayer.paused) {
				currentMusicPlayer.play();
			} else {
				currentMusicPlayer.pause();
			}
		}
	}

	function updateAudioControlButtons(enabled) {
		$('#back-15-btn').prop('disabled', !enabled);
		$('#play-pause-btn').prop('disabled', !enabled);
		$('#forward-15-btn').prop('disabled', !enabled);
	}

	function updatePlayPauseButton() {
		const playPauseBtn = $('#play-pause-btn');
		if (currentAudioPlayer && !currentAudioPlayer.paused) {
			playPauseBtn.text('⏸');
		} else {
			playPauseBtn.text('▶');
		}
	}

	function updateMusicControlButton(isPlaying) {
		const musicBtn = $('#music-control-btn');
		
		if (currentMusicPlayer) {
			musicBtn.prop('disabled', false);
			musicBtn.text(isPlaying ? '⏸' : '▶');
		} else {
			musicBtn.prop('disabled', true);
			musicBtn.text('▶');
		}
	}

	function updatePlayState(isPlaying) {
		// Visual feedback for play state
		if (isPlaying) {
			$('#main-player-area').addClass('playing');
		} else {
			$('#main-player-area').removeClass('playing');
		}
		updatePlayPauseButton();
	}

	function updateTimeDisplay() {
		if (!currentAudioPlayer) return;

		const current = currentAudioPlayer.currentTime;
		const total = currentAudioPlayer.duration;

		if (!isNaN(current) && !isNaN(total)) {
			$('#current-time').text(formatTime(current));
			$('#total-time').text(formatTime(total));
			$('#track-duration').text(`${formatTime(current)} / ${formatTime(total)}`);
		}
	}

	function updateScrubber() {
		if (!currentAudioPlayer || isDragging) return;

		const current = currentAudioPlayer.currentTime;
		const total = currentAudioPlayer.duration;

		if (!isNaN(current) && !isNaN(total) && total > 0) {
			const progress = (current / total) * 100;
			$('#scrubber-progress').css('width', progress + '%');
			$('#scrubber-handle').css('left', progress + '%');
		}
	}

	function updateScrubberPosition(e) {
		if (!currentAudioPlayer) return;

		const scrubberBar = $('#scrubber-bar')[0];
		const rect = scrubberBar.getBoundingClientRect();
		const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
		const clickX = clientX - rect.left;
		const progress = Math.max(0, Math.min(1, clickX / rect.width));
		
		const newTime = progress * currentAudioPlayer.duration;
		currentAudioPlayer.currentTime = newTime;
		
		// Update scrubber visual position immediately
		const progressPercent = progress * 100;
		$('#scrubber-progress').css('width', progressPercent + '%');
		$('#scrubber-handle').css('left', progressPercent + '%');
		
		// Update time display immediately
		$('#current-time').text(formatTime(newTime));
		$('#track-duration').text(`${formatTime(newTime)} / ${formatTime(currentAudioPlayer.duration)}`);
	}

	function formatTime(seconds) {
		if (isNaN(seconds)) return '00:00';
		
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}
});
