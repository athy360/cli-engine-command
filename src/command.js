// @flow

import Output from './output'
import Parser, {type OutputFlags, type OutputArgs, type InputFlags} from './parser' // eslint-disable-line
import pjson from '../package.json'
import {buildConfig, type Config, type ConfigOptions} from 'cli-engine-config'
import type {Arg} from './arg'
import HTTP from './http'

type RunOptions = {
  argv?: string[],
  mock?: boolean,
  output?: Output,
  config?: ConfigOptions
}

export default class Command <Flags: InputFlags> {
  static topic: string
  static command: ?string
  static description: ?string
  static hidden: ?boolean
  static usage: ?string
  static help: ?string
  static aliases: string[] = []
  static variableArgs = false
  static flags: Flags
  static args: Arg[] = []
  static _version: pjson.version

  static get id (): string {
    return this.command ? `${this.topic}:${this.command}` : this.topic
  }

  /**
   * instantiate and run the command setting {mock: true} in the config (shorthand method)
   */
  static async mock (...argv: string[]): Promise<this> {
    return this.run({argv, mock: true})
  }

  /**
   * instantiate and run the command
   */
  static async run (options: RunOptions = {}): Promise<this> {
    let config = buildConfig(options.config)
    let output = options.output || new Output({mock: options.mock, config})
    let cmd = new this({config, output})
    cmd.argv = options.argv || []
    // if (this.flags.debug) this.config.debug = 1
    try {
      const args = await cmd.parse()
      await cmd.run(args)
      await cmd.out.done()
    } catch (err) {
      cmd.out.error(err)
    }
    return cmd
  }

  config: Config
  http: HTTP
  out: Output
  flags: OutputFlags<Flags> = {}
  argv: string[]

  constructor (options: {config?: ConfigOptions, output?: Output} = {}) {
    this.config = buildConfig(options.config)
    this.out = options.output || new Output({config: this.config})
    this.http = new HTTP(this.out)
  }

  async parse () {
    const parser = new Parser({
      flags: this.constructor.flags || {},
      args: this.constructor.args || [],
      variableArgs: this.constructor.variableArgs,
      cmd: this
    })
    const {argv, flags} = await parser.parse({flags: this.flags, argv: this.argv})
    this.flags = flags
    this.argv = argv
  }

  // prevent setting things that need to be static
  topic: null
  command: null
  description: null
  hidden: null
  usage: null
  help: null
  aliases: null

  /**
   * actual command run code goes here
   */
  async run (...rest: void[]): Promise<void> { }
}
