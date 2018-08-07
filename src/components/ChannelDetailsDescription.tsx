import { Colors, IPanelProps } from '@blueprintjs/core'
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
  border-bottom: 1px solid ${Colors.GRAY3};
  font-size: 0.8rem;
  margin-bottom: 10px;

  &:last-child {
    border-bottom: 0;
  }

  &:last-of-type {
    margin-bottom: 0;
  }

  img {
    margin: 5px 0;
    max-width: 100%;
  }

  h1 {
    font-size: 1.1rem;
    margin: 0 0 10px 0;
  }

  h2 {
    font-size: 1rem;
    margin: 0 0 10px 0;
  }

  h3 {
    font-size: 0.9rem;
    margin: 0 0 10px 0;
  }

  ul {
    padding-left: 25px;
  }
`

/**
 * Content component.
 */
const Content = styled.div`
  margin-top: 10px;
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
          const hasDescription = !_.isNil(panel.html_description) && panel.html_description.length > 0

          let image = hasImage ? <img src={panel.data.image} /> : null

          if (hasLink) {
            image = (
              <a href={panel.data.link} target="_blank">
                {image}
              </a>
            )
          }

          return (
            <Wrapper key={panel._id} onClick={this.onClick}>
              {hasTitle && <div>{panel.data.title}</div>}
              {image}
              {hasDescription && <Content dangerouslySetInnerHTML={{ __html: panel.html_description }} />}
            </Wrapper>
          )
        })}
      </ChannelDetailsPanel>
    )
  }

  /**
   * Triggered when anything in a panel is clicked.
   */
  private onClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof HTMLAnchorElement) {
      const link = event.target.href

      if (link.length > 0) {
        event.preventDefault()

        window.open(link)
      }
    }
  }
}
