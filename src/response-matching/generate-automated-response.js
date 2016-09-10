const fuzzy = require('fuzzy');

// debug helpers. set to true for debug loggin
const DEBUG = false;
const debugLog = (msg) => {
  if (DEBUG) {
    console.log('== DEBUG == ', msg);
  }
}

/**
 * Generates an automated response for the provided title given the provided configuration.
 * @param {Object} params
 * @param {Array} params.responses          array of responses from config, each response is { {Array} keyPhrases, {String} responseText}
 * @param {String} params.title         title of the Jira ticket to check against
 * 
 * @returns {Array} array of matching response texts
 */
const getMatchingResponses = ({ responses, minScoreThreshold, title }) => {
  const titleWords = title.split(' ');
  let ratedResponses = [].concat(responses);
  debugLog('Finding automated response for title "' + title + '"');
  ratedResponses.forEach((thisResponse) => {
    debugLog('Checking response: ' + thisResponse.responseText);
    const { keyPhrases, responseText } = thisResponse;
    let thisKeyPhraseScore = 0;
    // iterate over each keyphrase in this response
    keyPhrases.forEach((thisKeyPhrase) => {
      debugLog('  Checking key phrase: ' + thisKeyPhrase);
      let thisKeyPhraseWords = thisKeyPhrase.split(' ');
      // iterate over each word in this keyphrase
      thisKeyPhraseWords.forEach((thisKeyPhraseWord) => {
        debugLog('    Checking word in key phrase: "' + thisKeyPhraseWord + '"');
        // now rate this keyphrase word against all words in the title and add it to this keyphrase's overall score
        const fuzzyResult = fuzzy.filter(thisKeyPhraseWord, titleWords);
        let score = 0;
        if (typeof fuzzyResult[0] !== 'undefined' && 
            typeof fuzzyResult[0].score === 'number') {
              score = fuzzyResult[0].score;
              thisKeyPhraseScore += score;
        }
        debugLog('      Match rating for "' + thisKeyPhraseWord + '" : ' + score);
      });
    });
    thisResponse.score = thisKeyPhraseScore;
  });
  // sort by highest score and filter out only the ones over threshold
  const goodResponses = ratedResponses.sort((a, b) => {
      return a.score < b.score;
    })
    .filter((el) => {
      return el.score > minScoreThreshold;
    });
  return goodResponses;
};

/**
 * Generates an automated response for the provided title given the provided configuration.
 * @param {Object} params
 * @param {Object} params.config        responses config from config file
 * @param {String} params.title         title of the Jira ticket to check against
 * 
 * @returns {String} automated response
 */
const generateAutomatedResponse = ({ config, title }) => {
  const { introMsg, noMatchMsg, disclaimerMsg } = config.base;
  const { responses, minScoreThreshold } = config;
  const matchingResponses = getMatchingResponses({ responses, minScoreThreshold, title });
  // const responsesText = matchingResponses.length > 0 ? 
  const newLine = '\r\n';
  let fullResponse = introMsg + newLine + newLine;
  if (matchingResponses.length > 0) {
    matchingResponses.forEach((thisResponse, index) => {
      fullResponse += (matchingResponses.length > 1 ? index + 1  + ' - ': '') + thisResponse.responseText + newLine + newLine;
    })
  } else {
    fullResponse += noMatchMsg + newLine + newLine;
  }
  fullResponse += disclaimerMsg + newLine;
  return fullResponse;
};

module.exports = generateAutomatedResponse;