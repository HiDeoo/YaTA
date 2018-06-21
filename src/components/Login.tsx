import { AnchorButton, Intent } from '@blueprintjs/core'
import * as React from 'react'

import Center from 'Components/Center'
import Twitch from 'Libs/Twitch'

/**
 * Login Component.
 */
const Login: React.SFC = () => (
  <Center>
    <AnchorButton
      text="Login with Twitch"
      intent={Intent.PRIMARY}
      large
      icon="log-in"
      rightIcon="document-open"
      href={Twitch.getAuthURL().toString()}
    />
  </Center>
)

export default Login
