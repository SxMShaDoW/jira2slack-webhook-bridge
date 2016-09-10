'use strict';

const assert = require('assert');
const responsesConfigExample = require('./../fixtures/responses-config-example.json');
const generateAutomatedResponse = require('./../../src/response-matching/generate-automated-response');

describe('generate-automated-response', () => {
  it('should include intro and dislcaimer message', () => {
    const title = 'Some title';
    const result = generateAutomatedResponse({ config: responsesConfigExample, title });
    assert(result.indexOf(responsesConfigExample.base.introMsg) > -1);
    assert(result.indexOf(responsesConfigExample.base.disclaimerMsg) > -1);
  });
  it('should include noMatchMsg if no good matches', () => {
    const title = 'Unmatched title';
    const result = generateAutomatedResponse({ config: responsesConfigExample, title });
    assert(result.indexOf(responsesConfigExample.base.noMatchMsg) > -1);
  });
  it('should include a single response with no index', () => {
    const title = 'Close a sprint';
    const result = generateAutomatedResponse({ config: responsesConfigExample, title });
    assert(result.indexOf('This is a response for how to close a sprint.') > -1);
    assert(result.indexOf('- This is a response for how to close a sprint.') === -1);
  });
  it('should include two responses with indexes for each', () => {
    const title = 'I need to close a previous sprint';
    const result = generateAutomatedResponse({ config: responsesConfigExample, title });
    assert(result.indexOf('1 - This is a response for how to view previous sprints.') > -1);
    assert(result.indexOf('2 - This is a response for how to close a sprint.') > -1);
  });
});