var data;
var words;

$(document).ready(function() {
	$.getJSON('/static/js/word_parameters.json', function(data) {loadData(data);})
});

function loadData(d) {
	data = d;
	words = Object.keys(data);
}

current_word = 0;

var procword = function process_word() {
	if (current_word >= words.length) {
		console.log('all done');
		return;
	}
	info = new FormData();
	info.append('userid', '');
	info.append('filename', words[current_word] + '.wav');
	params = data[words[current_word]];
	impulse(params, info);
	console.log(words[current_word]);
	current_word++;
}
