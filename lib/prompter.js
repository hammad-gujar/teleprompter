            // to store the text of teleprompter and pointers of the string
            var scriptText = '';
            var scriptArray = [];
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
            var turnedOn = false;
            var correctCount = 0;
            var pauseTimeoutFunction;
            var pauseTimerIsOn = false;
            var controlsPosition = 'right';
            var prompterWidth = 70;
            var missingWordsString = '';
            var transcriberWord;
            var highliteIndex = 15;
            var startCommand = 'green';
            var pauseCommand = 'red';
            var resumeCommand = 'yellow';
            var boldStatus = false;
            var progressBar = 0;            
            var progressBarWidth = 0;
            var progressBarIntervalFunc;










            (function() {
            var sampleText = 'Teleprompter is widely used device in telecommunication sector. It helps the broadcasters to realize the perception of eye-contact with viewers. A traditional teleprompter, based on glass plates which reflect the script to speaker while the camera behind these plates cannot record the script scrolling on the glass plates. Speakers look right into the lens of camera which create the illusion that speaker memorized the text.';
                document.getElementById('script').value = sampleText;
                scriptText = document.getElementById('script').value;
                $( "#draggable" ).draggable({
                    containment: "window"
                });
            })();

            saveScript(true);
            addHighliteClass();
            checkMicrophoneOnLoad();
            loadSavedPrefrences();

            function startProgressBar() {
                console.log('proggggg : ', progressBar);
                changeProgessBarStatus('Detecting...');
              if (progressBar == 0) {
                progressBar = 1;
                var elem = document.getElementById("progressBar");
                progressBarIntervalFunc = setInterval(frame, 100);
                function frame() {
                  if (progressBarWidth >= 100) {
                    clearInterval(progressBarIntervalFunc);
                    progressBar = 0;
                  } else {
                    progressBarWidth++;
                    elem.style.width = progressBarWidth + "%";
                  }
                }
              }
            }

            function finishProgressBar() {
                progressBarWidth = 99;
                progressBar = 0;
                changeProgessBarStatus('');
            }

            function resetProgressBar(msg) {                
                progressBarWidth = 0;
                progressBar = 0;
                var elem = document.getElementById("progressBar");
                elem.style.width = '0%';
                clearInterval(progressBarIntervalFunc);
                changeProgessBarStatus(msg);
            }

            function changeProgessBarStatus(msg) {
                var elem = document.getElementById("progressBar");
                elem.innerHTML = msg;
            }

            function loadSavedPrefrences() {
                var configs = JSON.parse(localStorage.getItem('teleprompter') || '[]');
                if( configs !== null ) {                    
                    configs.forEach((config, index) => {
                        if (config.type  === 'fontFamily') {
                            setDropDownSelectValue('textFont', config.value);
                            changeTextFont('textFont');                            
                        } else if (config.type  === 'color') {
                            setDropDownSelectValue('textColor', config.value);
                            setTextColor(config.value);                            
                        } else if (config.type  === 'backgroundColor') {
                            setDropDownSelectValue('backgroundColor', config.value);
                            setBackgroundColor(config.value);                            
                        } else if (config.type  === 'width') {
                            setWidth(config.value);
                            prompterWidth = config.value;
                        } else if (config.type  === 'fontSize') {
                            setFontSize(config.value);
                            fontSize = config.value;
                        } else if (config.type  === 'startCommand') {
                            startCommand = config.value;
                            loadVoiceCommands('startCommand', startCommand);
                        } else if (config.type  === 'resumeCommand') {
                            resumeCommand = config.value;
                        } else if (config.type  === 'pauseCommand') {
                            pauseCommand = config.value;
                        }
                    })
                }
            }

            function checkMicrophoneOnLoad() {                
                var configs = JSON.parse(localStorage.getItem('teleprompter') || '[]');                            
                var index = getPrefrencesIndex(configs, 'microphone');
                if(index === -1) {
                    openMicModal();
                }
            }

            function saveMicPrefrences() {
                const audioInputSelect = document.querySelector('select#audioSource');
                const audioSource = audioInputSelect.value;
                saveToLocalStorage('microphone', audioSource);
                var modal = document.getElementById("micModal");
                modal.style.display = "none";
            }

            function loadVoiceCommands(action, command) {
                document.getElementById(action).value = command;
            }
            function saveVoiceCommands() {
                startCommand = document.getElementById('startCommand').value;
                saveToLocalStorage('startCommand', startCommand);
                
                resumeCommand = document.getElementById('resumeCommand').value;
                saveToLocalStorage('resumeCommand', resumeCommand);
                
                pauseCommand = document.getElementById('pauseCommand').value;
                saveToLocalStorage('pauseCommand', pauseCommand);
            }

            function openMicModal() {

                var modal = document.getElementById("micModal");

                // Get the <span> element that closes the modal
                var span = document.getElementsByClassName("close")[0];

                // When the user clicks on the button, open the modal
                modal.style.display = "block";               

                // When the user clicks on <span> (x), close the modal
                span.onclick = function() {
                modal.style.display = "none";
                }

                // When the user clicks anywhere outside of the modal, close it
                window.onclick = function(event) {
                    if (event.target == modal) {
                        modal.style.display = "none";
                    }
                }
            }

            function getPrefrencesIndex(object, value) {
                if(object == null) {
                    return null;
                }
                return object.map(function(item) { return item.type; }).indexOf(value);
            }

            function deletePrefrence(object, removeIndex) {
                object.splice(removeIndex, 1);
            }

            function videoItemPosition(position) {                
                var els = document.getElementsByClassName('videoItem');
                for(i = 0; i < els.length; i++) {
                    els[i].style.float = position;
                }
            }

            function saveToLocalStorage(type, value) {
                var configs = JSON.parse(localStorage.getItem('teleprompter') || '[]');
                            
                var index = getPrefrencesIndex(configs, type);
                if(index != -1) {
                    deletePrefrence(configs, index);
                }
                configs.push({type: type, value: value});
                localStorage.setItem('teleprompter', JSON.stringify(configs));
            }

            function getDropDownSelectcValue(ddId) {
                return document.getElementById(ddId).value;
            }

            function setDropDownSelectValue(ddId, value) {    
                let element = document.getElementById(ddId);
                element.value = value;
            }

            function changeFontSize(action) {
                if(action == 'plus') {
                    fontSize++;
                } else {
                    fontSize--;
                }
                setFontSize(fontSize);             
                saveToLocalStorage('fontSize', fontSize);
            }
            function setFontSize(fontSize) {
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
                setWidth(prompterWidth);          
                saveToLocalStorage('width', prompterWidth);
            }
            function setWidth(prompterWidth) {
                document.getElementById('centered').style.width = prompterWidth + '%'; 
            }

            function changeTextFont(ddId) {
                var font = getDropDownSelectcValue(ddId);
                saveToLocalStorage('fontFamily', font);
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
                setTextColor(color);
                saveToLocalStorage('color', color);
            }
            function setTextColor(color) {                
                document.getElementById('scriptTextContainer').style.color = color;
            }

            function changeTextBackgroudColor(ddId) {
                var color = getDropDownSelectcValue(ddId);
                setBackgroundColor(color);
                saveToLocalStorage('backgroundColor', color);
            }
            function setBackgroundColor(color) {
                document.getElementById('scriptTextContainer').style.backgroundColor = color;
                document.body.style.background = color;
            }

            function showResponse(res) {
                document.getElementById("response").textContent = res;
            }

            function updateStatusMessage(msg, color) {
                document.getElementById("statusMessage").textContent = msg;
                document.getElementById("statusMessage").style.color = color;
                document.getElementById("statusMessage").style.fontWeight = 'normal';
            }

            function setPrompterStatus(status) {
                if (status == 'turnedOn') {
                    stop = false;
                    active = false;
                    pause = false;
                    turnedOn = true;
                    updateStatusMessage('Turned On', '#118e09');
                    changeProgessBarStatus('On');
                }

                if (status == 'active') {
                    stop = false;
                    active = true;
                    pause = false;
                    turnedOn = false;
                    updateStatusMessage('Listening', '#118e09');
                    pauseTimerInit();
                    changeProgessBarStatus('Listening...');
                }

                if(status == 'pause') {
                    stop = false;
                    active = false;
                    pause = true;
                    turnedOn = false;
                    updateStatusMessage('Paused', '#eff309');
                    resetProgressBar('Paused...');
                }


                if (status == 'stop') {
                    stop = true;
                    active = false;
                    pause = false;
                    turnedOn = false;
                    updateStatusMessage('Stopped', '#d82121');
                    resetProgressBar('Off');
                    clearPauseStatus();
                }
                var els = document.getElementsByClassName('draggable');
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
            function saveScript(onLoad = false){
                scriptText = document.getElementById('script').value;
                if(scriptText == '') {
                    alert('Please enter the text first.');
                    return;
                }

                scriptArray = [];

                var scriptTextContainer = document.getElementById('scriptTextContainer');
                var scriptParagraphs = scriptText.split("\n");
                var script = '';
                var wordNumber = 0;
                scriptParagraphs.forEach((paragraph, i) => {
                    paragraphArray = paragraph.split(' ');
                    var paragraphText = '<p>';
                    if(paragraphArray.length == 1 && paragraphArray[0] == "") {
                        paragraphText += '<br>';
                    } else {
                        paragraphArray.forEach((word, index) => {                        
                            if(word != '') {
                                var cleanedText = cleanText(word) + wordNumber;
                                paragraphText += '<span onclick="adjustWindow(' + wordNumber + ')" dataIndex = '+wordNumber+' class="items" id = ' + cleanedText + '>' + word + '</span> ';                        
                                scriptArray.push(word);
                                wordNumber++;
                            }                        
                        });
                    }
                    paragraphText += '</p>';
                    script += paragraphText;
                });
                scriptTextContainer.innerHTML = script;
                scriptLength = scriptArray.length;

                if(scriptLength < windowSize) {
                    windowSize = scriptLength;
                }

                addHoverStyle();
                addHighliteClass();
                reset(onLoad);
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
                if(!stop) {                    
                    showNotification('error', 'Error', 'Please stop the Teleprompter first', true);
                    return;
                }
                var node = document.getElementById("scriptTextContainer");
                node.innerHTML = '';
                scriptText = '';
                scriptArray = {};
                scriptLength = 0;
                reset(false, true);
            }

            function reset(onLoad = false, clear = true)
            {
                // if(!stop) {                    
                //     showNotification('error', 'Error', 'Please stop the Teleprompter first', true);
                //     return;
                // }
                currentIndex = 0;
                windowNumber = 0;
                windowStartIndex = 0;
                windowEndIndex = 0;
                algo = 'JaroDistance';
                pause = false;
                stop = true;
                active = false;
                correctCount = 0;
                pauseTimerIsOn = false;
                highliteIndex = 15;
                if(!onLoad && !clear) {
                    pausePrompter();
                }
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
                console.log(transcriberWord);
                if(calculateJaroDistance(cleanText(startCommand), transcriberWord) > 0.9
                    && turnedOn) {
                    startPrompter();
                }

                if(calculateJaroDistance(cleanText(pauseCommand), transcriberWord) > 0.9
                    && active) {
                    pausePrompter();
                }

                if(calculateJaroDistance(cleanText(resumeCommand), transcriberWord) > 0.9
                    && pause) {
                    resumePrompter();
                }

                if(!active || pause) {
                    return;
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
                        if(calculateJaroDistance(scriptCurrentWord, transcriberWord) > 0.96) {
                            if(pauseTimerIsOn) {
                                clearTimeout(pauseTimeoutFunction);
                                pauseTimerIsOn = false;
                            }
                            
                            if (!pause) {
                                var el = document.getElementById("statusMessage");
                                (boldStatus)? el.style.fontWeight = 'bold' : el.style.fontWeight = 'normal';
                                boldStatus = !boldStatus;
                                finishProgressBar();
                                addSpokenClass(windowStartIndex, currentIndex);
                                scroll(scriptCurrentWord+currentIndex);
                                movePointers(scriptCurrentWord+currentIndex, windowCurrentIndex);
                                addHighliteClass();
                                showResponse(scriptCurrentWord);
                            }
                            break;
                        }
                    }
                    // If word is not found at an index, move string pointer forward by 1
                    // to compare it with next word in the specified window.
                    currentIndex++;
                }

                if(!pauseTimerIsOn && active) {
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

            function pauseTimerInit() {
                pauseTimerIsOn = true;
                pauseTimeoutFunction = setTimeout(function(){
                    // showNotification('error', 'Pause', 'Teleprompter has Paused due to Inactivity', true);
                    pausePrompter();
                }, 10000);
            }

            function turnOnPrompter( ) {
                setPrompterStatus('turnedOn');
                document.getElementById("start-button-"+controlsPosition).disabled = false;
            }

            function startPrompter( ) {
                setPrompterStatus('active');
                showNotification('success', 'Started', 'Teleprompter is listening', true);
                document.getElementById("start-button-"+controlsPosition).disabled = true;
                document.getElementById("pause-button-"+controlsPosition).disabled = false;
            }

            function pausePrompter() {
                setPrompterStatus('pause');
                document.getElementById("resume-button-"+controlsPosition).disabled = false;
                document.getElementById("pause-button-"+controlsPosition).disabled = true;
                clearTimeout(pauseTimeoutFunction);
            }

            function clearPauseStatus() {                
                pause = false;
                pauseTimerIsOn = false;
                clearTimeout(pauseTimeoutFunction);
            }

            function resumePrompter() {
                setPrompterStatus('active');
                document.getElementById("pause-button-"+controlsPosition).disabled = false;
                document.getElementById("resume-button-"+controlsPosition).disabled = true;
                clearPauseStatus();
            }

            function stopPrompter() {                
                setPrompterStatus('stop');
                document.getElementById("start-button-"+controlsPosition).disabled = true;
                document.getElementById("pause-button-"+controlsPosition).disabled = true;
                document.getElementById("resume-button-"+controlsPosition).disabled = true;
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
                
                // var anchor = document.querySelector('#bazinga');
                //sscroll.animateScroll(el);
               el.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
                $('html,body').animate({
                    scrollTop: $(el).offset().top
                }, 400);
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
        