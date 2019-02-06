"use strict";
"use strict";

const _ = require('lodash')
	, bodyParser = require('body-parser')
	, logger = require('morgan')
	, app = require('express')()
	, counts = {}
	, commands = { create, decrement, remove, addResult }
app.use(logger('dev'));
app.use(bodyParser.json());
app.post('/countdown', command);
const server = app.listen(process.env.PORT || 7777, function() {
	console.log('Countdown server listening on port- ' + server.address().port);
});


~function processQueues(counts) {

	_.forEach(counts, (countCfg, id) => {
		const decrementReq = countCfg.queue.shift()
		decrementReq
			&& decrementCount(countCfg, decrementReq)
	})

	setTimeout(() => processQueues(counts), 100)
}(counts)

function decrementCount(countCfg, decrementReq) {
	const next = nextRange(countCfg.count, countCfg.position, decrementReq.size)
	countCfg.position = nextPosition(countCfg.count, countCfg.position, decrementReq.size)
	console.log('decrementCount', {id:countCfg.id, next, nextPosition:countCfg.position})
	decrementReq.res.send(next)
}



/**
 * {command : 'create', id, count} => ok
 *    - creating with an existing id overwrites
 *
 * {command : 'addResult', id, resultId, result} => ok
 *    - creating with an existing id overwrites
 *
 * {command : 'decrement', id} => {size}
 *    - request to decrement the count by size => {empty:true}
 *
 * {command : 'remove', id} => ok
 *    - delete with no counter or items => ok
 */

function command(req, res) {
	console.log('command', req.body, req.body.command)
	const request = req.body

	commands.hasOwnProperty(request.command)
		? commands[req.body.command](request, res)
		: res400(res, {error: 'Invalid command'})
}



function create (command, res) {
	counts[command.id] = {id:command.id, count:command.count, position:0, queue:[]}
	console.log('create', JSON.stringify(counts[command.id], null, 1))
	res200(res)({})
}

function decrement (command, res) {
	counts[command.id]
		? counts[command.id].queue.push({size: command.size, res})
		: res200(res)({empty: true})

}

function nextRange(count, position, size) {
	return position === count
		? { empty: true }
		: { next: {
					start:position,
					end: (position + size >= count)
						? count-1
						: (position + size - 1)
			}}
}

function nextPosition(count, position, size) {
	// console.log('nextDoc', {count, position, size})
	return (position + size < count)
		? position+size
		: count
}


function remove (command, res) {
	delete counts[command.id]
	console.log('remove', JSON.stringify(_.omit(counts[command.id], 'queue'), null, 1))
	res200(res)({})
}



function addResult (command, res) {
	// return db.ref('results/' + command.id + '/' + command.resultId)
	// 	.set(command.result)
	// 	.then(mapObject)
	// 	.then(res200(res))
	// 	.catch(res500(res))
	res200(res)({})
}







function res200(res) {
	return result =>  {
		res.status(200).send(result)
	}
}

function res500(res) {
	return error => {
		res.status(500).send(error)
	}
}

function res400(res, error) {
	res.status(400).send(error)
}