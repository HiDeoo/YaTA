declare module 'react-timeago' {
  interface Formatter {
    (value: number, unit?: string, suffix?: string, date?: Date | String | Number): string
  }

  interface TimeAgoProps extends React.HTMLAttributes<TimeAgo> {
    component?: string
    date: Date | String | Number
    live?: boolean
    formatter?: Formatter
  }

  export default class TimeAgo extends React.Component<TimeAgoProps, any> {}
}
