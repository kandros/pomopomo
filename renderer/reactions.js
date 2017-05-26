import {initStore} from './store'
import {reaction} from 'mobx'
import initFirebase from './firebase/init'
import firebase from 'firebase'
import {calcTime} from './utils/time'
import {ipcRenderer} from 'electron'

const store = initStore()
if (!firebase.apps.length) {
  initFirebase()
}

firebase.auth().signInAnonymously().catch(function (error) {
  console.log(error)
})

const db = firebase.database()

const myNameSpace = db.ref('my-namespace')
myNameSpace.set({
  text: 'ciaone'
});

export function initReactions() {
  reaction(
    () => store.completedPomodoros,
    num => console.log(`weeeee, you have completed ${num} pomodoros`)
  )

  reaction(
    () => store.isRunning,
    isRunning => {
      console.log(`pomodoro is running? ${String(isRunning)}`)
      myNameSpace.update({
        ...store,
        timerType: store.timerType,
        running: isRunning,
      })
    }
  )

  // reaction(
  //     ipcRenderer.send('notify', {title: 'pomopomo', body: `pomodoro is running? ${String(isRunning)}`})
  //   () => store.isRunning,
  //   isRunning => {
  //     myNameSpace.update({
  //       ...store,
  //       timerType: store.timerType,
  //       running: isRunning,
  //     })
  //   }
  // )

  reaction(
    () => store.pomoTime,
    (pomoTime) => ipcRenderer.send('update-timer', calcTime(pomoTime))
  )
}
