# Automated Jira Response Bot

[![Build Status](https://travis-ci.org/SxMShaDoW/jira2slack-webhook-bridge.svg?branch=master)](https://travis-ci.org/SxMShaDoW/jira2slack-webhook-bridge) [![codecov.io](tbd) [![Sputnik](tbd)

Inspired and based off of the the [Jira2Slack-Webhook-Bridge](https://github.com/sebflipper/jira2slack-webhook-bridge) and converted into a support bot.

## Automated Response Configurations

To configure all of the possible automated response and their keywords, modify `src/config/responses-config.json` to your needs.

## Testing the Bot
If you want to test the bot to see what response it will generate for a given Jira ticket title, you can start the server with `npm start` and hit
the test endpoint `http://localhost:3000/prometheus-bot-test?title="Close previous sprint"` with any title you want.

## Development 
### Configure and Debug
You can also change the threshold of the minimum matching score for a response to be included by changing the `minScoreThreshold` value in the `responses-config.json` file.

If you'd like to view some debug information about the automated response generation, such as the matching scores, you can set `DEBUG=true` in `src/response-matching/generated-automated-response.js`.


## License
[MIT](https://github.com/SxMShaDoW/jira2slack-webhook-bridge/blob/master/LICENSE)
