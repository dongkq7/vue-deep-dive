class EventBus {
  constructor() {
    this.event = {}
  }

  on(eventName, fn) {
    if (!this.event[eventName]) {
      this.event[eventName] = []
    }
    this.event[eventName].push(fn)
  }

  emit(eventName, data) {
    const fns = this.event[eventName]
    if (!fns || fns.length === 0) {
      return
    }
    fns.forEach(fn => {
      fn(data)
    })
  }
}

const eventBus = new EventBus()
export default eventBus