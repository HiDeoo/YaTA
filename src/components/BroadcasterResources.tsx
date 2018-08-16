import { Tab, Tabs } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as pluralize from 'pluralize'
import * as React from 'react'
import styled from 'styled-components'

import BroadcasterResource, { Resource } from 'Components/BroadcasterResource'
import BroadcasterSection from 'Components/BroadcasterSection'
import NonIdealState from 'Components/NonIdealState'
import { BroadcasterSectionProps } from 'Containers/BroadcasterOverlay'
import Twitch, { ClipPeriod } from 'Libs/Twitch'
import { color } from 'Utils/styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  border: 1px solid ${color('broadcaster.border')};
  height: 247px;
  overflow-y: auto;
`

/**
 * EmptyWrapper component.
 */
const EmptyWrapper = styled(Wrapper)`
  & > div > div {
    margin-top: 0;
  }
`

/**
 * Available resource types.
 */
export enum ResourceType {
  Clips = 'Recent Clips',
  Hosts = 'Hosts',
}

/**
 * React State.
 */
const initialState = {
  didFail: false,
  isReady: false,
  [ResourceType.Clips]: [] as Resource[],
  [ResourceType.Hosts]: [] as Resource[],
}
type State = Readonly<typeof initialState>

/**
 * BroadcasterResources Component.
 */
export default class BroadcasterResources extends React.Component<BroadcasterSectionProps, State> {
  public state: State = initialState

  /**
   * Lifecycle: componentDidMount.
   */
  public async componentDidMount() {
    try {
      const { channel, channelId } = this.props

      if (_.isNil(channel) || _.isNil(channelId)) {
        throw new Error('Missing channel informations.')
      }

      const response = await Promise.all([
        Twitch.fetchHosts(channelId),
        Twitch.fetchTopClips(channel.name, ClipPeriod.Day, 25),
      ])

      const [{ hosts }, { clips }] = response

      const clipResources = _.map(clips, (clip) => ({
        id: clip.slug,
        meta: `${clip.views.toLocaleString()} ${pluralize('views', clip.views)} - ${clip.curator.display_name}`,
        text: clip.title,
        thumbnail: clip.thumbnails.tiny,
        type: ResourceType.Clips,
        url: clip.url,
      }))
      const hostResources = _.map(hosts, (host) => ({
        id: host.host_id,
        text: host.host_display_name,
        type: ResourceType.Hosts,
        url: `https://twitch.tv/${host.host_login}`,
      }))

      this.setState(() => ({
        didFail: false,
        isReady: true,
        [ResourceType.Clips]: clipResources,
        [ResourceType.Hosts]: hostResources,
      }))
    } catch (error) {
      this.setState(() => ({ didFail: true, isReady: true }))
    }
  }

  /**
   * Renders the component.
   * @return Element to render.
   */
  public render() {
    const { isReady } = this.state

    return (
      <BroadcasterSection title="Miscellaneous" ready={isReady}>
        <Tabs id="lists">
          {_.map(ResourceType, (list) => {
            const resources = this.state[list]

            return (
              <Tab
                key={list}
                id={`lists-${list}`}
                title={`${list} (${resources.length})`}
                panel={this.renderList(list)}
              />
            )
          })}
        </Tabs>
      </BroadcasterSection>
    )
  }

  /**
   * Renders a specific resource.
   * @return Element to render.
   */
  private renderList(list: ResourceType) {
    const resources = this.state[list]

    if (resources.length === 0) {
      return (
        <EmptyWrapper>
          <NonIdealState small title={`No ${list.toLowerCase()} yet!`} />
        </EmptyWrapper>
      )
    }

    return (
      <Wrapper>
        {_.map(resources, (resource) => (
          <BroadcasterResource key={resource.id} resource={resource} />
        ))}
      </Wrapper>
    )
  }
}
