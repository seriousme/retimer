'use strict'

const test = require('node:test')
const retimer = require('./')

test('schedule a callback', async function (t) {
  t.plan(1)

  await new Promise(resolve => {
    const start = Date.now()

    retimer(function () {
      t.assert.ok(Date.now() - start >= 50, 'it was deferred ok!')
      resolve()
    }, 50)
  })
})

test('reschedule multiple times', async function (t) {
  t.plan(1)

  await new Promise(resolve => {
    const start = Date.now()

    const timer = retimer(function () {
      t.assert.ok(Date.now() - start >= 90, 'it was deferred ok!')
      resolve()
    }, 50)

    setTimeout(function () {
      timer.reschedule(50)
      setTimeout(function () {
        timer.reschedule(50)
      }, 20)
    }, 20)
  })
})

test('clear a timer', async function (t) {
  t.plan(1)
  await new Promise((resolve) => {
    const timer = retimer(function () {
      t.assert.ok(false, 'the timer should never get called')
    }, 20)

    timer.clear()

    setTimeout(function () {
      t.assert.ok(true, 'nothing happened')
      resolve()
    }, 50)
  })
})

test('clear a timer after a reschedule', async function (t) {
  t.plan(1)
  await new Promise((resolve) => {
    const timer = retimer(function () {
      t.assert.ok(false, 'the timer should never get called')
    }, 20)

    setTimeout(function () {
      timer.reschedule(50)
      setTimeout(function () {
        timer.clear()
      }, 10)
    }, 10)

    setTimeout(function () {
      t.assert.ok(true, 'nothing happened')
      resolve()
    }, 50)
  })
})

test('can be rescheduled early', async function (t) {
  t.plan(1)

  await new Promise((resolve) => {
    const start = Date.now()

    const timer = retimer(function () {
      t.assert.ok(Date.now() - start <= 500, 'it was rescheduled!')
      resolve()
    }, 500)

    setTimeout(function () {
      timer.reschedule(10)
    }, 20)
  })
})

test('can be rescheduled even if the timeout has already triggered', async function (t) {
  t.plan(2)

  await new Promise((resolve) => {
    const start = Date.now()
    let count = 0

    const timer = retimer(function () {
      count++
      if (count === 1) {
        t.assert.ok(Date.now() - start >= 20, 'it was triggered!')
        timer.reschedule(20)
      } else {
        t.assert.ok(Date.now() - start >= 40, 'it was rescheduled!')
        resolve()
      }
    }, 20)
  })
})

test('pass arguments to the callback', async function (t) {
  t.plan(1)

  await new Promise((resolve) => {
    retimer(function (arg) {
      t.assert.equal(arg, 42, 'argument matches')
      resolve()
    }, 50, 42)
  })
})
