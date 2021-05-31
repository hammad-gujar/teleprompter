
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
            var fontSize = 50;
            var elmnt = '';
            var missingCount = 0;
            var correctionCount = 0;
            var pause = false;
            var stop = true;
            var active = false;
            var correctCount = 0;
            var pauseTimeoutFunction;
            var pauseTimerIsOn = false;
            var controlsPosition = 'right';
            var prompterWidth = 70;
            var missingWordsString = '';
            var jumpFunction;
            var jump = false;
            var jumpTimer = false;
            var transcriberWord;
            var highliteIndex = 13;
            var resumeCommand = 'black';
            var boldStatus = false;


            (function() {
            var sampleText = 'Teleprompter is widely used device in telecommunication sector. It helps the broadcasters to realize the perception of eye-contact with viewers. A traditional teleprompter, based on glass plates which reflect the script to speaker while the camera behind these plates cannot record the script scrolling on the glass plates. Speakers look right into the lens of camera which create the illusion that speaker memorized the text.';
                document.getElementById('script').value = sampleText;
                scriptText = document.getElementById('script').value;
                $( "#draggable" ).draggable();
            })();

            saveScript();
            addHighliteClass();

            function getDropDownSelectcValue(ddId) {
                return document.getElementById(ddId).value;
            }

            // function changeControllsPosition(ddId) {
            //     controlsPosition = getDropDownSelectcValue(ddId);
            //     console.log(controlsPosition);
            //     //changeControlBarDisplay('top', 'none');
            //     //changeControlBarDisplay('bottom', 'none');
            //     changeControlBarDisplay('right', 'none');
            //     //changeControlBarDisplay('left', 'none');

            //     var container = document.getElementsByClassName('container');
            //     for(i = 0; i < container.length; i++) {
            //         container[i].style.marginTop = '';
            //     }
            //     if (controlsPosition == 'top') {
            //         changeControlBarDisplay(controlsPosition, 'flex');
            //     } else if (controlsPosition == 'bottom') {
            //         changeControlBarDisplay(controlsPosition, 'flex');
            //     } else if (controlsPosition == 'left') {
            //         changeControlBarDisplay(controlsPosition, 'flex');
            //         for(i = 0; i < container.length; i++) {
            //             container[i].style.marginTop = '-303px';
            //         }
            //         videoItemPosition('right');
                    
            //     } else if (controlsPosition == 'right') {
            //         changeControlBarDisplay(controlsPosition, 'flex');                    
            //         videoItemPosition('left');
            //     }
            // }

            function videoItemPosition(position) {                
                var els = document.getElementsByClassName('videoItem');
                for(i = 0; i < els.length; i++) {
                    els[i].style.float = position;
                }
            }

            // function changeControlBarDisplay(position, display) {

            //     var els = document.getElementsByClassName(position);

            //     for(i = 0; i < els.length; i++) {
            //         els[i].style.display = display;
            //     }

            // }

            function changeFontSize(action) {
                if(action == 'plus') {
                    fontSize++;
                } else {
                    fontSize--;
                }                
                document.getElementById('scriptTextContainer').style.fontSize = fontSize + 'px';                
            }

            function changeWidth(action) {

                if(prompterWidth == 100 && action == 'plus') {
                    return;
                }
                if(action == 'plus') {
                    prompterWidth++;
                } else {
                    prompterWidth--;
                }                
                document.getElementById('centered').style.width = prompterWidth + '%';                
            }

            function changeTextFont(ddId) {
                var font = getDropDownSelectcValue(ddId);
                if(font == 'default') {
                    font = "BlinkMacSystemFont,-apple-system,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Fira Sans','Droid Sans','Helvetica Neue',Helvetica,Arial,sans-serif";
                }

                document.getElementById('scriptTextContainer').style.fontFamily = font;
            }

            function changeTextColor(ddId) {
                var color = getDropDownSelectcValue(ddId);
                if (color == "default") {
                    color = "#4a4a4a";
                }
                document.getElementById('scriptTextContainer').style.color = color;
            }

            function changeTextBackgroudColor(ddId) {
                var color = getDropDownSelectcValue(ddId);
                document.getElementById('scriptTextContainer').style.backgroundColor = color;
            }

            function updateStatusMessage(msg, color) {
                document.getElementById("statusMessage").textContent = msg;
                document.getElementById("statusMessage").style.color = color;
                document.getElementById("statusMessage").style.fontWeight = 'normal';
            }

            function setPrompterStatus(status) {
                if (status == 'active') {
                    stop = false;
                    active = true;
                    pause = false;
                    updateStatusMessage('Listening', '#118e09');
                    pauseTimerInit();
                }

                if (status == 'stop') {
                    stop = true;
                    active = false;
                    pause = false;
                    updateStatusMessage('Stopped', '#d82121');
                    clearPauseStatus();
                }

                if(status == 'pause') {
                    stop = false;
                    active = false;
                    pause = true;
                    updateStatusMessage('Paused', '#eff309');
                }

                var els = document.getElementsByClassName(controlsPosition);
                var propertyName = 'borderBottom';
                if(controlsPosition == 'bottom') {
                    for(i = 0; i < els.length; i++) {
                        if (status == 'active') {
                            els[i].style.borderTop = 'thick solid #118e09';
                        } else if (status == 'stop') {
                            els[i].style.borderTop = 'thick solid #d82121';
                        } else if (status == 'pause') {
                            els[i].style.borderTop = 'thick solid #eff309';
                        }
                    }
                } else {
                    for(i = 0; i < els.length; i++) {
                        if (status == 'active') {
                            els[i].style.borderBottom = 'thick solid #118e09';
                        } else if (status == 'stop') {
                            els[i].style.borderBottom = 'thick solid #d82121';
                        } else if (status == 'pause') {
                            els[i].style.borderBottom = 'thick solid #eff309';
                        }
                    }                    
                }
            }
            /*
            * saveScript
            * function display entred text of teleprompter into a paragraph 
            * for find finding similaritie for further steps
            */
            function saveScript(){
                scriptText = document.getElementById('script').value;
                if(scriptText == '') {
                    alert('Please enter the text first.');
                    return;
                }

                scriptArray = scriptText.split(' ');
                scriptLength = scriptArray.length;

                if(scriptLength < windowSize) {
                    windowSize = scriptLength;
                }

                var paragraph = document.getElementById('scriptTextContainer');
                var paragraphText = '';
                scriptArray.forEach((word, index) => {
                  var cleanedText = cleanText(word) + index;
                  paragraphText += '<span onclick="adjustWindow(' + index + ')" dataIndex = '+index+' class="items" id = ' + cleanedText + '>' + word + '</span> ';
                });
                paragraph.innerHTML = paragraphText;

                addHoverStyle();
                addHighliteClass();
            }

            function addHoverStyle() {
                var elems = document.querySelectorAll(".items");
                [].forEach.call(elems, function(target) {
                    target.addEventListener("mouseover",mOver, false);
                    target.addEventListener("mouseout", mOut, false);
                });

            }

            function mOver(event) {
                event.target.classList.add("effect-underline");
            }

            function mOut(event) {
                event.target.className = event.target.className.replace(/\beffect-underline\b/, "");
            }

            function clearPrompter()
            {
                if(active) {                    
                    showNotification('error', 'Error', 'Please stop the Teleprompter first', true);
                    return;
                }
                var node = document.getElementById("scriptTextContainer");
                node.innerHTML = '';
                scriptText = '';
                scriptArray = {};
                scriptLength = 0;
                reset();
            }

            function reset()
            {
                if(active) {                    
                    showNotification('error', 'Error', 'Please stop the Teleprompter first', true);
                    return;
                }
                currentIndex = 0;
                windowNumber = 0;
                windowStartIndex = 0;
                windowEndIndex = 0;
                algo = 'JaroDistance';
                missingCount = 0;
                correctionCount = 0;
                pause = false;
                stop = true;
                active = false;
                correctCount = 0;
                pauseTimerIsOn = false;
                highliteIndex = 10;
                removeSpokenClass();
                removeHighliteClass();
                addHighliteClass();
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
            function compareString (wordArray) {
                // if(scriptText == '') {
                //     alert('Save the script first.');
                //     return;
                // }

                transcriberWord = cleanText(wordArray.Content);                

                var windowCurrentIndex = 0;
                windowStartIndex = currentIndex;

                // define new window of size k
                if(currentIndex == windowEndIndex) {
                    windowEndIndex += windowSize;
                }
                
                // if(jump) {
                //     jumpPrompter();
                //     return;
                // }

                if(calculateJaroDistance(resumeCommand, transcriberWord) > 0.9
                    && pause) {
                    resumePrompter();
                }

                console.log('transcriberWord : ', wordArray);
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
                        if(calculateJaroDistance(scriptCurrentWord, transcriberWord) > 0.96) {
                            if(pauseTimerIsOn) {
                                clearTimeout(pauseTimeoutFunction);
                                pauseTimerIsOn = false;
                            }
                            // if(jumpTimer) {
                            //     clearTimeout(jumpTimeOutFunction);
                            //     jumpTimer = false;
                            // }
                            if (!pause) {
                                var el = document.getElementById("statusMessage");
                                (boldStatus)? el.style.fontWeight = 'bold' : el.style.fontWeight = 'normal';
                                boldStatus = !boldStatus;
                                addSpokenClass(windowStartIndex, currentIndex);
                                scroll(scriptCurrentWord+currentIndex);
                                movePointers(scriptCurrentWord+currentIndex, windowCurrentIndex);
                                addHighliteClass();
                            }
                            break;
                        }
                    }
                    // If word is not found at an index, move string pointer forward by 1
                    // to compare it with next word in the specified window.
                    currentIndex++;
                }

                if(!pauseTimerIsOn && !stop) {
                    pauseTimerInit();
                    pauseTimerIsOn = true;
                }

                // if a transcriber word is not found in whole window,
                // Move string pointer to the start of the window for comparison of next word of transcriber
                // from start of the window.
                if(currentIndex == windowEndIndex) {
                        currentIndex = windowStartIndex;
                }
            }

            function addHighliteClass() {
               var highliteEnd = currentIndex + highliteIndex;

                if(highliteEnd >= scriptLength) {
                    return;
                }

                var i = windowStartIndex;
                while(i <= highliteEnd) {
                    var el = document.querySelector('[dataIndex="'+i+'"]');
                    el.classList.add("highlite");
                    var font = fontSize + 3;
                    //el.style.fontSize = font + "px";
                    i++;
                }
            }

            function jumpTimerInit() {
                jumpTimeOutFunction = setTimeout(function(){
                    jump = true;
                }, 1000);
            }

            function jumpPrompter() {
                // console.log('jumpPrompter.........', transcriberWord);
                missingWordsString += transcriberWord + ' ';
                console.log('jumpPrompter: ', missingWordsString);
            }

            function pauseTimerInit() {
                pauseTimerIsOn = true;
                pauseTimeoutFunction = setTimeout(function(){
                    showNotification('error', 'Pause', 'Teleprompter has Paused due to Inactivity', true);
                    pausePrompter();
                }, 10000);
            }

            function pausePrompter() {
                document.getElementById("resume-button-"+controlsPosition).disabled = false;
                setPrompterStatus('pause');
            }

            function clearPauseStatus() {                
                pause = false;
                pauseTimerIsOn = false;
                document.getElementById("resume-button-"+controlsPosition).disabled = true;
                clearTimeout(pauseTimeoutFunction);
            }


            function resumePrompter() {
                setPrompterStatus('active');
                clearPauseStatus();
                showNotification('success', 'Resume', 'Teleprompter has Resumed', true);
            }

            function adjustWindow(clickedItem) {
                console.log(clickedItem);
                currentIndex = clickedItem;
                windowStartIndex = clickedItem;
                windowEndIndex = clickedItem + windowSize;

                removeHighliteClass();
                addHighliteClass();
                removeSpokenClass();
                addSpokenClass(0, clickedItem);
            }

            function addSpokenClass(windowStartFrom, curIndex) {
                var i = windowStartFrom; 
                while(i <= curIndex) {
                    var el = document.querySelector('[dataIndex="'+i+'"]');
                    el.classList.add("spoken");
                    el.style.fontSize = fontSize + "px";
                    el.classList.remove("highlite");
                    i++;
                }
            }

            function removeSpokenClass() {
                var elems = document.querySelectorAll('.spoken');
                [].forEach.call(elems, function(el) {
                    el.className = el.className.replace(/\bspoken\b/, "");
                });
            }

            function removeHighliteClass() {
                var elems = document.querySelectorAll('.highlite');
                [].forEach.call(elems, function(el) {
                    el.classList.remove("highlite");
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
                }, 'fast');
            }
            
            function showNotification(status, title, text, autoClose) {
                new Notify ({
                    status: status,
                    title: title,
                    text: text,
                    effect: 'fade',
                    speed: 300,
                    customClass: null,
                    customIcon: null,
                    showIcon: true,
                    showCloseButton: true,
                    autoclose: autoClose,
                    autotimeout: 3000,
                    gap: 20,
                    distance: 20,
                    type: 1,
                    position: 'right top'
                });
                
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

                for (var i = 0; i < s1.length; i++ ) {
                    var low  = (i >= range) ? i - range : 0,
                        high = (i + range <= s2.length) ? (i + range) : (s2.length - 1);

                    for ( var j = low; j <= high; j++ ) {
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
                var k = 0;
                var n_trans = 0;

                for (var i = 0; i < s1.length; i++ ) {
                    if ( s1Matches[i] === true ) {
                    for (var j = k; j < s2.length; j++ ) {
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
        