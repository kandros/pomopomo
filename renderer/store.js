import {action, observable, computed, reaction} from 'mobx'
import {defaultPomoTime} from './constants'
import {ipcRenderer} from 'electron'

const time = {
  pomodoro: defaultPomoTime,
  break: 300,
  'long-break': 900
}


const color = {
  pomodoro: '#2e9fff',
  break: '#2cd42c',
  'long-break': '#fadf50'
}

const timerOrder = [
  'pomodoro',
  'break',
  'pomodoro',
  'break',
  'pomodoro',
  'break',
  'pomodoro',
  'long-break'
]

// //https://productivity.stackexchange.com/questions/1171/what-should-i-do-with-my-30min-break-using-the-pomodoro-technique/1172#1172?newreg=1ef2ef53d36b46e988fbf3250c96d593
// The 15-30 minute break is the ideal opportunity to tidy up your desk, take a trip to the coffee machine, listen to voice mail, check incoming emails, or simply rest and do breathing exercises or take a quick walk. The important thing is not to do anything complex, otherwise your mind won’t be able to reorganize and integrate what you’ve learned, and as a result you won’t be able to give the next Pomodoro your best effort. Obviously, during this break too you need to stop thinking about what you did during the last Pomodoros.
//> I always feel I could be doing something really productive with this time.
// You are already being productive when you apply Pomodoro Techniques. That's the point. Read again top paragraph. You should do something in your 30 minutes break, yes, but never say "Oh my god, I'm doing Pomodoro Technique but I must be more productiv in my break times".Purpose of break time is refreshing your brain. So you should ask yourself;

class Store {
  @observable intervalId = null
  @observable timerCount = 6
  @observable pomoTime = time['pomodoro']
  @observable autorun = true
  @observable completedPomodoros = 0

  @computed get isRunning() {
    return Boolean(this.intervalId)
  }

  @computed get maxTime() {
    return time[this.timerType]
  }

  @computed get timerType() {
    return timerOrder[this.timerCount]
  }

  @computed get next() {
    return timerOrder[this.timerCount + 1]
  }

  @computed
  get color() {
    return color[this.timerType]
  }


  @action.bound handleComplete() {
    ipcRenderer.send('notify', {title: 'pomopomo', body: `${this.timerType} completed`})
    if (this.timerType === 'pomodoro') {
      this.completedPomodoros++
    }

    if (this.timerCount < 7) {
      this.timerCount++
    } else {
      this.timerCount = 0
    }

    this.pomoTime = time[this.timerType]
    if (this.autorun) {
      this.start()
    }

  }

  @action start = () => {

    clearInterval(this.intervalId)
    if (this.intervalId) {
      this.intervalId = null
    }

    else {
      const tick = () => {
        if (this.pomoTime > 0)
          --this.pomoTime
        else {
          clearInterval(this.intervalId)
          this.intervalId = null
          this.handleComplete()
        }
      }
      this.intervalId = setInterval(tick, 1000)
    }

  }

  @action stop = () => {
    clearInterval(this.intervalId)
  }

  @action reset = () => {
    this.pomoTime = this.maxTime
    clearInterval(this.intervalId)
  }
}

const store = new Store();
export function initStore() {
  return store
}