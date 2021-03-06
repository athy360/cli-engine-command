'use strict'

const got = require('got')

function respond (body, payload) {
  return got.post(payload.response_url, {
    body: JSON.stringify(body),
    headers: {'Content-Type': 'application/json'}
  }).catch(err => {
    console.error('Error submitting response:')
    console.dir(body)
    console.dir(err)
  })
}

module.exports = {
  respond
}
