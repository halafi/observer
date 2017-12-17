// @flow

import React, { PureComponent } from 'react'
import Rx from 'rxjs/Rx'

type Job = {
  id: string,
  created_at: string,
  title: string,
  location: string,
  type: string,
}

type State = {
  jobs: ?Array<Job>,
  query: string,
  recommended: ?Job,
}

class Root extends PureComponent<null, State> {
  constructor(props) {
    super(props)
    this.state = {
      query: 'javascript',
      jobs: null,
      recommended: null,
    }
  }

  componentDidMount() {
    // REQUEST STREAMS
    const refreshClickStream = Rx.Observable.fromEvent(
      document.querySelector('#refreshButton'),
      'click',
    )

    const requestStream = refreshClickStream
      .startWith('startup click event')
      .map(() => `https://jobs.github.com/positions.json?search=${this.state.query}`)

    // RESPONSE handling
    const responseStream = requestStream
      .flatMap(requestUrl => Rx.Observable.fromPromise(fetch(requestUrl)))
      .flatMap(response => response.json())
      .catch(err => {
        console.error(err)
      })

    responseStream.subscribe(response => {
      this.setState({
        jobs: response,
      })
    })

    // SUGGESTION handling
    const reloadSuggestionClickStream = Rx.Observable.fromEvent(
      document.querySelector('#hideSuggestionButton'),
      'click',
    )

    const suggestionStream = reloadSuggestionClickStream
      .startWith('startup click') // combine to get suggestion on first response
      .combineLatest(
        responseStream,
        (click, jobs) => jobs[Math.floor(Math.random() * jobs.length)]
      )
      .merge(refreshClickStream.map(() => null)) // clear suggestion on button click

    suggestionStream.subscribe(suggestion => {
      this.setState({
        recommended: suggestion,
      })
    })
  }

  render() {
    const { jobs, query, recommended } = this.state

    return (
      <div className="Root">
        <h1>Job List</h1>
        <div>
          <input
            value={query}
            onChange={ev => this.setState({ query: ev.target.value })}
            type="text"
          />
          <button id="refreshButton">Refresh</button>
        </div>
        <div>
          <h2>Recommended</h2>
          {recommended && (
            <p>
              {recommended.title} in {recommended.location}
            </p>
          )}
          <button id="hideSuggestionButton">Not interested</button>
        </div>
        {jobs && (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Location</th>
                <th>Type</th>
                <th>Created at</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id}>
                  <td>{job.title}</td>
                  <td>{job.location}</td>
                  <td>{job.type}</td>
                  <td>{job.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    )
  }
}

export default Root
