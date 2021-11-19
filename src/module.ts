// (C)opyright 2021 Dirk Holtwick, holtwick.it. All rights reserved.

import { Logger } from "zeed"
import { on, register } from "zerva"
import {
  setTrackCollectUrl,
  setTrackWebsiteId,
  trackEvent,
  trackPageView,
} from "./track-plausible"

const name = "uammi"
const log = Logger(`zerva:${name}`)

interface Config {
  apiEventUrl: string
  websiteId: string
}

export function usePlausible(config: Config) {
  log.info(`use ${name}`)
  register(name)

  setTrackCollectUrl(config.apiEventUrl)
  setTrackWebsiteId(config.websiteId)

  on("trackEvent", trackEvent)
  on("trackPageView", trackPageView)
}
