#!/usr/bin/env node
import { reporters } from 'nodeunit'
let reporter = reporters.default
reporter.run(['test'])
