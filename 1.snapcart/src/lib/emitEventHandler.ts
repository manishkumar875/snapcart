// ✅ FIX #6: Removed unused `import React from 'react'`
// emitEventHandler is a plain async utility — not a React component, no JSX.
// The import caused ESLint errors and added unnecessary bundle weight.

import axios from 'axios'

async function emitEventHandler(event: string, data: any, socketId?: string) {
  try {
    await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER}/notify`, { socketId, event, data })
  } catch (error) {
    console.log(error)
  }
}

export default emitEventHandler
