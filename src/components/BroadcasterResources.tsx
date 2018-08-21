import { Tab, Tabs } from '@blueprintjs/core'
import * as _ from 'lodash'
import * as pluralize from 'pluralize'
import * as React from 'react'

import BroadcasterSection from 'Components/BroadcasterSection'
import ExternalResource, { Resource, ResourceType } from 'Components/ExternalResource'
import NonIdealState from 'Components/NonIdealState'
import { BroadcasterSectionProps } from 'Containers/BroadcasterOverlay'
import Twitch, { ClipPeriod } from 'Libs/Twitch'
import styled, { theme } from 'Styled'

/**
 * Wrapper component.
 */
const Wrapper = styled.div`
  border: 1px solid ${theme('broadcaster.border')};
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
 * BroadcasterResource component.
 */
const BroadcasterResource = styled(ExternalResource)`
  font-size: 15px;
  padding: 8px;
`

/**
 * Broadcaster resource types.
 */
export enum BroadcasterResourceType {
  Clips = 'Recent Clips',
  Hosts = 'Hosts',
}

/**
 * React State.
 */
const initialState = {
  didFail: false,
  isReady: false,
  [BroadcasterResourceType.Clips]: [] as Resource[],
  [BroadcasterResourceType.Hosts]: [] as Resource[],
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
        type: ResourceType.Clip,
        url: clip.url,
      }))
      const hostResources = _.map(hosts, (host) => ({
        id: host.host_id,
        text: host.host_display_name,
        type: ResourceType.Host,
        url: `https://twitch.tv/${host.host_login}`,
      }))

      this.setState(() => ({
        didFail: false,
        isReady: true,
        [BroadcasterResourceType.Clips]: clipResources,
        [BroadcasterResourceType.Hosts]: hostResources,
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
        <Tabs id="resources">
          {_.map(BroadcasterResourceType, (resource) => {
            const resources = this.state[resource]

            return (
              <Tab
                key={resource}
                id={`resources-${resource}`}
                title={`${resource} (${resources.length})`}
                panel={this.renderResource(resource)}
              />
            )
          })}
        </Tabs>
      </BroadcasterSection>
    )
  }

  /**
   * Renders a specific resource.
   * @param resource - The resource to render.
   * @return Element to render.
   */
  private renderResource(resource: BroadcasterResourceType) {
    const resources = this.state[resource]

    if (resources.length === 0) {
      return (
        <EmptyWrapper>
          <NonIdealState small title={`No ${resource.toLowerCase()} yet!`} />
        </EmptyWrapper>
      )
    }

    return (
      <Wrapper>
        {_.map(resources, (aResource) => (
          <BroadcasterResource key={aResource.id} resource={aResource} divider />
        ))}
      </Wrapper>
    )
  }
}
