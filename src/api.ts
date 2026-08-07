import * as jpsyndex from '@vdegenne/jpsyndex'
import {getApi} from './server/api.js'

export const api = getApi('/api')

export const jpsyndexAPI = jpsyndex.getApi()
