/**
 * Created by sergiovilar on 14/05/14.
 */

/**
 * YoutrackGitlab
 * An integration with GitLab and Youtrack
 *
 * @param config
 * @constructor
 */
var YoutrackGitlab = function (config) {

	// --- Node modules
	var request = require('request');

	// --- Attributes
	var auth = {},
		rules = [],  // Rules must be an array of
		searchOn = 'commit', // may be 'branch' too
		cookie = false;

	//--- Private methods

	/**
	 * Initialize the attributes
	 */
	function init() {

		try {

			// Auth
			if (config.auth) {
				auth = config.auth;
			} else {
				throw new Error('You must specify the auth settings');
			}

			// Rules
			if (config.rules) {
				rules = config.rules;
			} else {
				throw new Error('You must specify the rules');
			}

			// Search On
			if (config.searchOn) {
				searchOn = config.searchOn;
			}

		} catch (e) {
			console.error(e.message);
		}

	}

	/**
	 * Login into Youtrack
	 * @param callback
	 */
	function login(callback) {

		if (!cookie) {

			request.post({
				uri: auth.url + 'user/login',
				headers: {
					'content-type': 'application/x-www-form-urlencoded',
					'accept': 'application/json'
				},
				body: require('querystring').stringify({login: auth.login, password: auth.password})
			}, function (err, res, body) {

				try {

					if (err) {
						throw new Error(err);
					}

					cookie = res.headers['set-cookie'];

					if (callback) {
						callback();
					}

				} catch (e) {
					console.log(e.message);
				}

			});

		} else {
			if (callback) {
				callback();
			}
		}

	}

	/**
	 * Find issue references on merged branches
	 * @param commits
	 */
	function trackBranch(commits) {

		var tasks = [];

		for (var i in commits) {

			var commit = commits[i].message;
			var task_id = false;

			// Check if the commits it's a branch merge
			if (commit.indexOf('Merge branch') > -1) {

				var branchName = commit.split("'")[1];

				if (branchName.indexOf('/') > -1) {
					task_id = branchName.split('/')[branchName.split('/').length - 1];
				} else {
					task_id = branchName;
				}

				tasks.push(task_id);

			}

		}

		if (tasks.length > 0) {

			login(function () {

				for (var i in tasks) {
					checkStatus(tasks[i]);
				}

			});

		}

	}

	/**
	 * Find issue references on commits
	 * @param commits
	 */
	function trackCommit(commits) {

	}

	/**
	 * Check if needs to change the status of the issue
	 * @param task_id
	 */
	function checkStatus(task_id) {

		getIssue(task_id, function(issue){

			var type, state;

			for(var i in issue.field){

				if(issue.field[i].name === 'State'){
					state = issue.field[i].value[0];
				}

				if(issue.field[i].name === 'Type'){
					type = issue.field[i].value[0];
				}

			}

			for(var z in rules){

				// Is on the types specified on the rules
				if(type === rules[z].type){

					for(var y in rules[z].states){

						if(state === rules[z].states[y].begin){
							updateStatus(task_id, rules[z].states[y].final);
						}

					}

				}

			}

		});

	}

	/**
	 * Update the status of an issue
	 * @param task_id
	 * @param state
	 */
	function updateStatus(task_id, state){

		var reqbody = require('querystring').stringify({command: 'State '+state});

		request.post({
			uri: auth.url + 'issue/'+task_id+'/execute',
			headers:{
				'content-type': 'application/x-www-form-urlencoded',
				'accept': 'application/json',
				'cookie': cookie
			},
			body: reqbody
		},function(err, res, body){

			if(err){
				throw new Error(err);
			}

		});

	}

	/**
	 * Get the issue on Youtrack
	 *
	 * @param task_id
	 * @param callback
	 */
	function getIssue(task_id, callback) {

		request.get({
			uri: auth.url + 'issue/' + task_id,
			headers: {
				'accept': 'application/json',
				'cookie': cookie
			}
		}, function (err, res, body) {

			try {

				if (err) {
					throw new Error(err);
				}

				var b = JSON.parse(body);

				if (callback) {
					callback(b);
				}

			} catch (e) {
				console.log(e);
			}

		});

	}

	//--- Public methods

	/**
	 * Track the issues on the repository activity and change the status
	 * @param req
	 */
	this.track = function (req) {

		var commits = req.body.commits;

		switch (searchOn) {
		case 'commit':
			trackCommit(commits);
			break;
		case 'branch':
			trackBranch(commits);
			break;
		}

	};

	init();

}

module.exports = YoutrackGitlab;