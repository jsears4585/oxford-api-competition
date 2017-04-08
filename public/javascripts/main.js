/*global $*/


$(function() {
    
    var count = 0;
    var max_choices = 14;
    var destination;
    
    var is_correctAnswer = function() {
        $('#results').empty();
        $('#choices_remaining').empty();
        $('#path').append("<h4><span class='again'>" + destination + "</span></h4>");
        $('#goal_word').empty().append("<h1>Success! You completed your journey with " + count + " choices.</h1>");
    };

    var buttonAppend = function(senses) {
        $('#results').empty();
        var arr = [];
        senses.forEach(function(sense) {
            sense['synonyms'].forEach(function(x) {
               var button = '<button class="new_word" data-word="' + x.id + '">' + x.text + '</button>';
               //$('#results').append(button); 
               arr.push(button);
            });
            if (sense['subsenses']) {
                sense['subsenses'].forEach(function(n) {
                    n.synonyms.forEach(function(z) {
                        var button = '<button class="new_word" data-word="' + z.id + '">' + z.text + '</button>';
                        //$('#results').append(button); 
                        arr.push(button);
                    });
                });    
            }
        });
        arr.sort(function(a, b) {
            return a.localeCompare(b);
        });
        var unique_arr = arr.filter((v, i, a) => a.indexOf(v) === i );
        unique_arr.forEach(function(uni) {
            $('#results').append(uni);
        });
        bindClickEvent();
    };

    var checkAttempts =function() {
        if (count >= max_choices) {
            $('#results').empty().append("<div id='whisper'>Your journey has come to an end,<br> would you like to begin <span class='again'>again?</span></div");
            $('.octocat').fadeIn("slow");
            $('.again').on('click', function(e) {
                $('#choices_remaining').empty(); // stack these?
                $('#results').empty();
                $('#goal_word').empty();
                $('#path').empty();
                $('#search').show().val("");
                $('#octocat').hide();
                count = 0;
            });
        }  
    };

    var bindClickEvent = function() {
        $('.new_word').on('click', function(e) {
            var $self = $(this);
            var parameters = { search: $(this).attr("data-word") };
            if ($(this).attr("data-word") === destination) {
                is_correctAnswer();
                return;
            }
            $.get( '/lookup', parameters, function(data) {
                try {
                    var data_parsed = JSON.parse(data);
                    count++;
                    $('#path').append("<h4><a href='https://en.oxforddictionaries.com/definition/" + $self[0].innerHTML + "' target='_blank'>" + count + ". " + $self[0].innerHTML + "</a></h4>");
                    var senses = data_parsed.results[0].lexicalEntries[0].entries[0].senses;
                    buttonAppend(senses);
                    checkAttempts();
                    $('#choices_remaining').empty().append("<h1>Choices remaining:  " + (max_choices - count) + "</h1>");
                } catch(e) {
                    $self.hide('slow', function() {
                       $self.remove(); 
                    });
                }
            });
        });
    };
    
    $('#search').on('keyup', function(e) {
        if(e.keyCode === 13) {
            var $self_val = $(this).val();
            var parameters = { search: $self_val };
            $.get( '/lookup', parameters, function(data) {
                try {
                    var data_parsed = JSON.parse(data);
                    var senses = data_parsed.results[0].lexicalEntries[0].entries[0].senses;
                    var ant = senses[0]['antonyms'][0].text;
                    if (ant) {
                        var len = ant.length;
                        var use = ant;
                        senses[0]['antonyms'].forEach(function(q) {
                            if (q.text.length < len) {
                                len = q.text.length;
                                use = q.text;   
                            }
                        });
                        destination = use;
                        $('#goal_word').append("<h1>Your goal word for this round is:  <span class='again'>" + use + "</span></h1>");   
                    } else {
                        $('#results').empty();
                        return;
                    }
                    $('#path').append("<h1>" + $self_val + "</h1>");
                    buttonAppend(senses);
                    $('#search').hide();
                } catch(e) {
                    alert("Try another word!");
                    $('#search').val("");
                }
            });
        }
    });
    
});

