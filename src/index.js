'use strict';

let express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),

    JiraWebHookProcessor = require('./processor/JiraWebHookProcessor'),
    generatedAutomatedResponse = require('./response-matching/generate-automated-response'),
    responsesConfig = require('./config/responses-config.json'),
    config = require('./config/default.json');


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
  let title = ''
  try {
  const jiraSummary = req.body.issue.fields.summary;
  const jiraDescription = req.body.issue.fields.description;
  const jiraKey = req.body.issue.key;
  const jiraProject = req.body.issue.fields.project.key;
  title = jiraSummary + jiraDescription;
  let jiraWebHookProcessor = new JiraWebHookProcessor(config);
  const response = generatedAutomatedResponse({ config: responsesConfig, title: title });
  jiraWebHookProcessor.sendToSlack(response, jiraProject);
  jiraWebHookProcessor.sendToJira(response, jiraKey);
  res.send(response);
} catch (e){
  console.log(e); // not a valid jira webhook
}
  //res.send('OK');
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
