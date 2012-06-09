 var TabRoll = TabRoll || {};

 $(document).ready(function() {
 	TabRoll.Note = function (value, stringNum, ticks) {
 		this.value = value;
 		this.stringNum = stringNum;
 		this.ticks = ticks;
 	};

 	TabRoll.Measure = function (measureId, ticks, noteDict) {
 		this.measureId = measureId;
 		this.ticks = ticks;
 		this.noteDict = noteDict;
 	};

	TabRoll.measures = [];

 	TabRoll.setupNewTabRoll = function () {
		$('.measure').each(function (i, val) {
			TabRoll.measures.push(new TabRoll.Measure(i, 32, {}));
		});

		$.each(['e', 'b', 'g', 'D', 'A', 'E'], function(i, val) {
			$('.signature').append('<span class="stringName">' + val + ' :|</span>');
			$('.measure').append('<span class="string">');
		});
		$('.signature').append('<span class="stringName">c :|</span>');
		$.each(['1', '2', '3', '4'], function(i, val) {
			$('.measure').append('<span class="beatCount">'+ val + '</span>');
			$('.measure').append('<span class="beatCount"> </span>');
			$('.measure').append('<span class="beatCount">e</span>');
			$('.measure').append('<span class="beatCount"> </span>');
			$('.measure').append('<span class="beatCount">+</span>');
			$('.measure').append('<span class="beatCount"> </span>');
			$('.measure').append('<span class="beatCount">a</span>');
			$('.measure').append('<span class="beatCount"> </span>');
		});

		$('.string').each(function () {
			for (var i = 0; i < 32; ++i) {
				$(this).append('<span class="editable">-</span>');
			}
			$(this).append('|</span>');
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

		$(document).keyup(function (e) {
			var highlighted = $('.highlighted');
			if (!highlighted.hasClass('edited')) {
				return;
			}
			// arrow left
			if (e.keyCode == 37) {
				TabRoll.reduceDuration();
			}
			// arrow right
			if (e.keyCode == 39) {
				TabRoll.extendDuration();
			}
			// backspace
			if (e.keyCode == 8) {
				TabRoll.deleteNoteAtTickSpan(highlighted);
			}
		});
	};

	TabRoll.updateDurationIndicators = function() {
		var durationIndicators = $('.highlighted').nextUntil('.editable:not(.duration):not(.edited)');
		var i = 15;
		durationIndicators.each(function () {
			$(this).fadeTo(.2, i / 15.0);
			i -= 1;
		});
	};
	
	TabRoll.reduceDuration = function() {
		var durationIndicators = $('.highlighted').nextUntil('.editable:not(.duration)');
		var toRemove = durationIndicators.last();
		toRemove.removeClass('duration').removeClass('edited').text('-').fadeTo(.2, .6);

		TabRoll.updateDurationIndicators();
	}

	TabRoll.extendDuration = function() {
		var durationIndicators = $('.highlighted').nextUntil('.editable:not(.duration)');
		var nextIndicator = durationIndicators.last().next();
		nextIndicator.addClass('duration').text('*');

		TabRoll.updateDurationIndicators();
	};

	TabRoll.redrawMeasure = function(measureId) {
		var measure = TabRoll.measures[measureId];

		// reset view
		var measureView = $('#measure-' + measureId);
		measureView.find('.edited').each(function () {
			$(this).removeClass('edited').text('-').removeAttr('style');
		});
		measureView.find('.duration').each(function () {
			$(this).removeClass('duration').text('-').removeAttr('style');
		});

		// add notes back
		$.each(measure.noteDict, function (tick, notes) {
			if (!notes) {
				return false;
			}
			$.each(notes, function (i, note) {
				if (note) {
					var strings = measureView.find('.string');
					var ticks = $(strings[note.stringNum]).find('.editable');
					var noteStartTick = $(ticks[tick]);
					noteStartTick.removeClass('duration').addClass('edited').text(note.value);

					var nextTick = noteStartTick.next('span');
					for (var i = 0; i < note.ticks; ++i) {
						if (nextTick.hasClass('editable')) {
							nextTick.addClass('duration').text('*');
							nextTick = nextTick.next('span');
						}
					}
					TabRoll.updateDurationIndicators();
				}
			});
		});
	}
	
	TabRoll.addNoteToMeasure = function(note, measureId, tickPosition) {
		var measure = TabRoll.measures[measureId];
		if (!measure.noteDict[tickPosition]) {
			measure.noteDict[tickPosition] = [];
		}
		measure.noteDict[tickPosition][note.stringNum] = note;
		TabRoll.redrawMeasure(measureId);
	};

	TabRoll.deleteNoteAtTickSpan = function(tickSpan) {
		var measureId = TabRoll.measureIdFromTickSpan(tickSpan);
		var stringNum = TabRoll.stringNumberForTickSpan(tickSpan);
		var tickPosition = TabRoll.tickPositionForTickSpan(tickSpan);
		var measure = TabRoll.measures[measureId];
		
		measure.noteDict[tickPosition][stringNum] = null;
		TabRoll.redrawMeasure(measureId);
	};

	TabRoll.measureIdFromTickSpan = function (tickSpan) {
			var stringView = tickSpan.parent();
			var measureView = stringView.parent(); 
			var measureId = measureView.attr('id').split('-')[1];
			return measureId;
	};

	TabRoll.stringNumberForTickSpan = function (tickSpan) {
		var stringView = tickSpan.parent();
		var measureView = stringView.parent(); 

		var stringNum = -1;
		measureView.find('.string').each(function (num, element) {
			if ($(element).is(stringView)) {
				stringNum = num;
			}	
		});	
		return stringNum;
	};

	TabRoll.tickPositionForTickSpan = function (tickSpan) {
		var stringView = tickSpan.parent();

		position = -1;
		stringView.find('.editable').each(function (tickPosition, element) {
			if ($(element).is(tickSpan)) {
				position = tickPosition;
			}	
		});
		return position;
	};

	$(document).keypress(function (e) {
		$('.selected').each(function (i, element) {
			var selected = $(element);

			var stringNum = TabRoll.stringNumberForTickSpan(selected);
			var note = new TabRoll.Note(e.which - 48, stringNum, 4);

			var measureId = TabRoll.measureIdFromTickSpan(selected);
			var tickPosition = TabRoll.tickPositionForTickSpan(selected);
			
			TabRoll.addNoteToMeasure(note, measureId, tickPosition);
		});

		$('.selected').removeClass('selected');
	});

	// kick off
	TabRoll.setupNewTabRoll();
});
