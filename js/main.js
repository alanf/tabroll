 $(document).ready(function() {
	$.each(['e', 'b', 'g', 'D', 'A', 'E'], function(i, val) {
		var row = $('.foo3').append(val + ' :|');
		for (var i = 0; i < 32; ++i) {
			$(row).append('<span class="editable">-</span>');
		}
		$(row).append('|<br>');
	});

	$('.editable').mouseenter(function (){
		this.textContent = '?';
	});
});
