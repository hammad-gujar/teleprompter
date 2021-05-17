

            // to store the text of teleprompter and pointers of the string
            var scriptText = '';
            var scriptArray;
            var scriptLength = 0;
            var windowSize = 5; 
            var currentIndex = 0;
            var windowNumber = 0;
            var windowStartIndex = 0;
            var windowEndIndex = 0;
            var algo = 'JaroDistance';
            var saved = false;

            /*
            * saveScript
            * function display entred text of teleprompter into a paragraph 
            * for find finding similaritie for further steps
            */
            function saveScript(){
                if(saved) {
                    return;
                }
                scriptText = document.getElementById('script').value;
                // algo = document.getElementById('algo').value;

                if(scriptText == '') {
                    alert('Please enter the text first.');
                    return;
                }


                scriptArray = scriptText.split(' ');
                scriptLength = scriptArray.length;

                if(scriptLength < windowSize) {
                    windowSize = scriptLength;
                }
                
                // scriptArray.forEach((word, index) => {                    
                //     var spanElement = document.createElement("SPAN");
                //     spanElement.setAttribute("class", "wordSpan");
                //     spanElement.setAttribute("data", cleanText(word));
                //     spanElement.setAttribute("id", cleanText(word)+index);
                //     spanElement.setAttribute("number", index);

                //     var spanTextElement = document.createTextNode(word);
                //     spanElement.appendChild(spanTextElement);
                //     document.getElementById('script-text').appendChild(spanElement);
                // });

                var paragraph = document.getElementById('scriptTextContainer');
                var paragraphText = '';
                scriptArray.forEach((word, index) => {
                  var cleanedText = cleanText(word) + index;
                  paragraphText += '<span onclick="adjustWindow(' + index + ')" dataIndex = '+index+' class="items" id = ' + cleanedText + '>' + word + '</span> ';
                });
                paragraph.innerHTML = paragraphText;

                addHoverStyle();
                
                saved = true;
            }

            function addHoverStyle() {
                var elems = document.querySelectorAll(".items");
                [].forEach.call(elems, function(target) {

                    target.addEventListener("mouseover",mOver, false);
                    //target.addEventListener("mouseover",function(target){console.log(target); target.classList.add("effect-underline")}(), false);
                    target.addEventListener("mouseout", mOut, false);
                });

            }

            function mOver(event) {
                console.log(event);
                    event.target.classList.add("effect-underline");
            }

            function mOut(event) {  
               //target.setAttribute("style", "background-color:green;")
                    event.target.className = event.target.className.replace(/\beffect-underline\b/, "");
            }


            function reset()
            {                
                var node = document.getElementById("script-text");
                node.innerHTML = '';                
                scriptText = '';
                scriptArray = {};
                scriptLength = 0;
                currentIndex = 0;
                windowNumber = 0;
                windowStartIndex = 0;
                windowEndIndex = 0;
                algo = 'JaroDistance';
                saved = false;
            }

            //Preprocessing of strings before comparison
            function cleanText(str)
            {
                return str.replace(/[^a-zA-Z ]/g, "").toLowerCase();
            }

            /*
            * compareString
            * Compare string returned from trnascription service  
            * with telepromter text.
            */
            function compareString(transcriberWord) {
                console.log('transcriberWord : ', transcriberWord);
                if(scriptText == '') {
                    alert('Save the script first.');
                    return;
                }

                var windowCurrentIndex = 0;
                windowStartIndex = currentIndex;

                // define new window of size k
                if(currentIndex == windowEndIndex) {
                    windowEndIndex += windowSize;
                }
                

                // Loop to match words and iterate over the selected window
                while (currentIndex < windowEndIndex
                        && currentIndex < scriptLength
                        && windowCurrentIndex < windowSize) {
                    var scriptCurrentWord = cleanText(scriptArray[currentIndex]);
                    
                    if(algo == 'LevenshteinDistance') {
                        if(calculateLevenshteinDistance(scriptCurrentWord, transcriberWord) <= 1) {                                
                            movePointers(scriptCurrentWord+currentIndex, windowCurrentIndex);
                            break;
                        }
                    } else if(algo == 'JaroDistance') {                     
                        if(calculateJaroDistance(scriptCurrentWord, transcriberWord) > 0.9) {
                            //fadeOutWord(scriptCurrentWord+currentIndex);
                            addSpokenClass(windowStartIndex, currentIndex);
                            scroll(scriptCurrentWord+currentIndex);
                            movePointers(scriptCurrentWord+currentIndex, windowCurrentIndex);
                            break;
                        }
                    }
                    // If word is not found at an index, move string pointer forward by 1
                    // to compare it with next word in the specified window.
                    currentIndex++;
                }
                // if a transcriber word is not found in whole window,
                // Move string pointer to the start of the window for comparison of next word of transcriber
                // from start of the window.
                if(currentIndex == windowEndIndex) {
                        currentIndex = windowStartIndex;
                }
            }

            function adjustWindow(clickedItem) {
                console.log(clickedItem);
                currentIndex = clickedItem;
                windowStartIndex = clickedItem;
                windowEndIndex = clickedItem + windowSize;

                removeSpokenClass();
                addSpokenClass(0, clickedItem);
                console.log(windowStartIndex, windowEndIndex, currentIndex);
            }

            function addSpokenClass(windowStartFrom, curIndex) {
                var i = windowStartFrom; 
                while(i <= curIndex) {
                    var el = document.querySelector('[dataIndex="'+i+'"]');
                    el.classList.add("spoken");
                    i++;
                }
            }

            function removeSpokenClass() {
                var elems = document.querySelectorAll('.spoken');
                [].forEach.call(elems, function(el) {
                    el.className = el.className.replace(/\bspoken\b/, "");
                });
            }

            function movePointers(scriptCurrentWord, windowCurrentIndex) {

                // move the pointer of string and window by one word
                currentIndex++;
                windowCurrentIndex++;
                //to slide the window by one word
                if(windowEndIndex < scriptLength) {
                    windowEndIndex = currentIndex + windowSize;
                }
                windowStartIndex = currentIndex;
            }

            function scroll(scriptCurrentWord) {
                var el = document.getElementById(scriptCurrentWord);
                $('html,body').animate({
                    scrollTop: $(el).offset().top
                }, 'slow');

                // scrollTop: $('html,body').scrollTop() + (($('html,body').scrollTop() >= 2000) ? (-2000) : (100))
                //     $('html,body').animate({scrollTop:40}, 400, 'swing');
            }



            function calculateLevenshteinDistance(a, b) {
                if(a.length == 0) return b.length; 
                    if(b.length == 0) return a.length; 

                    var matrix = [];

                    // increment along the first column of each row
                    var i;
                    for(i = 0; i <= b.length; i++){
                        matrix[i] = [i];
                    }

                    // increment each column in the first row
                    var j;
                    for(j = 0; j <= a.length; j++){
                        matrix[0][j] = j;
                    }

                    // Fill in the rest of the matrix
                    for(i = 1; i <= b.length; i++){
                        for(j = 1; j <= a.length; j++){
                            if(b.charAt(i-1) == a.charAt(j-1)){
                                matrix[i][j] = matrix[i-1][j-1];
                            } else {
                                matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                                        Math.min(matrix[i][j-1] + 1, // insertion
                                                                matrix[i-1][j] + 1)); // deletion
                            }
                        }
                    }

                return matrix[b.length][a.length];
            }

            function calculateJaroDistance(s1, s2) {
                var m = 0;

                // Exit early if either are empty.
                if ( s1.length === 0 || s2.length === 0 ) {
                    return 0;
                }

                // Exit early if they're an exact match.
                if ( s1 === s2 ) {
                    return 1;
                }

                var range     = (Math.floor(Math.max(s1.length, s2.length) / 2)) - 1,
                    s1Matches = new Array(s1.length),
                    s2Matches = new Array(s2.length);

                for ( i = 0; i < s1.length; i++ ) {
                    var low  = (i >= range) ? i - range : 0,
                        high = (i + range <= s2.length) ? (i + range) : (s2.length - 1);

                    for ( j = low; j <= high; j++ ) {
                    if ( s1Matches[i] !== true && s2Matches[j] !== true && s1[i] === s2[j] ) {
                        ++m;
                        s1Matches[i] = s2Matches[j] = true;
                        break;
                    }
                    }
                }

                // Exit early if no matches were found.
                if ( m === 0 ) {
                    return 0;
                }

                // Count the transpositions.
                var k = n_trans = 0;

                for ( i = 0; i < s1.length; i++ ) {
                    if ( s1Matches[i] === true ) {
                    for ( j = k; j < s2.length; j++ ) {
                        if ( s2Matches[j] === true ) {
                        k = j + 1;
                        break;
                        }
                    }

                    if ( s1[i] !== s2[j] ) {
                        ++n_trans;
                    }
                    }
                }

                var weight = (m / s1.length + m / s2.length + (m - (n_trans / 2)) / m) / 3,
                    l      = 0,
                    p      = 0.1;

                if ( weight > 0.7 ) {
                    while ( s1[l] === s2[l] && l < 4 ) {
                    ++l;
                    }

                    weight = weight + l * p * (1 - weight);
                }

                return weight;
            }
        