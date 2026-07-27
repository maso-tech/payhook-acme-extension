function sendCommand (command) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ command }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
        return
      }
      if (response?.error) {
        reject(new Error(response.error))
        return
      }
      resolve(response)
    })
  })
}

const inputEl = document.getElementById('input')
const outputEl = document.getElementById('output')
const lockBadge = document.getElementById('lock-state')
const payhookButton = document.getElementById('payhook-button')
const toolButtons = Array.from(document.querySelectorAll('.tool'))

const TOOLS = {
  upper: (s) => s.toUpperCase(),
  reverse: (s) => Array.from(s).reverse().join(''),
  base64: (s) => btoa(unescape(encodeURIComponent(s))),
  slug: (s) => s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
  title: (s) => s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
}

let accessActive = false

function refreshLockState () {
  if (lockBadge) lockBadge.hidden = accessActive
  toolButtons.forEach((btn) => {
    if (btn.dataset.requiresPro !== undefined) {
      btn.dataset.locked = String(!accessActive)
    }
  })
  if (payhookButton) {
    payhookButton.textContent = accessActive ? 'Manage plan' : 'Upgrade to Pro'
  }
}

async function refreshAccess () {
  const state = await sendCommand('get-access-state')
  accessActive = state?.active === true
  refreshLockState()
}

toolButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const requiresPro = btn.dataset.requiresPro !== undefined
    if (requiresPro && !accessActive) return

    const fn = TOOLS[btn.dataset.tool]
    outputEl.value = fn ? fn(inputEl.value || '') : ''
  })
})

payhookButton?.addEventListener('click', async () => {
  try {
    if (accessActive) {
      await sendCommand('open-payhook-manage-plan')
    } else {
      await sendCommand('open-payhook-unlock')
    }
    await refreshAccess()
  } catch (error) {
    console.error(error)
  }
})

refreshAccess().catch((error) => console.error(error))
