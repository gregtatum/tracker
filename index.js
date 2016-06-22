var moment = require('moment')
var minBy = require('lodash.minby')
var onTap = require("@tatumcreative/on-tap")
var DATE_FORMAT = "YYYY/MM/DD"

var key = window.location.hash.substr(1) || "Things"
window.onhashchange = function() {
  window.location.reload(true)
}

;(function main () {
  console.log('Key is: ', key)
  var db = getInitialDB()
  buildTables(db)
})()

function getInitialDB() {
  var db = JSON.parse(localStorage.getItem(key))
  console.log('db:', db)

  // If no database, then create one
  if(!db || db.length === 0) {
    db = []
    var pastTime = moment()
      .subtract(14, 'days')
      .format(DATE_FORMAT)

    updateEntry(db, pastTime, 0)
  }
  return db
}

function buildTables(db) {
  var firstEntry = minBy(db, function(entry) {
    return entry.date
  })

  var container = document.querySelector('.container')
  var rows = document.querySelector('.rows')
  var rowTemplate = document.querySelector('.row-template > .row')
  var date = moment(firstEntry.date, DATE_FORMAT)
  var today = moment()

  // Do some overall work on the template
  document.querySelector('.tracking-thing').innerText = key
  document.querySelector('.container').className += " fadein"

  // Fill in rows
  while (today.diff(date) > 0) {
    console.log(today.diff(date))
    // Add a row
    var row = rowTemplate.cloneNode(true)
    var dateText = date.format(DATE_FORMAT)
    var increaseEl = row.querySelector('.increase')
    var decreaseEl = row.querySelector('.decrease')
    var countEl = row.querySelector('.count')

    row.querySelector('.date-week').innerText = date.format("ddd") + "."
    row.querySelector('.date-day').innerText = date.format("MMM Do")
    rows.insertBefore(row, rows.children[0])

    var existingDate = db.find(function(entry) {
      return entry.date === dateText
    })

    if (existingDate) {
      countEl.innerText = existingDate.count
    }

    addButtonListeners(db, dateText, increaseEl, decreaseEl, countEl)

    date.add(1, 'day')
  }
}

function addButtonListeners (db, dateText, increaseEl, decreaseEl, countEl) {
  onTap(increaseEl, function(howMuch) {
    countEl.innerText = updateEntry(db, dateText, 1)
  })

  onTap(decreaseEl, function() {
    countEl.innerText = updateEntry(db, dateText, -1)
  })
}

function updateEntry(db, dateText, howMuch) {
  // Find an existing entry
  var date = db.find(function(entry) {
    return entry.date === dateText
  })

  // Create a new one if it doesn't exist
  if (!date) {
    date = new entry(dateText, 0)
    db.push(date)
  }

  date.count = Math.max(0, date.count + howMuch)

  if (!(db.length === 1 && db[0].count === 0)) {
    localStorage.setItem(key, JSON.stringify(db))
  }
  return date.count
}

function entry(date, count) {
  this.date = date
  this.count = count
}
