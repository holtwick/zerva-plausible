import { getClientIp } from "request-ip"
import { fetchJson, fetchOptionsJson, fetchText, Logger } from "zeed"
import { fetch } from "cross-fetch"

const log = Logger("track")

let plausibleApiEventUrl: string
let plausibleWebsiteId: string

export function setTrackWebsiteId(id: string) {
  plausibleWebsiteId = id
  log.info("Plausible website ID:", plausibleWebsiteId)
}

export function setTrackCollectUrl(url: string) {
  plausibleApiEventUrl = url
  log.info("Plausible collect URL:", plausibleApiEventUrl)
}

type TrackEvent = {
  type: "event"
  req: any
  url?: string
  event_type?: string
  event_value?: string
  website?: string
}

type TrackPageview = {
  type: "pageview"
  req: any
  url?: string
  website?: string
}

export async function track(opt: TrackEvent | TrackPageview) {
  setTimeout(async () => {
    try {
      let { type, req, url, website } = opt

      if (!url) url = req.originalUrl
      if (!website) website = plausibleWebsiteId

      const language = req.get("accept-language")
      const ua = req.get("user-agent")
      const referrer = req.get("referrer")
      const ip = getClientIp(req)
      const hostname = req.hostname

      let body = {
        domain: website,
        name: "pageview", // type,
        url: `https://${website}${url}`,
        // referrer,
        // props: {},
        hostname,
        // language,
      }

      log.info("track", { body, ua, referrer, ip, plausibleApiEventUrl })

      // if (type === "event") {
      //   let { event_value } = opt as TrackEvent
      //   body.props = { event_value }
      // }

      let options = {
        ...fetchOptionsJson(body, "POST"),
      }

      Object.assign(options.headers, {
        // "Accept-Language": language,
        "User-Agent": ua,
        Referer: referrer,
        "X-Forwarded-For": ip,
      })

      // delete options.headers["Accept"]

      log.info(`track ${type} to ${plausibleApiEventUrl}:`, options)

      let response = await fetchText(plausibleApiEventUrl, options, fetch)
      // log.info("tracked", response)
    } catch (err) {
      log.warn("Failed to track", err)
    }
  }, 0)
}

export async function trackEvent(
  req: any,
  event_type: string,
  event_value: string,
  url?: string
) {
  log.info(`event ${event_type}=${event_value}`)
  await track({
    type: "event",
    event_type,
    event_value,
    url,
    req,
  })
}

export async function trackPageView(req: any, url?: string) {
  log.info(`pageview ${url}`)
  await track({
    type: "pageview",
    url,
    req,
  })
}
