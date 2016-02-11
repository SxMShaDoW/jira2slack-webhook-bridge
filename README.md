# Jira to Slack WebHook Bridge

[![Build Status](https://secure.travis-ci.org/sebflipper/jira2slack-webhook-bridge.png)](http://travis-ci.org/sebflipper/jira2slack-webhook-bridge?branch=master)

Allows you to see realtime [Jira](https://www.atlassian.com/software/jira) updates in your [Slack](https://slack.com) channel.

Bridges Jira with Slack by accepting a Jira WebHook request, converting and sending it to the Slack WebHook endpoint.

## Setting up in Slack

Visit the [Incoming WebHooks](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks) page for your team and click Add then select the channel you want the notifications to be sent to and copy the WebHook URL.

## Configuration

Add a file in the `src/config` directory called `default.json` with the following data, swapping out:

* `jiraUrl` - base URL of your Jira installation
* `PRO` - the Jira project project key of the project you want notifications for (normally the first 3 characters of the Jira ticket key)
* `slackWebHookUrl` - your Slack WebHook URL
* `channel` - Slack channel you want notifications sent to
* `username` - (optional) Slack username to display
* `icon_emoji` - (optional) Slack emoji icon to use

```
{
  "jiraUrl": "https://jira.example.com",
  "projects": {
    "PRO": {
      "slackWebHookUrl": "https://hooks.slack.com/services/EXAMPLE/KEY",
      "payload": {
        "channel": "#my-example-channel",
        "username": "Jira",
        "icon_emoji": ":ticket:"
      }
    }
  }
}
```

## Setting up in Jira

Assuming you are a Jira Administrator, click: `Settings Gear > System > WebHooks > Create a WebHook`

* Name: `Jira to Slack WebHook Bridge`
* Status: `Enabled`
* URL: `http://jira2slack-webhook-bridge.localhost:3000/jira-webhook`
* Events:
 * `created`
 * `updated`
 * `deleted`

## Starting

`docker-compose up` or `npm start`

## Running tests

Tested with Node.js v5.6.0 and Jira v7.0.5.

`npm install && npm test`
