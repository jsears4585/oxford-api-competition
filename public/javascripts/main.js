/*global $*/

/*

To Do

1. Game Logic
    - introduce endwords
        - provide suggestions with antonyms?
    - steps remaining counter?
    - init game object with defaults
2. More Fun
    - cool animations?
3. Look and Feel
    - new fonts, something with more flair
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
    
    var rmvUnderscores = function(word) {
        var clean_str = "";
        var match_pattern = word.match(/_/gi);
        if (match_pattern) {
            clean_str = word.replace(/_/gi, " ");
            clean_str = '"' + clean_str + '"';
        } else {
            clean_str = word;
        }
        return clean_str;
    };

    var buttonAppend = function(senses) {
        $('#results').empty();
        senses.forEach(function(sense) {
            sense['synonyms'].forEach(function(x) {
               var id = x['id'];
               var new_id = decodeURIComponent(id);
               new_id = rmvUnderscores(new_id);
               var button = '<button class="new_word" data-word="' + id + '">' + new_id + '</button>';
               $('#results').append(button); 
            });
        });
        bindClickEvent();
    };

    var checkAttempts =function() {
        if (count >= 7) {
            $('#results').empty().append("<div id='whisper'>Your journey has come to an end,<br> would you like to begin <span class='again'>again?</span></div");
            $('.octocat').fadeIn("slow");
            return;
        }  
    };

    var bindClickEvent = function() {
        $('.new_word').on('click', function(e) {
            var $self = $(this);
            var parameters = { search: $(this).attr("data-word") };
            $.get( '/lookup', parameters, function(data) {
                try {
                    var data_parsed = JSON.parse(data);
                    count++;
                    $('#path').append("<h4><a href='https://en.oxforddictionaries.com/definition/" + $self[0].innerHTML + "' target='_blank'>" + count + ". " + $self[0].innerHTML + "</a></h4>");
                    var senses = data_parsed.results[0].lexicalEntries[0].entries[0].senses;
                    buttonAppend(senses);
                    checkAttempts();
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
                    $('#left-div').css("margin-top", "10px");
                } catch(e) {
                    alert("Try another word!");
                    $('#search').val("");
                }
            });
        }
    });
    
});

