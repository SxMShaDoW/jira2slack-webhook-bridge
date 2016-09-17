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
  let text = '' //Original Ticket
  try {
  const jiraSummary = req.body.issue.fields.summary;
  const jiraDescription = req.body.issue.fields.description;
  const jiraKey = req.body.issue.key;
  const jiraProject = req.body.issue.fields.project.key;
  let pre_text = jiraKey + '\n'
  text = pre_text + 'Summary: ' + jiraSummary + '\n' + 'Description: ' + jiraDescription;
  let jiraWebHookProcessor = new JiraWebHookProcessor(config);
  const response = generatedAutomatedResponse({ config: responsesConfig, title: text });
  const title = 'Prometheus Response:' + '\n' + response; // Prometheus Response
  jiraWebHookProcessor.sendToSlack(text, title, jiraProject);
  //jiraWebHookProcessor.sendToJira(response, jiraKey);
  console.log(response);
  res.send(response);
} catch (e){
  console.log(e); // not a valid jira webhook
}
  //res.send('OK');
});

app.post('/prometheus-bot-slack', (req, res) => {
  try {
  const slackCallback = req.body.callback_id;
  const slackActionName = req.body.actions[0].name;
  const slackActionValue = req.body.actions[0].value;
  const slackOriginal = req.body.original_message;
  const slackResponseUrl = req.body.response_url;
  const slackOriginalJSON = JSON.parse(slackOriginal);
  const jiraKey = slackOriginalJSON.text.match('[A-Z]+-[0-9]+')[0];
  const text = slackOriginalJSON.text;

  //const jiraKey = req.body.issue.key;
  //const jiraProject = req.body.issue.fields.project.key;
  //title = jiraSummary + jiraDescription;
  let jiraWebHookProcessor = new JiraWebHookProcessor(config);
  const response = generatedAutomatedResponse({ config: responsesConfig, title: text });
  jiraWebHookProcessor.sendToJira(response, jiraKey);
  console.log(response);
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
