import { IPanelProps } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as React from 'react'
import styled from 'styled-components'

import { ChannelDetailsProps } from 'Components/ChannelDetails'
import ChannelDetailsPanel from 'Components/ChannelDetailsPanel'
import NonIdealState from 'Components/NonIdealState'
import Spinner from 'Components/Spinner'
import Twitch, { RawPanels } from 'Libs/Twitch'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  font-size: 0.8rem;
  margin-bottom: 10px;

  &:last-of-type {
    margin-bottom: 0;
  }

  img {
    max-width: 100%;
  }

  h1 {
    font-size: 1.2rem;
    line-height: 30px;
    margin: 5px 0;
  }

  ul {
    padding-left: 25px;
  }
`

/**
 * React State.
 */
const initialState = { didFail: false, panels: undefined as RawPanels | undefined }
type State = Readonly<typeof initialState>

/**
 * ChannelDetailsVideos Component.
 */
export default class ChannelDetailsVideos extends React.Component<IPanelProps & ChannelDetailsProps, State> {
  public state: State = initialState

  /**
   * Lifecycle: componentDidMount.
   */
  public async componentDidMount() {
    const { channel } = this.props

    if (!_.isNil(channel)) {
      try {
        const panels = await Twitch.fetchPanels(channel)

        this.setState(() => ({ didFail: false, panels }))
      } catch (error) {
        this.setState(() => ({ didFail: true }))
      }
    } else {
      this.setState(() => ({ didFail: true }))
    }
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { didFail, panels } = this.state

    if (didFail) {
      return <NonIdealState small title="Something went wrong!" details="Please try again in a few minutes." />
    }

    if (_.isUndefined(panels)) {
      return <Spinner />
    }

    if (_.isNil(panels) || _.size(panels) === 0) {
      return <NonIdealState small title="Nothing yet!" details="Maybe try again in a while." />
    }

    return (
      <ChannelDetailsPanel>
        {_.map(panels, (panel) => {
          const hasTitle = !_.isNil(panel.data.title)
          const hasImage = !_.isNil(panel.data.image)
          const hasLink = !_.isNil(panel.data.link)
          const hasDescription = !_.isNil(panel.html_description)

          let image = hasImage ? <img src={panel.data.image} /> : null

          if (hasLink) {
            image = (
              <a href={panel.data.link} target="_blank">
                {image}
              </a>
            )
          }

          return (
            <Wrapper key={panel._id}>
              {hasTitle && <div>{panel.data.title}</div>}
              {image}
              {hasDescription && <div dangerouslySetInnerHTML={{ __html: panel.html_description }} />}
            </Wrapper>
          )
        })}
      </ChannelDetailsPanel>
    )
  }
}
