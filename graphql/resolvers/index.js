const bcrypt = require('bcryptjs');
const Event = require('../../models/event');
const User = require('../../models/user');

const events = eventIds => {
	return Event.find({
			_id: {
				$in: eventIds
			}
		})
		.then(events => {
			return events.map(event => {
				return {
					...event._doc,
					_id: event.id,
					creator: user.bind(this, event.creator)
				}
			});
		})
		.catch(err => {
			throw err
		})
}

const user = userId => {
	return User.findById(userId)
		.then(user => {
			return {
				...user._doc,
				_id: user.id,
				createdEvents: events.bind(this, user._doc.createdEvents)
			};
		})
		.catch(err => {
			throw err;
		});
};

module.exports = {
	events: () => {
		return Event.find()
			.then(events => {
				return events.map(event => {
					return {
						...event._doc,
						_id: event.id,
						creator: user.bind(this, event._doc.creator)
					};
				});
			})
			.catch(err => {
				throw err;
			});
	},
	createEvent: args => {
		const event = new Event({
			title: args.eventInput.title,
			description: args.eventInput.description,
			price: +args.eventInput.price,
			date: new Date().toISOString(),
			creator: '5c6ea577495cbd30a059e1a7'
		});
		let createdEvent;
		return event
			.save()
			.then(result => {
				createdEvent = {
					...result._doc,
					_id: result._doc._id.toString(),
					creator: user.bind(this, result._doc.creator)
				};
				return User.findById('5c6ea577495cbd30a059e1a7');
			})
			.then(user => {
				if (!user) {
					throw new Error('User not found')
				}
				user.createdEvents.push(event);
				return user.save()
			})
			.then(result => {
				return createdEvent;
			})
			.catch(err => {
				console.log(err);
				throw err;
			});

	},
	createUser: args => {
		return User.findOne({
				email: args.userInput.email
			}).then(user => {
				if (user) {
					throw new Error('User exists already..!')
				}
				return bcrypt
					.hash(args.userInput.password, 8)
			}).then(hashedPassword => {
				const user = new User({
					email: args.userInput.email,
					password: hashedPassword
				});
				return user.save();
			})
			.then(result => {
				return {
					...result._doc,
					password: null,
					_id: result.id
				};
			})
			.catch(err => {
				throw err
			})
	}
};