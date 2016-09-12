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
  sendToSlack(body, key) {
    if (!this.config.projects.hasOwnProperty(key)) {
      throw new Error(`Unkown project: ${key}`);
    }
    let projectConfig = this.config.projects[key];
    projectConfig.payload.text = body;

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
