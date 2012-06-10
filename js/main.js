 var TabRoll = TabRoll || {};
 TabRoll.model = TabRoll.model || {};
 TabRoll.view = TabRoll.view || {};
 TabRoll.controller = TabRoll.controller || {};

 $(document).ready(function() {
 	TabRoll.model.Note = function (value, stringNum, ticks) {
 		this.value = value;
 		this.stringNum = stringNum;
 		this.ticks = ticks;
 	};

 	TabRoll.model.Measure = function (measureId, ticks, noteDict) {
 		this.measureId = measureId;
 		this.ticks = ticks;
 		this.noteDict = noteDict;

 	this.noteFromStringNumberAndTickPosition = function (stringNumber, tickPosition) {
		if (!this.noteDict) {
			return null;
		}
		if (!this.noteDict[tickPosition]) {
			return null;
		}
		return this.noteDict[tickPosition][stringNumber];
		};
 	};

	TabRoll.model.measures = [];

	TabRoll.controller.populateStaffSpan = function (staffSpan) {
		// TODO: move into view method
		// the signature at the head of each line
		$.each(['e', 'b', 'g', 'D', 'A', 'E'], function(i, val) {
			staffSpan.find('.signature').append('<span class="stringName">' + val + ' :|</span>');
			staffSpan.find('.measure').append('<span class="string">');
		});
		staffSpan.find('.signature').append('<span class="stringName">4/4|</span>');
		// the beat markers
		$.each(['1', '2', '3', '4'], function(i, val) {
			staffSpan.find('.measure').append('<span class="beatCount quarter">'+ val + '</span>');
			staffSpan.find('.measure').append('<span class="beatCount">&nbsp;</span>');
			staffSpan.find('.measure').append('<span class="beatCount sixteenth">e</span>');
			staffSpan.find('.measure').append('<span class="beatCount">&nbsp;</span>');
			staffSpan.find('.measure').append('<span class="beatCount eighth">+</span>');
			staffSpan.find('.measure').append('<span class="beatCount">&nbsp;</span>');
			staffSpan.find('.measure').append('<span class="beatCount sixteenth">a</span>');
			staffSpan.find('.measure').append('<span class="beatCount">&nbsp;</span>');
		});
		// the individual editable ticks that comprise a measure
		staffSpan.find('.string').each(function () {
			for (var i = 0; i < 32; ++i) {
				var clazz = 'editable';
				if (i % 8 == 0) {
					clazz += ' quarter'; 
				} else if (i % 4 == 0) {
					clazz += ' eighth';
				} else if (i % 2 == 0) {
					clazz += ' sixteenth';
				}
				$(this).append('<span class="'+ clazz + '">-</span>');
			}
			$(this).append('|</span>');
		});

		staffSpan.find('.editable').mouseenter(function () {
			$(this).addClass('highlighted');
		});

		staffSpan.find('.editable').mouseleave(function () {
			$(this).removeClass('highlighted');
		});

		staffSpan.find('.editable').click(function () {
			window.clearTimeout();
			$('.selected').removeClass('selected');
			$(this).addClass('selected');
			this.textContent = '-';
		});

		staffSpan.find('.addStaffBtn').click(function () {
			var previousMeasure = $(this).siblings('.measure').last();
			var measureId = previousMeasure.attr('id').split('-')[1];
			
			// TODO: move to controller (didAddMeasuresAfterMeasureId...)
			TabRoll.model.measures.splice(measureId, 0, new TabRoll.model.Measure(measureId, 32, {}));
			TabRoll.model.measures.splice(measureId, 0, new TabRoll.model.Measure(measureId, 32, {}));

			var existingStaffSpan = $(this).parent('.staff').after('<span class="staff"><span class="signature"></span><span id="measure-2" class="measure"></span><span id="measure-3" class="measure"></span><br><button class="addStaffBtn">+</button></span><br>');
			TabRoll.controller.populateStaffSpan(existingStaffSpan.next('.staff'));
			TabRoll.controller.updateMeasureIds();
		});
	};

 	TabRoll.controller.setupNewTabRoll = function () {
		TabRoll.model.measures.push(new TabRoll.model.Measure(0, 32, {}));
		TabRoll.model.measures.push(new TabRoll.model.Measure(1, 32, {}));
		TabRoll.controller.populateStaffSpan($('.staff'));

		$(document).keyup(function (e) {
			var highlighted = $('.highlighted');
			if (!highlighted.hasClass('edited')) {
				return;
			}
			// arrow left
			if (e.keyCode == 37) {
				TabRoll.controller.reduceDuration(highlighted);
			}
			// arrow right
			if (e.keyCode == 39) {
				TabRoll.controller.extendDuration(highlighted);
			}
		});
	};

	TabRoll.controller.updateMeasureIds = function () {
		$('.measure').each(function (i, element) {
			$(element).attr('id', 'measure-' + i);
		});
		for (var i = 0; i < TabRoll.model.measures.length; ++i) {
			TabRoll.model.measures[i].measureId = i;
		}
	};

	TabRoll.controller.workingNoteDuration = 8;

	TabRoll.controller.reduceDuration = function(tickSpan) {
		var note = TabRoll.controller.noteFromTickSpan(tickSpan);
		if (note.ticks < 2) {
			return;
		}
		note.ticks -= 1;
		TabRoll.controller.workingNoteDuration = note.ticks;

		var measure = TabRoll.controller.measureFromTickSpan(tickSpan);
		TabRoll.view.redrawMeasureId(measure.measureId);
	};

	TabRoll.controller.extendDuration = function(tickSpan) {
		var note = TabRoll.controller.noteFromTickSpan(tickSpan);
		note.ticks += 1;
		TabRoll.controller.workingNoteDuration = note.ticks;

		var measure = TabRoll.controller.measureFromTickSpan(tickSpan);
		TabRoll.view.redrawMeasureId(measure.measureId);
	};

	TabRoll.controller.addNoteToMeasure = function(note, measure, tickPosition) {
		if (!measure.noteDict[tickPosition]) {
			measure.noteDict[tickPosition] = [];
		}
		measure.noteDict[tickPosition][note.stringNum] = note;
		TabRoll.view.redrawMeasureId(measure.measureId);
	};

	TabRoll.controller.deleteNoteAtTickSpan = function(tickSpan) {
		var measure = TabRoll.controller.measureFromTickSpan(tickSpan);
		var stringNum = TabRoll.controller.stringNumberFromTickSpan(tickSpan);
		var tickPosition = TabRoll.controller.tickPositionFromTickSpan(tickSpan);
		
		measure.noteDict[tickPosition][stringNum] = null;
		TabRoll.view.redrawMeasureId(measure.measureId);
	};

	TabRoll.controller.noteFromTickSpan = function (tickSpan) {
		var stringNum = TabRoll.controller.stringNumberFromTickSpan(tickSpan);
		var tickPosition = TabRoll.controller.tickPositionFromTickSpan(tickSpan);
		var measure = TabRoll.controller.measureFromTickSpan(tickSpan);

		return measure.noteFromStringNumberAndTickPosition(stringNum, tickPosition);
	};

	TabRoll.controller.measureFromTickSpan = function (tickSpan) {
			var stringView = tickSpan.parent();
			var measureView = stringView.parent(); 
			var measureId = measureView.attr('id').split('-')[1];
			return TabRoll.model.measures[measureId];
	};

	TabRoll.controller.stringNumberFromTickSpan = function (tickSpan) {
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

	TabRoll.controller.tickPositionFromTickSpan = function (tickSpan) {
		var stringView = tickSpan.parent();

		position = -1;
		stringView.find('.editable').each(function (tickPosition, element) {
			if ($(element).is(tickSpan)) {
				position = tickPosition;
			}	
		});
		return position;
	};

	TabRoll.view.updateDurationIndicators = function(noteStartSpan) {
		var durationIndicators = noteStartSpan.nextUntil('.editable:not(.duration):not(.edited)');

		var i = 50.0;
		durationIndicators.each(function () {
			$(this).fadeTo(.2, i / 50.0);
			i -= i / 10;
		});
	};
	
	TabRoll.view.redrawMeasureId = function(measureId) {
		var redrawMeasureId_ = function(measureId) {
			var measure = TabRoll.model.measures[measureId];

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
				tick = parseInt(tick); //groan
				if (!notes) {
					return false;
				}
				$.each(notes, function (i, note) {
					if (note) {
						var strings = measureView.find('.string');
						var ticks = $(strings[note.stringNum]).find('.editable');
						var noteStartTick = $(ticks[tick]);

						noteStartTick.removeClass('duration').addClass('edited').text(note.value);
						var durationTicks = TabRoll.view.durationTicksForStartingNoteTick(noteStartTick);	

						$.each(durationTicks, function (i, currentTick) {
							if (!currentTick.hasClass('edited')) {
								currentTick.addClass('duration').text('*');
							}
						});
						TabRoll.view.updateDurationIndicators(noteStartTick);
					}
				});
			});
		};

		for (var i = TabRoll.model.measures.length - 1; i >= 0; i--) {
			var measure = TabRoll.model.measures[i];
			redrawMeasureId_(measure.measureId);
		}
	};

	TabRoll.view.durationTicksForStartingNoteTick = function (tickSpan) {
		var measure = TabRoll.controller.measureFromTickSpan(tickSpan);
		var tickPosition = TabRoll.controller.tickPositionFromTickSpan(tickSpan);
		var note = TabRoll.controller.noteFromTickSpan(tickSpan);

		durationTicks = [];
		while (durationTicks.length < note.ticks - 1) {
			tickPosition += 1;
			if (tickPosition >= measure.ticks) {
				measure = TabRoll.model.measures[measure.measureId + 1];
				if (!measure) {
					break;
				}
				tickPosition = 0;
			}
			var measureView = $('#measure-' + measure.measureId);
			var strings = measureView.find('.string');
			var ticks = $(strings[note.stringNum]).find('.editable');
			durationTicks.push($(ticks[tickPosition]));
		}

		return durationTicks;
	};

	$(document).keypress(function (e) {
		// x
		if (e.which == 120 && $('.highlighted')) {
			TabRoll.controller.deleteNoteAtTickSpan($('.highlighted'));
		}

		if (e.which < 47 || e.which > 58) {
			return;
		}

		$('.selected').each(function (i, element) {
			var selected = $(element);
			var currentText = selected.text();
			if (currentText == '1' || currentText == '2') {
				currentText += e.which - 48;	
			} else {
				currentText = e.which - 48;
			}

			var stringNum = TabRoll.controller.stringNumberFromTickSpan(selected);
			var note = new TabRoll.model.Note(currentText, stringNum, TabRoll.controller.workingNoteDuration);

			var measure = TabRoll.controller.measureFromTickSpan(selected);
			var tickPosition = TabRoll.controller.tickPositionFromTickSpan(selected);
			
			TabRoll.controller.addNoteToMeasure(note, measure, tickPosition);
		});

		window.setTimeout(function () {
			$('.selected').removeClass('selected');
		}, 200);
	});

	// kick off
	TabRoll.controller.setupNewTabRoll();
});
