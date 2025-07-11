cl = console.log;

	// Set viewport height immediately
	function setViewportHeight() {
		const vh = window.innerHeight * 0.01;
		document.documentElement.style.setProperty('--vh', `${vh}px`);
		cl('Setting viewport height to:', window.innerHeight, 'px (--vh:', vh, 'px)');
	}

	// Set initial viewport height
	setViewportHeight();

	$(document).ready(function() {
		// Global variables
		let currentAudioPlayer = null;
		let currentMusicPlayer = null;
		let isDragging = false;
		let isSeeking = false; // Track if a seek operation is in progress
		let seekQueue = []; // Queue for pending seek operations
		let audioBuffers = new Map(); // Cache for fully buffered audio files
	
	// Swipe gesture variables
	let touchStartX = 0;
	let touchStartY = 0;
	let touchEndX = 0;
	let touchEndY = 0;
	let minSwipeDistance = 50; // Minimum distance for a swipe to be recognized

	// Initialize the app
	init();

	function init() {
		loadFileLists();
		setupEventListeners();
		setupAudioPlayers();
		setupMobileSafari();
	}

	function loadFileLists() {
		// Use file lists passed from PHP
		populateFileList('audio-files-list', window.audioFiles || [], '_audio');
		populateFileList('music-files-list', window.musicFiles || [], '_music');
	}

	function setupEventListeners() {
		// Main player area - tap to pause/resume and swipe gestures
		$('#main-player-area').on('click', function(e) {
			// Don't trigger if clicking on controls
			if ($(e.target).closest('#controls, #top-controls').length) {
				return;
			}
			togglePlayback();
		});

			// Swipe gesture detection
	$('#main-player-area').on('touchstart', function(e) {
		touchStartX = e.originalEvent.touches[0].clientX;
		touchStartY = e.originalEvent.touches[0].clientY;
	});

	$('#main-player-area').on('touchend', function(e) {
		touchEndX = e.originalEvent.changedTouches[0].clientX;
		touchEndY = e.originalEvent.changedTouches[0].clientY;
		
		const deltaX = touchEndX - touchStartX;
		const deltaY = touchEndY - touchStartY;
		
		// Check if it's a horizontal swipe (more horizontal than vertical)
		if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
			// Prevent the click event from firing
			e.preventDefault();
			
			if (deltaX > 0) {
				// Swipe right - skip backward 10 seconds
				skipAudio(-10);
			} else {
				// Swipe left - skip forward 10 seconds
				skipAudio(10);
			}
		}
	});

		// Control buttons
		$('#audio-files-btn').on('click', function() {
			$('#audio-files-modal').addClass('active');
		});

		$('#music-files-btn').on('click', function() {
			$('#music-files-modal').addClass('active');
		});

		// Audio control buttons
		$('#back-10-btn').on('click', function() {
			skipAudio(-10);
		});

		$('#play-pause-btn').on('click', function() {
			togglePlayback();
		});

		$('#forward-10-btn').on('click', function() {
			skipAudio(10);
		});

		// Music control button
		$('#music-control-btn').on('click', function() {
			toggleMusicPlayback();
		});

		// Volume controls
		$('#audio-volume').on('input', function() {
			const volume = $(this).val() / 100;
			if (currentAudioPlayer) {
				currentAudioPlayer.volume = volume;
			}
		});

		$('#music-volume').on('input', function() {
			const volume = $(this).val() / 100;
			if (currentMusicPlayer) {
				currentMusicPlayer.volume = volume;
			}
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

	function setupMobileSafari() {
		// Handle mobile viewport issues for both Safari and Chrome
		if (/iPad|iPhone|iPod|Android/.test(navigator.userAgent)) {
			// Set viewport height properly for mobile browsers
			const setViewportHeight = () => {
				const vh = window.innerHeight * 0.01;
				document.documentElement.style.setProperty('--vh', `${vh}px`);
				cl('Setting viewport height to:', window.innerHeight, 'px (--vh:', vh, 'px)');
			};

			// Set initial height multiple times to ensure it takes effect
			setViewportHeight();
			setTimeout(setViewportHeight, 50);
			setTimeout(setViewportHeight, 100);

			// Update on orientation change and resize
			window.addEventListener('resize', setViewportHeight);
			window.addEventListener('orientationchange', () => {
				setTimeout(setViewportHeight, 100);
			});
			
			// Also update on visual viewport changes (for mobile browsers)
			if (window.visualViewport) {
				window.visualViewport.addEventListener('resize', setViewportHeight);
			}

			// Prevent zoom on double tap
			let lastTouchEnd = 0;
			document.addEventListener('touchend', function (event) {
				const now = (new Date()).getTime();
				if (now - lastTouchEnd <= 300) {
					event.preventDefault();
				}
				lastTouchEnd = now;
			}, false);

			// Prevent pull-to-refresh
			document.body.addEventListener('touchmove', function(e) {
				if (e.target.closest('.modal-body')) {
					return; // Allow scrolling in modals
				}
				e.preventDefault();
			}, { passive: false });

			// More aggressive address bar hiding
			const hideAddressBar = () => {
				// Force scroll to hide address bar
				window.scrollTo(0, 1);
				setTimeout(() => {
					window.scrollTo(0, 0);
				}, 50);
			};

			// Hide address bar on load and various events
			hideAddressBar();
			setTimeout(hideAddressBar, 100);
			setTimeout(hideAddressBar, 500);
			setTimeout(hideAddressBar, 1000);

			// Hide address bar on touch events
			document.addEventListener('touchstart', hideAddressBar, { passive: true });
			document.addEventListener('touchend', hideAddressBar, { passive: true });

			// Hide address bar on window focus
			window.addEventListener('focus', hideAddressBar);
			window.addEventListener('blur', hideAddressBar);

			// Check if running in standalone mode (from home screen)
			if (window.navigator.standalone === true) {
				cl('Running in standalone mode - address bar should be hidden');
			} else {
				cl('Not in standalone mode - add to home screen for full-screen experience');
			}
			
			// Debug viewport info
			cl('Viewport height:', window.innerHeight);
			cl('Document height:', document.documentElement.clientHeight);
			cl('Body height:', document.body.clientHeight);
			cl('User agent:', navigator.userAgent);
			
			// Check if web app capable meta tag is working
			const meta = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
			cl('Web app capable meta:', meta ? meta.content : 'not found');
		}
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

		musicPlayer.addEventListener('ended', function() {
			// Loop music
			musicPlayer.currentTime = 0;
			musicPlayer.play();
		});
	}

	// Function to fully buffer an audio file using fetch
	async function bufferAudioFile(filePath) {
		const cacheKey = filePath;
		
		// Check if already buffered
		if (audioBuffers.has(cacheKey)) {
			return audioBuffers.get(cacheKey);
		}
		
		try {
			// Fetch the entire file
			const response = await fetch(filePath);
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			// Read the entire file as a blob
			const blob = await response.blob();
			
			// Create a blob URL for the audio element
			const blobUrl = URL.createObjectURL(blob);
			
			// Store in cache
			audioBuffers.set(cacheKey, {
				blobUrl: blobUrl,
				size: blob.size,
				originalPath: filePath
			});
			
			return audioBuffers.get(cacheKey);
			
		} catch (error) {
			throw error;
		}
	}



	// Function to safely seek to a new position with queue management
	function safeSeek(audioElement, newTime, onComplete) {
		// If already seeking, add to queue
		if (isSeeking) {
			seekQueue.push({ time: newTime, callback: onComplete });
			return;
		}

		isSeeking = true;
		
		// Store current playback state
		const wasPlaying = !audioElement.paused;
		
		// Pause if playing to prevent issues during seek
		if (wasPlaying) {
			audioElement.pause();
		}
		
		// Set the new time - should be instant with blob URLs
		audioElement.currentTime = newTime;
		
		// Since file is fully buffered, seek should be immediate
		setTimeout(() => {
			isSeeking = false;
			
			// Resume playback if it was playing before
			if (wasPlaying) {
				audioElement.play().then(function() {
					onComplete();
					processSeekQueue();
				}).catch(function(error) {
					onComplete();
					processSeekQueue();
				});
			} else {
				onComplete();
				processSeekQueue();
			}
		}, 10); // Minimal delay to ensure seek completes
	}

	// Function to process the seek queue
	function processSeekQueue() {
		if (seekQueue.length > 0 && !isSeeking) {
			const nextSeek = seekQueue.shift();
			safeSeek(currentAudioPlayer, nextSeek.time, nextSeek.callback);
		}
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

	async function playFile(fileName, type) {
		const filePath = type + '/' + fileName;
		
		if (type === '_audio') {
			// Clear any pending seeks when loading new file
			seekQueue = [];
			isSeeking = false;

			// Update UI to show loading
			const displayName = fileName.replace(/\.[^/.]+$/, "");
			$('#track-title').text(displayName);
			updateAudioControlButtons(false);
			
			try {
				// Buffer the entire audio file
				const bufferedAudio = await bufferAudioFile(filePath);
				
				// Play the fully buffered audio
				const audioPlayer = $('#audio-player')[0];
				audioPlayer.src = bufferedAudio.blobUrl;
				
				// Wait for metadata to load
				await new Promise((resolve, reject) => {
					audioPlayer.addEventListener('loadedmetadata', resolve, { once: true });
					audioPlayer.addEventListener('error', reject, { once: true });
					// Timeout after 5 seconds
					setTimeout(() => reject(new Error('Metadata loading timeout')), 5000);
				});
				
				// Start playback
				await audioPlayer.play();
				
				currentAudioPlayer = audioPlayer;
				
				// Update UI
				$('#track-title').text(displayName);
				updatePlayState(true);
				updateAudioControlButtons(true);
				
			} catch (error) {
				$('#track-title').text(displayName + ' (Error)');
				updateAudioControlButtons(false);
			}
			
		} else if (type === '_music') {
			try {
				// Buffer the entire music file
				const bufferedMusic = await bufferAudioFile(filePath);
				
				// Play the fully buffered music
				const musicPlayer = $('#music-player')[0];
				musicPlayer.src = bufferedMusic.blobUrl;
				
				// Wait for metadata to load
				await new Promise((resolve, reject) => {
					musicPlayer.addEventListener('loadedmetadata', resolve, { once: true });
					musicPlayer.addEventListener('error', reject, { once: true });
					setTimeout(() => reject(new Error('Metadata loading timeout')), 5000);
				});
				
				// Start playback
				await musicPlayer.play();
				
				currentMusicPlayer = musicPlayer;
				
				// Update button state after setting currentMusicPlayer
				updateMusicControlButton(true);
				
			} catch (error) {
				// Handle music error silently
			}
		}
	}

	function togglePlayback() {
		if (currentAudioPlayer) {
			if (currentAudioPlayer.paused) {
				currentAudioPlayer.play().then(function() {
					updatePlayState(true);
				}).catch(function(error) {
					// Handle error silently
				});
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
			
			// Use safe seek for skipping
			safeSeek(currentAudioPlayer, newTime, function() {
				// Seek completed
			});
		}
	}

	function toggleMusicPlayback() {
		if (currentMusicPlayer) {
			if (currentMusicPlayer.paused) {
				currentMusicPlayer.play().then(function() {
					updateMusicControlButton(true);
				}).catch(function(error) {
					// Handle error silently
				});
			} else {
				currentMusicPlayer.pause();
				updateMusicControlButton(false);
			}
		}
	}

	function updateAudioControlButtons(enabled) {
		$('#back-10-btn').prop('disabled', !enabled);
		$('#play-pause-btn').prop('disabled', !enabled);
		$('#forward-10-btn').prop('disabled', !enabled);
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
			// Check actual play state rather than relying on parameter
			const isActuallyPlaying = !currentMusicPlayer.paused;
			musicBtn.text(isActuallyPlaying ? '⏸' : '▶');
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
		
		// Use safe seek for scrubber as well
		safeSeek(currentAudioPlayer, newTime, function() {
			// Scrubber seek completed
		});
		
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
