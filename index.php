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

$audioFiles = getAudioFiles('audio');
$musicFiles = getAudioFiles('music');
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Listen</title>
	<link rel="stylesheet" href="style.css">
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
				<button id="back-15-btn" class="control-btn" disabled>< 15s</button>
				<button id="play-pause-btn" class="control-btn" disabled>▶</button>
				<button id="forward-15-btn" class="control-btn" disabled>15s ></button>
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
