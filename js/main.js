 $(document).ready(function() {
	$.each(['e', 'b', 'g', 'D', 'A', 'E'], function(i, val) {
		var row = $('.staff').append(val + ' :|');
		for (var i = 0; i < 32; ++i) {
			$(row).append('<span class="editable">-</span>');
		}
		$(row).append('|<br>');
	});

	$('.editable').mouseenter(function (){
		$(this).addClass('highlighted');
	});

	$('.editable').mouseleave(function (){
		$(this).removeClass('highlighted');
	});

	$('.editable').click(function (){
		$('.selected').removeClass('selected');
		$(this).addClass('selected');
		this.textContent = '-';
	});

	$(document).keypress(function (e) {
		$('.selected').each(function () {
			this.textContent = e.which - 48;
		});

		$('.selected').removeClass('selected');
	});
});
