'use strict';

let request = require('request'),
    jiraFormatter = require('../formatter/jiraFormatter');


module.exports = class JiraWebHookProcessor {
  /**
   * Creates a new JiraWebHookProcessor
   *
   * @param {object} httpClient - request HTTP client
   */
  constructor(config, httpClient) {
    this.config = config;
    this.httpClient = httpClient || request;
  }

  /**
   * Given a response. Comments on JIRA tickets
   *
   * @param {object} body - body from Express.js
   */
   sendToJira(body, key){
     let jiraURL = this.config.jiraUrl;
     let jiraCommentAPI = '/rest/api/2/issue/';
     let payload = {"body": body};
     let auth = ''
     const uname = this.config.username;
     const pword = this.config.password;
     if (uname != '' && pword != ''){
       auth = "Basic " + new Buffer(uname + ':' + pword).toString("base64");
     }
     if (body && auth && key) {
       this.httpClient.post({
         url: jiraURL + jiraCommentAPI + key + '/comment',
         json: payload,
         headers: {
           "Authorization" : auth
         }
   }, (error, response, body) => {
     if (error) {
       throw new Error(body);
     }
   });
 }
 }

  /**
   * Takes a message and sends it to Slack
   *
   * @param {object} body - body from Express.js
   * @param {string} key - jira project key to match to configuration
   */
  sendToSlack(text, attachment_title, key) {
    if (!this.config.projects.hasOwnProperty(key)) {
      throw new Error(`Unkown project: ${key}`);
    }
    let projectConfig = this.config.projects[key];
    const action_to_channel = [
        {
            "title": attachment_title,
            "text": "Does this response look okay?",
            "fallback": "TBD",
            "callback_id": "response_promethesus",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "good",
                    "text": "Looks Correct",
                    "type": "button",
                    "style": "primary",
                    "value": "good"
                },
                {
                    "name": "bad",
                    "text": "Don't send",
                    "type": "button",
                    "value": "bad"
                },
                {
                    "name": "modify",
                    "text": "Modify",
                    "style": "danger",
                    "type": "button",
                    "value": "modify",
                    "confirm": {
                        "title": "Modify my responses?",
                        "text": "Do you want me to overwrite this?",
                        "ok_text": "Yes",
                        "dismiss_text": "No"
                    }
                }
            ]
        }
    ]


    projectConfig.payload.text = text;
    projectConfig.payload.attachments = action_to_channel;

    if (projectConfig.payload.text) {
      this.httpClient.post({
        url: projectConfig.slackWebHookUrl,
        json: projectConfig.payload
      }, (error, response, body) => {
        if (error) {
          throw new Error(body);
        }
      });
    }
  }

};
