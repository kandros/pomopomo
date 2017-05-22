import React from 'react'
import PropTypes from 'prop-types'

const Pomoji = ({count = 1}) => {
  const pomodoros = '🍅'.repeat(count)

  return <span>{pomodoros}</span>
}


Pomoji.propTypes = {
  count: PropTypes.number
}
export default Pomoji