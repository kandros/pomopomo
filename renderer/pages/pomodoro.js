import React from 'react'
import {observable} from 'mobx'
import {Provider, observer} from 'mobx-react'
import 'glamor/reset'
import Ink from 'react-ink'
import {initStore} from '../store'
const store = initStore()
import {defaultPomoTime, pomodoroBarHeight} from '../constants'
import {lighten} from 'polished'
import Pomoji from '../components/pomoji'

const PomodoroTimer = observer(({store}) => {
  global.store = store
  const percentLeft = store.pomoTime / store.maxTime * 100
  return (
    <div>
      <style jsx>{`
        .wrapper {
          box-sizing: border-box;
          -webkit-app-region: drag;
          width: 100%;
          height: ${pomodoroBarHeight}px;
          position: relative;
          //border: 8px solid rgba(255, 255, 255, 0.5);
        }
        .pomodoro-outer {
          background: rgba(255, 255, 255, 0.5);
          width: 100%;
          height: 100%;
        }
        .pomodoro-inner {
          width: 100%;
          height: 100%;
          transition: all .2s;
          position: relative;
        }
        .time-wrapper {

        }
        .time-left {
          position: fixed;
          top: 13px;
          left: 10px;
        }

        .timer-count {
          position: fixed;
          top: 13px;
          right: 10px;
          // color: rgba(255, 255, 255, 0.8);
          color: rgba(0, 0, 0, 0.5);
        }
      `}</style>

      <div className="wrapper">
        <div className="pomodoro-outer"
             onClick={store.start}
        >
          <div
            className="pomodoro-inner"
            style={{
              width: percentLeft + '% ',
              background: store.color
            }}
          >
            <Ink/>
          </div>
        </div>
      </div>
      <div className="time-left" style={{color: lighten(0.3, store.color)}}>{calcTime(store.pomoTime)}</div>
    </div>
  )
})

const calcTime = (time) => {
  const totalSeconds = time
  const minutes = (totalSeconds / 60) >> 0
  const seconds = totalSeconds % 60
  return [minutes, seconds].map(value =>
    String(value < 10 ? '0' + value : value)).join(':')
}

const Debug = observer(({store}) => {
  return (
    <div>
      <div>timer count: {store.timerCount}</div>
      <div>timer type: {store.timerType}</div>
    </div>
  )
})

const CompletedPomodoros = observer(({store}) => {
  return (
    <Pomoji count={store.completedPomodoros}/>
  )
})

const App = () => (
  <Provider>
    <div>
      <PomodoroTimer store={store}/>
      <CompletedPomodoros store={store}/>
      <Debug store={store}/>
    </div>
  </Provider>
)

export default App