gitlab-webhook-youtrack-js
==========================

A [Gitlab](https://www.gitlab.com/) webhook to change the state of your issues on [Jetbrains Youtrack](http://www.jetbrains.com/youtrack/) based on commits and branch names in merge requests.

### Installing

Just run:

	npm install

### Running the service

Just run:

	node app.js
	
### Configure

First you need to setup your credentials and your Youtrack Path, open the file `routes/index.js` and change the value of `auth`:

```javascript
auth: {
	url: 'http://YOUTRACK_URL/rest/',
	login: 'YOUTRACK_USERNAME',
	password: 'YOUTRACK_PASSWORD'
},
```

#### Rules

You can specify rules for specified types of issues and states, change the `rules` attribute in `routes/index.js`:

```javascript
rules: [
	{
		type: 'Bug',
		states: [
			{begin: 'Submitted', final: 'Fixed'},
			{begin: 'Opened', final: 'Fixed'},
			{begin: 'In progress', final: 'Fixed'}
		]
	},
	{
		type: 'Task',
		states: [
			{begin: 'In progress', final: 'To verify'}					
		]
	}
]
```

The `begin` is the initial state that the issue must be and the `final` is the state that will be changed to.

#### How this detects the issue number?

You can specify in the `routes/index.js` at `searchOn` attribute wheres the webhook will search your issue numbers. The webhook can search in merged branche names or in commit messages.

To search in merged branch names:

	searchOn: 'branches'
	
To search in commit messages:

	searchOn: 'commit'
	
## TODO

- [ ] Implement the detection issue numbers on commit messages