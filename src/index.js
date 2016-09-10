'use strict';

let express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),

    JiraWebHookProcessor = require('./processor/JiraWebHookProcessor'),
    generatedAutomatedResponse = require('./response-matching/generate-automated-response'),
    responsesConfig = require('./config/responses-config.json');



app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));

app.get('/', (req, res) => {
  res.send('OK');
});

app.post('/jira-webhook', (req, res) => {
  try {
    let jiraWebHookProcessor = new JiraWebHookProcessor(config);
    jiraWebHookProcessor.sendToSlack(req.body);
  } catch (e) {
    // Jira requires a 200 OK otherwise it will stop you from changing issues
    console.log(e);
  }

  res.send('OK');
});

app.post('/prometheus-bot', (req, res) => {
  // get the title somehow
  const title = 'This is an example title. I need help closing a sprint';
  const response = generatedAutomatedResponse({ config: responsesConfig, title: title });
  res.send(response);
});

app.get('/prometheus-bot-test', (req, res) => {
  const title = req.query.title;
  if (!title) {
    res.send('No title given. You can provide a title in the url via /prometheus-bot-test/?title="Some title text"');
  }
  const response = generatedAutomatedResponse({ config: responsesConfig, title: title });
  res.send('<html><body><pre>' + response  + '</pre></body></html>');
});


app.listen(3000, () => {
  console.log('jira2slack-webhook-bridge listening on port 3000!');
});
