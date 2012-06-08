 $(document).ready(function() {
	$.each(['e', 'b', 'g', 'D', 'A', 'E'], function(i, val) {
		var row = $('.staff').append(val + ' :|');
		for (var i = 0; i < 32; ++i) {
			$(row).append('<span class="editable">-</span>');
		}
		$(row).append('|<br>');
	});

	$('.editable').mouseenter(function () {
		$(this).addClass('highlighted');
	});

	$('.editable').mouseleave(function () {
		$(this).removeClass('highlighted');
	});

	$('.editable').click(function () {
		$('.selected').removeClass('selected');
		$(this).addClass('selected');
		this.textContent = '-';
	});

	var updateDurationIndicators = function() {
		var durationIndicators = $('.highlighted').nextUntil('.editable:not(.duration)');
		var i = 15;
		durationIndicators.each(function () {
			$(this).fadeTo(.2, i / 15.0);
			i -= 1;
		});
	};
	
	var reduceDuration = function() {
		var durationIndicators = $('.highlighted').nextUntil('.editable:not(.duration)');
		var toRemove = durationIndicators.last();
		toRemove.removeClass('duration');
		toRemove.removeClass('edited');
		toRemove.text('-');
		toRemove.fadeTo(.2, .6);

		updateDurationIndicators();
	}

	var extendDuration = function() {
		var durationIndicators = $('.highlighted').nextUntil('.editable:not(.duration)');
		var nextIndicator = durationIndicators.last().next();
		nextIndicator.addClass('duration');
		nextIndicator.text('*');

		updateDurationIndicators();
	};

	var deleteNote = function() {
		var durationIndicators = $('.highlighted').nextUntil('.editable:not(.duration)');
		durationIndicators.each(function () {
			toRemove = $(this);
			toRemove.removeClass('duration');
			toRemove.removeClass('edited');
			toRemove.text('-');
			toRemove.fadeTo(.2, .6);
		});

		$('.highlighted').removeClass('edited').removeClass('highlighted').text('-');
	};

	$(document).keyup(function (e) {
		if (e.keyCode == 37 && $('.highlighted').hasClass('edited')) {
			reduceDuration();
		}

		if (e.keyCode == 39 && $('.highlighted').hasClass('edited')) {
			extendDuration();
		}

		// backspace
		if (e.keyCode == 8 && $('.highlighted').hasClass('edited')) {
			deleteNote();
		}
	});

	$(document).keypress(function (e) {
		$('.selected').each(function () {
			this.textContent = e.which - 48;
			$(this).addClass('edited');
			$(this).removeClass('duration');

			var nextTick = $(this).next('span');
			for (var i = 0; i < 3; ++i) {
				if (nextTick.hasClass('editable')) {
					nextTick.addClass('duration');
					nextTick.text('*');
					nextTick = nextTick.next('span');
				}
			}
			updateDurationIndicators();
		});

		$('.selected').removeClass('selected');
	});
});
