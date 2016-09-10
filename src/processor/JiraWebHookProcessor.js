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
   * Converts a Jira WebHook notification into a a message that's human readable
   *
   * @param {object} body - Jira WebHook post request
   * @returns {string} notification message
   */
  getImTextFromBody(body) {
    jiraFormatter.setUrl(this.config.jiraUrl);
    jiraFormatter.setData(body);

    let text;
    switch (body.webhookEvent) {
      case 'jira:issue_created':
        text = jiraFormatter.getCreated();
        break;
      case 'jira:issue_updated':
        text = jiraFormatter.getUpdatedDesc() ||
          jiraFormatter.getStatusChangeWithComment() ||
          jiraFormatter.getStatusChange() ||
          jiraFormatter.getComment();
        break;
      case 'jira:issue_deleted':
        text = jiraFormatter.getDeleted();
        break;
    }

    return text;
  }

  /**
   * Takes a Jira WebHook requests, converts it and sends it to Slack
   *
   * @param {object} body - body from Express.js
   */
  sendToSlack(body) {
    if (!this.config.projects.hasOwnProperty(body.issue.fields.project.key)) {
      throw new Error(`Unkown project: ${body.issue.fields.project.key}`);
    }

    let projectConfig = this.config.projects[body.issue.fields.project.key];
    projectConfig.payload.text = this.getImTextFromBody(body);

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
