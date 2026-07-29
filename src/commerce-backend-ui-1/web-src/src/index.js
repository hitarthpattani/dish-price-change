/*
 * <license header>
 */

import 'core-js/stable'
import 'regenerator-runtime/runtime'
import ReactDOM from 'react-dom'

import Runtime, { init } from '@adobe/exc-app'

// App is used in JSX below
// eslint-disable-next-line no-unused-vars
import App from './components/App'
import './index.css'

window.React = require('react')
/* Here you can bootstrap your application and configure the integration with the Adobe Experience Cloud Shell */
try {
  // attempt to load the Experience Cloud Runtime
  require('./exc-runtime')
  // if there are no errors, bootstrap the app in the Experience Cloud Shell
  init(bootstrapInExcShell)
} catch (e) {
  console.log('application not running in Adobe Experience Cloud Shell')
  // fallback mode, run the application without the Experience Cloud Runtime
  bootstrapRaw()
}

function renderApplication(runtime, ims, headers) {
  ReactDOM.render(
    <App runtime={runtime} ims={ims} headers={headers} />,
    document.getElementById('root')
  )
}

function bootstrapRaw() {
  /* **here you can mock the exc runtime and ims objects** */
  renderApplication({ on: () => {} }, {}, {})
}

function bootstrapInExcShell() {
  // get the Experience Cloud Runtime object
  const runtime = Runtime()

  // use this to set a favicon
  // runtime.favicon = 'url-to-favicon'

  // use this to respond to clicks on the app-bar title
  // runtime.heroClick = () => window.alert('Did I ever tell you you\'re my hero?')

  // ready event brings in authentication/user info
  runtime.on('ready', ({ imsOrg, imsToken, imsProfile }) => {
    // tell the exc-runtime object we are done
    runtime.done()
    console.log('Ready! received imsProfile:', imsProfile)
    const ims = {
      profile: imsProfile,
      org: imsOrg,
      token: imsToken
    }
    let headers = {
      Authorization: `Bearer ${imsToken}`,
      'x-gw-ims-org-id': imsOrg
    }
    // render the actual react application and pass along the runtime and ims objects to make it available to the App
    renderApplication(runtime, ims, headers)
  })

  // set solution info, shortTitle is used when window is too small to display full title
  runtime.solution = {
    icon: 'AdobeExperienceCloud',
    title: 'HPattaniToolkitDev',
    shortTitle: 'JGR'
  }
  runtime.title = 'HPattaniToolkitDev'
}
