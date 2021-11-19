// <reference path="node_modules/zerva-plausible/dist/esm/index.d.ts" />

// Simple demo for node and CommonJS loading

import { Logger, setupEnv, suid, valueToInteger } from "zeed"
import { emit, on, serve, useHttp } from "zerva"
import { usePlausible } from "zerva-plausible"

setupEnv()

const log = Logger("app")

useHttp({
  port: valueToInteger(process.env.PORT, 8080),
})

usePlausible({
  collectUrl: process.env.PLAUSIBLE_COLLECT_URL,
  websiteId: process.env.PLAUSIBLE_WEBSITE_ID,
})

on("httpInit", ({ get }) => {
  get(
    "/",
    `<a href="/trackEvent">trackEvent</a><br><a href="/trackPageView">trackPageView</a>`
  )

  const event = suid()

  get("/trackEvent", ({ req }) => {
    emit("trackEvent", req, "sample", event)
    return event
  })

  get("/trackPageView", ({ req }) => {
    emit("trackPageView", req, "/" + event)
    return event
  })
})

serve()
