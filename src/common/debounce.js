function debounce(fun, wait, flag) {
  let timer = null
  const debounced = function(...params) {
    const self = this
    const arg = params

    clearTimeout(timer)
    if (flag) {
      if (!timer) {
        fun.apply(self, arg)
      }
      timer = setTimeout(function() {
        timer = null
      }, wait)
    } else {
      timer = setTimeout(function() {
        fun.apply(self, arg)
      }, wait)
    }
  }
  debounced.cancel = function() {
    clearTimeout(timer)
    timer = null
  }
  return debounced
}

export default debounce
