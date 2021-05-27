

function Apple (type) {
    this.type = type;
    this.color = "red";
}

Apple.prototype.saveScript = function(transcriberWord) {
		console.log('ttttttt : ', transcriberWord);

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

                paragraph = document.getElementById('scriptTextContainer');
                paragraphText = '';
                scriptArray.forEach((word, index) => {
                  cleanedText = cleanText(word) + index;
                  paragraphText += '<span onclick="adjustWindow(' + index + ')" dataIndex = '+index+' class="items" id = ' + cleanedText + '>' + word + '</span> ';
                });
                paragraph.innerHTML = paragraphText;

            
            }
            var apple = new Apple("pink lady");

export default class Test {
	  constructor() {
  }
	compareString (transcriberWord) {
		console.log('ttttttt : ', transcriberWord);
            }

            saveScript(){
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

                paragraph = document.getElementById('scriptTextContainer');
                paragraphText = '';
                scriptArray.forEach((word, index) => {
                  cleanedText = cleanText(word) + index;
                  paragraphText += '<span onclick="adjustWindow(' + index + ')" dataIndex = '+index+' class="items" id = ' + cleanedText + '>' + word + '</span> ';
                });
                paragraph.innerHTML = paragraphText;

            }
}