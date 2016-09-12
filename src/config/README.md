## Configuration

Add a file in the `src/config` directory called `responses-config.json` with the following data, swapping out:

* `minScoreThreshold` - returns responses that are higher than the threshold
* `base` - has your base messages that you append or prepend to messages
* `keyPhrases` and `responseText` - what key phrases are you looking for in the message and what to respond to those keyPhrases
* An example `responses-config.json` is provided for you and included in the .gitignore so it doesn't track it.

```
{
  "minScoreThreshold": 200,
  "base": {
    "introMsg": "This is a bot. The following automated responses have been found that may help you: ",
    "noMatchMsg": "Sorry, no matches were found. Contact Dorian for further assistance",
    "disclaimerMsg": "Disclaimer: This message is automated and may not be correct."
  },
  "responses": [{
    "keyPhrases": [
      "close sprint",
      "active sprint"
    ],
    "responseText": "This is a response for how to close a sprint."
  }, {
    "keyPhrases": [
      "admin privileges"
    ],
    "responseText": "This is a response for how to change admin privileges."
  }, {
    "keyPhrases": [
      "previous sprints",
      "prior sprints"
    ],
    "responseText": "This is a response for how to view previous sprints."
  }]
}
```
