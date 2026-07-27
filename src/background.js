import { PayhookSession } from '@payhook/extension'
import { API_KEY, TEST_MODE } from './config.js'

// MV3 service workers must register listeners synchronously — no top-level await.
// One headless PayhookSession owns config, pull, unlock, and manage-plan.

const payhook = new PayhookSession()
let ready = null

function syncBadge (entitlement) {
  const active = entitlement?.active === true
  chrome.action.setBadgeText({ text: active ? 'PRO' : '' })
  chrome.action.setBadgeBackgroundColor({ color: '#3a5678' })
}

function ensureReady () {
  if (!ready) {
    ready = payhook
      .config(API_KEY, {
        testMode: TEST_MODE,
        version: chrome.runtime.getManifest().version
      })
      .then((client) => {
        payhook.on('change', syncBadge)
        syncBadge(client.getEntitlement())
        return client
      })
  }
  return ready
}

ensureReady().catch((error) => {
  console.error('Payhook init failed', error)
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.command === 'get-access-state') {
    ensureReady()
      .then(() => payhook.getAccessState())
      .then((state) => sendResponse(state))
      .catch((error) => sendResponse({ error: error?.message }))
    return true
  }

  if (message?.command === 'open-payhook-unlock') {
    ensureReady()
      .then(() => payhook.openUnlock({ waitForClose: false }))
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ error: error?.message }))
    return true
  }

  if (message?.command === 'open-payhook-manage-plan') {
    ensureReady()
      .then(() =>
        payhook.openManagePlan({
          returnUrl: 'https://acme.example',
          waitForClose: false
        })
      )
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ error: error?.message }))
    return true
  }

  return false
})

chrome.runtime.onMessageExternal.addListener((message, _sender, sendResponse) => {
  sendResponse({ ok: true })
  if (
    message?.command === 'payhook:checkout-complete' ||
    message?.command === 'upgraded'
  ) {
    ensureReady()
      .then((client) => client.pull())
      .catch((error) => console.error('checkout-complete pull failed', error))
  }
  return true
})
