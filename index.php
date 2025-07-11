<?php
// Scan audio and music folders for files
function getAudioFiles($folder) {
	$files = [];
	if (is_dir($folder)) {
		$items = scandir($folder);
		foreach ($items as $item) {
			if ($item === '.' || $item === '..') continue;
			
			$filePath = $folder . '/' . $item;
			if (is_file($filePath)) {
				$extension = strtolower(pathinfo($item, PATHINFO_EXTENSION));
				$audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'];
				
				if (in_array($extension, $audioExtensions)) {
					$files[] = $item;
				}
			}
		}
	}
	return $files;
}

$audioFiles = getAudioFiles('_audio');
$musicFiles = getAudioFiles('_music');
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover, minimal-ui">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
	<meta name="apple-mobile-web-app-title" content="Listen">
	<meta name="mobile-web-app-capable" content="yes">
	<meta name="theme-color" content="#000000">
	<meta name="format-detection" content="telephone=no">
	<meta name="msapplication-tap-highlight" content="no">
	<title>Listen</title>
	<link rel="manifest" href="manifest.json">
	<link rel="apple-touch-icon" href="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTkyIiByeD0iMjQiIGZpbGw9IiMwMDAwMDAiLz4KPHBhdGggZD0iTTk2IDQ4QzY5LjQ5IDQ4IDQ4IDY5LjQ5IDQ4IDk2QzQ4IDEyMi41MSA2OS40OSAxNDQgOTYgMTQ0QzEyMi41MSAxNDQgMTQ0IDEyMi41MSAxNDQgOTZDMTQ0IDY5LjQ5IDEyMi41MSA0OCA5NiA0OFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik05NiA2NEM3Ny4xNyA2NCA2NCA3Ny4xNyA2NCA5NkM2NCAxMTQuODMgNzcuMTcgMTI4IDk2IDEyOEMxMTQuODMgMTI4IDEyOCAxMTQuODMgMTI4IDk2QzEyOCA3Ny4xNyAxMTQuODMgNjQgOTYgNjRaIiBmaWxsPSIjMDAwMDAwIi8+CjxwYXRoIGQ9Ik04MCA4OFYxMDRIMTEyVjg4SDgwWiIgZmlsbD0iIzAwMDAwMCIvPgo8L3N2Zz4K">
	<link rel="stylesheet" href="style.css">
	<style>
		/* Force mobile viewport height */
		html, body {
			height: 100vh !important;
			height: calc(var(--vh, 1vh) * 100) !important;
			overflow: hidden !important;
		}
		
		#player-container {
			height: 100vh !important;
			height: calc(var(--vh, 1vh) * 100) !important;
			min-height: 100vh !important;
			min-height: calc(var(--vh, 1vh) * 100) !important;
		}
		
		/* Ensure controls are visible */
		#controls {
			position: fixed !important;
			bottom: 0 !important;
			left: 0 !important;
			right: 0 !important;
			z-index: 1000 !important;
			background: rgba(0, 0, 0, 0.8) !important;
		}
		
		/* Adjust main area to not overlap controls */
		#main-player-area {
			padding-bottom: 120px !important;
			min-height: 0 !important;
			flex: 1 !important;
		}
		
		/* Mobile-specific adjustments */
		@media (max-width: 768px) {
			#main-player-area {
				padding-bottom: 140px !important;
			}
		}
	</style>
</head>
<body>
	<div id="player-container">
		<!-- Top controls - Music and volume -->
		<div id="top-controls">
			<div id="music-controls">
				<button id="music-files-btn" class="control-btn">Music</button>
				<button id="music-control-btn" class="control-btn" disabled>▶</button>
				<div class="volume-group">
					<input type="range" id="music-volume" class="volume-slider" min="0" max="100" value="100">
				</div>
			</div>
		</div>

		<!-- Main player area - tap to pause/resume -->
		<div id="main-player-area">
			<div id="current-track-info">
				<h2 id="track-title">No track selected</h2>
				<p id="track-duration">00:00 / 00:00</p>
			</div>
		</div>

		<!-- Bottom controls - Audio -->
		<div id="controls">
			<div id="scrubber-container">
				<div id="time-display">
					<span id="current-time">00:00</span>
					<span id="total-time">00:00</span>
				</div>
				<div id="scrubber-bar">
					<div id="scrubber-progress"></div>
					<div id="scrubber-handle"></div>
				</div>
			</div>

			<div id="control-buttons">
				<button id="audio-files-btn" class="control-btn">Load Audio</button>
				<button id="back-10-btn" class="control-btn" disabled>< 10s</button>
				<button id="play-pause-btn" class="control-btn" disabled>▶</button>
				<button id="forward-10-btn" class="control-btn" disabled>10s ></button>
				<div class="volume-group">
					<input type="range" id="audio-volume" class="volume-slider" min="0" max="100" value="100">
				</div>
			</div>
		</div>
	</div>

	<!-- File selection modals -->
	<div id="audio-files-modal" class="modal">
		<div class="modal-content">
			<div class="modal-header">
				<h3>Select Audio File</h3>
				<button class="close-btn">&times;</button>
			</div>
			<div class="modal-body">
				<div id="audio-files-list"></div>
			</div>
		</div>
	</div>

	<div id="music-files-modal" class="modal">
		<div class="modal-content">
			<div class="modal-header">
				<h3>Select Music File</h3>
				<button class="close-btn">&times;</button>
			</div>
			<div class="modal-body">
				<div id="music-files-list"></div>
			</div>
		</div>
	</div>

	<!-- Hidden audio elements -->
	<audio id="audio-player" preload="metadata"></audio>
	<audio id="music-player" preload="metadata"></audio>

	<script src="jquery.min.js"></script>
	<script>
		// Pass PHP data to JavaScript
		window.audioFiles = <?php echo json_encode($audioFiles); ?>;
		window.musicFiles = <?php echo json_encode($musicFiles); ?>;
	</script>
	<script src="main.min.js"></script>
</body>
</html>
