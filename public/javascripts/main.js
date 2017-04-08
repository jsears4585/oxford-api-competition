/*global $*/

/*

To Do

CSS fixes

1. Game Logic
    - add try again logic
    - init game object with defaults
2. More Fun
    - cool animations?
4. Allow users to share their journey
    - Twitter oAuth?
    - Share journey at any point?
5. Errors
    - handle error if no words are left
    - allow person to move backwards in their list?
6. Education
    - add links to oxforddictionaries in list?
    - add senses to break up the buttons?
        - possible strategy add
7. Options
    - allow ninja to select length of journey?
8. Database
    - write words to db that don't parse
        - clean them from future outputs?
9. Off the wall
    - accompaniment to final blurb
        - mad libs?
        - procedural poetry?
10. API
    - dive back into the API and see what else we've got
        - can we do something with parts of speech?
        - synonyms?
        - definitions?
        
*/

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
        senses.forEach(function(sense) {
            sense['synonyms'].forEach(function(x) {
               var button = '<button class="new_word" data-word="' + x.id + '">' + x.text + '</button>';
               $('#results').append(button); 
            });
            if (sense['subsenses']) {
                sense['subsenses'].forEach(function(n) {
                    n.synonyms.forEach(function(z) {
                        var button = '<button class="new_word" data-word="' + z.id + '">' + z.text + '</button>';
                        $('#results').append(button); 
                    });
                });    
            }
        });
        bindClickEvent();
    };

    var checkAttempts =function() {
        if (count >= max_choices) {
            $('#results').empty().append("<div id='whisper'>Your journey has come to an end,<br> would you like to begin <span class='again'>again?</span></div");
            $('.octocat').fadeIn("slow");
            $('#choices_remaining').empty();
            return;
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
                    $('#path').append("<h1>" + $self_val + "</h1>");
                    var senses = data_parsed.results[0].lexicalEntries[0].entries[0].senses;
                    buttonAppend(senses);
                    $('#search').remove();
                    var ant = senses[0]['antonyms'][0].id;
                    destination = ant;
                    if (ant) {
                        $('#goal_word').append("<h1>Your goal word for this round is:  <span class='again'>" + ant + "</span></h1>");   
                    } else {
                        return;
                    }
                } catch(e) {
                    alert("Try another word!");
                    $('#search').val("");
                }
            });
        }
    });
    
});

