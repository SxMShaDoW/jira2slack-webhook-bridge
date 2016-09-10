'use strict';

let assert = require('assert'),
    chai = require('chai'),
    sinon = require('sinon'),

    request = require('request'),
    JiraWebHookProcessor = require('../src/processor/JiraWebHookProcessor');

describe('E2E Tests', () => {
  describe('#sendToSlack()', () => {
    let jiraWebHookProcessor,
      httpClientSpy;

    beforeEach(() => {
      let fixtureConfig = require('./fixtures/config.json');

      httpClientSpy = sinon.spy(request, 'post');
      jiraWebHookProcessor = new JiraWebHookProcessor(fixtureConfig, request);
    });

    afterEach(() => {
      request.post.restore();
    });

    it('will throw an error if the project is not found', () => {
      let fixtureUnknownProject = require('./fixtures/jira/unknown_project.json');

      chai.expect(() => jiraWebHookProcessor.sendToSlack(fixtureUnknownProject)).to.throw('Unkown project: UNKNOWN');
    });

    it('will throw an error on Slack WebHook error', () => {
      let fixtureCreate = require('./fixtures/jira/ticket_create.json');
      jiraWebHookProcessor.sendToSlack(fixtureCreate);

      chai.expect(() => httpClientSpy.args[0][1](true, null, 'Error!')).to.throw('Error!');
    });

    it('will take a new ticket request from a Jira WebHook and forward it to a Slack WebHook', () => {
        let fixtureCreate = require('./fixtures/jira/ticket_create.json');
        jiraWebHookProcessor.sendToSlack(fixtureCreate);

        sinon.assert.calledWith(httpClientSpy, {
          "url": "https://hooks.slack.com/services/EXAMPLE/KEY",
          "json": {
            "channel": "#my-example-channel",
            "username": "Jira",
            "text": "Seb created: <https://jira.example.com/browse/PRO-1234|PRO-1234> Push notification test (Open):\nDescription",
            "icon_emoji": ":ticket:"
          }
        });
      });

    it('will take an updated ticket description request from a Jira WebHook and forward it to a Slack WebHook', () => {
      let fixtureUpdateDest = require('./fixtures/jira/ticket_update_desc.json');
      jiraWebHookProcessor.sendToSlack(fixtureUpdateDest);

      sinon.assert.calledWith(httpClientSpy, {
        "url": "https://hooks.slack.com/services/EXAMPLE/KEY",
        "json": {
          "channel": "#my-example-channel",
          "username": "Jira",
          "text": "Seb updated: <https://jira.example.com/browse/PRO-1234|PRO-1234> Push notification test (Open):\nYour bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke....",
          "icon_emoji": ":ticket:"
        }
      });
    });

    it('will take a deleted ticket request from a Jira WebHook and forward it to a Slack WebHook', () => {
      let fixtureDelete = require('./fixtures/jira/ticket_delete.json');
      jiraWebHookProcessor.sendToSlack(fixtureDelete);

      sinon.assert.calledWith(httpClientSpy, {
        "url": "https://hooks.slack.com/services/EXAMPLE/KEY",
        "json": {
          "channel": "#my-example-channel",
          "username": "Jira",
          "text": "Seb deleted: <https://jira.example.com/browse/PRO-1234|PRO-1234> Push notification test (Open)",
          "icon_emoji": ":ticket:"
        }
      });
    });

    it('will take a comment added request from a Jira WebHook and forward it to a Slack WebHook', () => {
      let fixtureComment = require('./fixtures/jira/comment_create.json');
      jiraWebHookProcessor.sendToSlack(fixtureComment);

      sinon.assert.calledWith(httpClientSpy, {
        "url": "https://hooks.slack.com/services/EXAMPLE/KEY",
        "json": {
          "channel": "#my-example-channel",
          "username": "Jira",
          "text": "Seb commented on: <https://jira.example.com/browse/PRO-1234|PRO-1234> Push notification test (Open):\nTest comment",
          "icon_emoji": ":ticket:"
        }
      });
    });

    it('will take a ticket status update request from a Jira WebHook and forward it to a Slack WebHook', () => {
      let fixtureUpdateState = require('./fixtures/jira/ticket_update_state.json');
      jiraWebHookProcessor.sendToSlack(fixtureUpdateState);

      sinon.assert.calledWith(httpClientSpy, {
        "url": "https://hooks.slack.com/services/EXAMPLE/KEY",
        "json": {
          "channel": "#my-example-channel",
          "username": "Jira",
          "text": "Seb moved: <https://jira.example.com/browse/PRO-1234|PRO-1234> Push notification test (Open):\nFrom: In Progress To: In Testing",
          "icon_emoji": ":ticket:"
        }
      });
    });

    it('will take a ticket status update request with comment from a Jira WebHook and forward it to a Slack WebHook', () => {
      let fixtureUpdateStateComment = require('./fixtures/jira/ticket_update_state_with_comment.json');
      jiraWebHookProcessor.sendToSlack(fixtureUpdateStateComment);

      sinon.assert.calledWith(httpClientSpy, {
        "url": "https://hooks.slack.com/services/EXAMPLE/KEY",
        "json": {
          "channel": "#my-example-channel",
          "username": "Jira",
          "text": "Seb moved: <https://jira.example.com/browse/PRO-1234|PRO-1234> Push notification test (Resolved):\nFrom: Open, with comment: Update status with comment",
          "icon_emoji": ":ticket:"
        }
      });
    });

    it('will not send data for minor changes', () => {
      let fixtureUpdateMinor = require('./fixtures/jira/ticket_update_minor.json');
      jiraWebHookProcessor.sendToSlack(fixtureUpdateMinor);

      assert.equal(false, httpClientSpy.called);
    });
  });
});
