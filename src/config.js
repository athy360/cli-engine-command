// @flow

import pjson from '../package.json'

export type Config = {
  name: string,
  version: string,
  argv0: string,
  output: {mock: boolean}
}

export const Default = {
  name: pjson.name,
  version: pjson.version,
  argv0: process.argv[0],
  output: {mock: false}
}
