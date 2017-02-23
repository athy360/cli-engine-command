// @flow

import path from 'path'
import os from 'os'
import util from 'util'

type S3 = {
  host?: string,
  bucket?: string
}

type CLI = {
  defaultCommand?: string,
  bin?: string,
  s3?: S3
}

export type PJSON = {
  name: string,
  version: string,
  'cli-engine'?: CLI
}

export type ConfigOptions = {
  mock?: boolean,
  argv?: string[],
  root?: string,
  updateDisabled?: string,
  binPath?: string,
  channel?: string
} | Config

function debug () {
  const HEROKU_DEBUG = process.env.HEROKU_DEBUG
  if (HEROKU_DEBUG === 'true') return 1
  if (HEROKU_DEBUG) return parseInt(HEROKU_DEBUG)
  return 0
}

class Dirs {
  constructor (config: Config) {
    this._config = config
  }

  _config: Config

  get home () { return os.homedir() }
  get data () { return this._fetch('data') }
  get config () { return this._fetch('config') }
  get cache () {
    let def
    if (process.platform === 'darwin') def = path.join(this.home, 'Library', 'Caches')
    return this._fetch('cache', def)
  }

  get _fs () { return require('fs-extra') }
  _mkdirp (dir: string) { this._fs.mkdirpSync(dir) }

  _fetch (category: string, d?: ?string): string {
    d = d || path.join(this.home, category === 'data' ? '.local/share' : '.' + category)
    if (this.windows) d = process.env.LOCALAPPDATA || d
    d = process.env.XDG_DATA_HOME || d
    d = path.join(d, this._config.name)
    this._mkdirp(d)
    return d
  }

  inspect (depth, options) {
    if (depth < 0) return options.stylize('[Dirs]', 'special')
    let dirs = {
      cache: this.cache,
      data: this.data,
      config: this.config,
      home: this.home
    }
    return `Config ${util.inspect(dirs, options)}`
  }
}

export default class Config {
  constructor (options: ConfigOptions) {
    this._options = options
    this._pjson = this._options.root
        // flow$ignore
      ? require(path.join(options.root, 'package.json'))
      : require('../package.json')
    this.debug = debug()
    this.dirs = new Dirs(this)
  }

  dirs: Dirs
  debug: number
  _pjson: PJSON
  _options: ConfigOptions

  get name ():string { return this._pjson.name }
  get version ():string { return this._pjson.version }
  get channel ():string { return this._options.channel || 'stable' }
  get argv (): string[] { return this._options.argv || process.argv }
  get mock (): boolean { return this._options.mock || false }
  get updateDisabled (): ?string { return this._options.updateDisabled }
  get bin (): string { return this._cli.bin || this._pjson.name }
  get binPath (): ?string { return this._options.binPath }
  get root (): string { return this._options.root || path.join(__dirname, '..') }
  get defaultCommand (): string { return this._cli.defaultCommand || 'help' }
  get s3 (): S3 { return this._cli.s3 || {} }
  get _cli (): CLI { return this._pjson['cli-engine'] || {} }
  get windows (): boolean { return os.platform === 'win32' }

  inspect (depth: number, options: any): any {
    if (depth < 0) return options.stylize('[Config]', 'special')
    let config = {
      name: this.name,
      version: this.version,
      channel: this.channel,
      argv: this.argv,
      mock: this.mock,
      updateDisabled: this.updateDisabled,
      bin: this.bin,
      binPath: this.binPath,
      defaultCommand: this.defaultCommand,
      root: this.root,
      s3: this.s3,
      windows: this.windows,
      debug: this.debug,
      dirs: this.dirs
    }
    return `Config ${util.inspect(config, options)}`
  }
}
