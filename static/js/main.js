var context;
var analyser;
var reverberator;
var music = {playing: false}
var buffers;
var ctx;
var chart;
var words;
var smoothed_fft;
var epochs;
	
var freqs = [20, 50, 83, 120, 161, 208, 259, 318, 383, 455, 537, 628, 729, 843, 971, 1114, 1273, 1452, 1652, 1875, 2126, 2406, 2719, 3070, 3462, 3901, 4392, 4941, 5556, 6244, 7014, 7875, 8839, 9917, 11124, 12474, 13984, 15675, 17566, 19682];

function closest (num, arr) {
	var mid;
	var lo = 0;
	var hi = arr.length - 1;
	while (hi - lo > 1) {
		mid = Math.floor ((lo + hi) / 2);
		if (arr[mid] < num) {
			lo = mid;
		} else {
			hi = mid;
		}
	}
	if (num - arr[lo] <= arr[hi] - num) {
		return lo;
	}
	return hi;
}

$(document).ready(function() {
	audiofile = ["/static/audio/ASB_clip.mp3"]
	context = new AudioContext();
	analyser = context.createAnalyser();
	analyser.fftSize = 2048;
	smoothed_fft = new Float32Array(analyser.frequencyBinCount);
	epochs = 0;
	analysis_frequencies = []
	for (i = 0; i < analyser.frequencyBinCount; i++) {
		analysis_frequencies.push(i*context.sampleRate/analyser.frequencyBinCount);
	}

	comparison_indices = []
	for (i in freqs) {
		comparison_indices.push(closest(freqs[i], analysis_frequencies));
	}

	$.getJSON("static/js/eq_word_parameters.json", function(res) {
		words = res;
	});

	ctx = document.getElementById("viz").getContext("2d");

	bufferloader = new BufferLoader (
		context,
		audiofile,
		finished
	);
	bufferloader.load()

	function finished(bufferlist) {
		buffers = bufferlist.slice(0);
	}
});

function createsource(buffer, loop) {
	var source = context.createBufferSource();
	source.buffer = buffer;
	source.loop = loop;
	return source;
}

music.toggle = function(loop) {
	this.playing ? this.stop() : this.play();
	this.playing = !this.playing;
}

music.stop = function() {
	if (!this.audio.stop) {
		this.audio.noteOff(0);
	} else {
		this.audio.stop(0);
	}
}

music.play = function() {
	this.audio = createsource(buffers[0], true);
	this.audio.connect(analyser);
	analyser.connect(context.destination);
	if (!this.audio.start) {
		this.audio.noteOn(0);
	} else {
		this.audio.start(0);
	}
	setInterval(analyse, 250);
}

function analyse() {
	var fft_data = new Float32Array(analyser.frequencyBinCount);
	analyser.getFloatFrequencyData(fft_data);
	for (i in fft_data) {
		smoothed_fft[i] += fft_data[i];
	}
	input_curve = []
	for (i in comparison_indices) {
		input_curve.push(smoothed_fft[comparison_indices[i]]);
	}
	$("#description").text(words[find_closest_eq(input_curve)]['word']);
	epochs += 1;
	if (epochs % 3 == 0) {
		for (i in smoothed_fft) {
			smoothed_fft[i] = 0;
		}
	}
}

var random = false;

function find_closest_eq(e) {
	var closest = 0;
	var max_correlation = -Infinity;
	var current_correlation;

	for (w in words) {
		if (words[w]['lang'] == "English") {
			current_correlation = ss.sample_correlation(e, words[w]['settings'])
			if (current_correlation > max_correlation) {
				closest = w;
				max_correlation = current_correlation;
			}
		}
	}
	if (random) {
		return Math.floor(Math.random() * (words.length + 1))
	}
	return closest;
}

